import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PremiumLock from '@/components/ui/PremiumLock'
import Link from 'next/link'
import { Clock, Users, BarChart2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  params: Promise<{ slug: string }>
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('title, description, thumbnail_url')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Recipe not found' }

  return {
    title: data.title,
    description: data.description ?? undefined,
    openGraph: {
      title: data.title,
      description: data.description ?? undefined,
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?\s]+)/)
  return match?.[1] ?? null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

export default async function ReceitaPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, instructors(id, name, slug, avatar_url)')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

  if (!recipe) notFound()

  const [{ data: ingredients }, { data: steps }, { data: nutrition }] = await Promise.all([
    supabase.from('ingredients').select('*').eq('recipe_id', recipe.id).order('sort_order'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', recipe.id).order('step_number'),
    supabase.from('nutrition').select('*').eq('recipe_id', recipe.id).single(),
  ])

  // Check access
  const { data: { user } } = await supabase.auth.getUser()
  let hasAccess = !recipe.is_premium
  if (recipe.is_premium && user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()
    hasAccess = sub?.status === 'active'
  }

  // Video embed
  const videoUrl = recipe.video_url
  let embedSrc: string | null = null
  if (videoUrl && hasAccess) {
    if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
      const id = extractYouTubeId(videoUrl)
      if (id) embedSrc = `https://www.youtube.com/embed/${id}?rel=0`
    } else if (videoUrl.includes('vimeo')) {
      const id = extractVimeoId(videoUrl)
      if (id) embedSrc = `https://player.vimeo.com/video/${id}?byline=0&portrait=0`
    }
  }

  const instructor = Array.isArray(recipe.instructors) ? recipe.instructors[0] : recipe.instructors
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  // schema.org/Recipe JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.thumbnail_url,
    prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
    totalTime: totalTime ? `PT${totalTime}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipe.category,
    nutrition: nutrition
      ? {
          '@type': 'NutritionInformation',
          calories: nutrition.calories ? `${nutrition.calories} calories` : undefined,
          proteinContent: nutrition.protein_g ? `${nutrition.protein_g}g` : undefined,
          carbohydrateContent: nutrition.carbs_g ? `${nutrition.carbs_g}g` : undefined,
          fatContent: nutrition.fat_g ? `${nutrition.fat_g}g` : undefined,
        }
      : undefined,
    recipeIngredient: ingredients?.map((i) =>
      [i.quantity, i.unit, i.name].filter(Boolean).join(' ')
    ),
    recipeInstructions: steps?.map((s) => ({
      '@type': 'HowToStep',
      text: s.description,
    })),
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        {/* Back */}
        <Link
          href="/receitas"
          className="inline-flex items-center gap-1 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          All recipes
        </Link>

        {/* Category + Title */}
        {recipe.category && (
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">{recipe.category}</p>
        )}
        <h1 className="text-2xl md:text-4xl font-semibold text-text mb-4 leading-tight">
          {recipe.title}
        </h1>

        {/* Meta strip */}
        <div className="flex flex-wrap gap-4 md:gap-6 text-text-muted text-sm mb-6">
          {recipe.prep_time && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <div>
                <p className="text-xs text-text-muted">Prep time</p>
                <p className="font-medium text-text">{recipe.prep_time} min</p>
              </div>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <div>
                <p className="text-xs text-text-muted">Cook time</p>
                <p className="font-medium text-text">{recipe.cook_time} min</p>
              </div>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <div>
                <p className="text-xs text-text-muted">Servings</p>
                <p className="font-medium text-text">{recipe.servings}</p>
              </div>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center gap-1.5">
              <BarChart2 size={14} />
              <div>
                <p className="text-xs text-text-muted">Difficulty</p>
                <p className="font-medium text-text">{DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {recipe.thumbnail_url && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <Image
              src={recipe.thumbnail_url}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Premium gate */}
        {recipe.is_premium && !hasAccess && (
          <div className="mb-8">
            <PremiumLock message="This recipe is exclusive to premium members." />
          </div>
        )}

        {hasAccess && (
          <>
            {/* Description */}
            {recipe.description && (
              <p className="text-text-muted leading-relaxed mb-8">{recipe.description}</p>
            )}

            {/* Video */}
            {embedSrc && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-text mb-8">
                <iframe
                  src={embedSrc}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Ingredients */}
              {ingredients && ingredients.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-text mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-text-muted">
                          {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutrition */}
              {nutrition && (
                <div>
                  <h2 className="text-lg font-semibold text-text mb-4">Nutrition information</h2>
                  <div className="bg-surface border border-border rounded-2xl p-4">
                    <p className="text-xs text-text-muted mb-3">Per serving</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
                        { label: 'Protein', value: nutrition.protein_g, unit: 'g' },
                        { label: 'Carbs', value: nutrition.carbs_g, unit: 'g' },
                        { label: 'Fat', value: nutrition.fat_g, unit: 'g' },
                        { label: 'Fiber', value: nutrition.fiber_g, unit: 'g' },
                      ]
                        .filter((n) => n.value != null)
                        .map((n) => (
                          <div key={n.label} className="text-center">
                            <p className="font-semibold text-text">
                              {n.value}
                              <span className="text-xs font-normal text-text-muted ml-0.5">
                                {n.unit}
                              </span>
                            </p>
                            <p className="text-xs text-text-muted">{n.label}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Steps */}
            {steps && steps.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-text mb-6">Preparation</h2>
                <ol className="space-y-6">
                  {steps.map((step) => (
                    <li key={step.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs font-semibold">{step.step_number}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
                        {step.image_url && (
                          <div className="relative aspect-video mt-3 rounded-xl overflow-hidden">
                            <Image
                              src={step.image_url}
                              alt={`Step ${step.step_number}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 600px"
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}

        {/* Instructor */}
        {instructor && (
          <div className="border-t border-border pt-6">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Created by</p>
            <Link
              href={`/instrutores/${instructor.slug}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit"
            >
              {instructor.avatar_url && (
                <img
                  src={instructor.avatar_url}
                  alt={instructor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-text text-sm">{instructor.name}</span>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface Instructor { id: string; name: string }
interface Ingredient { name: string; quantity: string; unit: string }
interface Step { description: string }
interface NutritionData { calories?: number | null; protein_g?: number | null; carbs_g?: number | null; fat_g?: number | null; fiber_g?: number | null }

interface Recipe {
  id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  video_url?: string | null
  prep_time?: number | null
  cook_time?: number | null
  servings?: number | null
  difficulty?: string | null
  category?: string | null
  tags?: string[] | null
  is_premium?: boolean
  instructor_id?: string | null
  published_at?: string | null
}

interface Props {
  action: (formData: FormData) => Promise<void>
  recipe?: Recipe
  instructors: Instructor[]
  initialIngredients?: Ingredient[]
  initialSteps?: Step[]
  initialNutrition?: NutritionData | null
}

const CATEGORIES = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Snack', 'Sobremesa', 'Smoothie', 'Outro']

export default function RecipeForm({ action, recipe, instructors, initialIngredients, initialSteps, initialNutrition }: Props) {
  const [thumbnailUrl, setThumbnailUrl] = useState(recipe?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialIngredients?.length ? initialIngredients : [{ name: '', quantity: '', unit: '' }]
  )
  const [steps, setSteps] = useState<Step[]>(
    initialSteps?.length ? initialSteps : [{ description: '' }]
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('thumbnails').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('thumbnails').getPublicUrl(path)
      setThumbnailUrl(data.publicUrl)
    } catch { alert('Error uploading.') }
    finally { setUploading(false) }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors'
  const labelClass = 'block text-sm font-medium text-text mb-1.5'

  return (
    <form action={action} className="space-y-6">
      {recipe && <input type="hidden" name="id" value={recipe.id} />}

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" type="text" required defaultValue={recipe?.title} className={inputClass} placeholder="Recipe name" />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} defaultValue={recipe?.description ?? ''} className={inputClass} placeholder="Brief description..." />
      </div>

      {/* Thumbnail */}
      <div>
        <label className={labelClass}>Cover image</label>
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
        <div className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors text-center" onClick={() => fileInputRef.current?.click()}>
          {thumbnailUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <div className="py-6">
              {uploading ? <Loader2 size={20} className="animate-spin text-text-muted mx-auto mb-2" /> : <Upload size={20} className="text-text-muted mx-auto mb-2" />}
              <p className="text-text-muted text-sm">Click to upload</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {thumbnailUrl && <button type="button" onClick={() => setThumbnailUrl('')} className="text-xs text-red-500 mt-1 hover:underline">Remove image</button>}
      </div>

      {/* Video URL */}
      <div>
        <label className={labelClass}>Video URL (YouTube or Vimeo)</label>
        <input name="video_url" type="url" defaultValue={recipe?.video_url ?? ''} className={inputClass} placeholder="https://..." />
      </div>

      {/* Times, servings, difficulty, category */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Prep time (min)</label>
          <input name="prep_time" type="number" min="0" defaultValue={recipe?.prep_time ?? ''} className={inputClass} placeholder="15" />
        </div>
        <div>
          <label className={labelClass}>Cook time (min)</label>
          <input name="cook_time" type="number" min="0" defaultValue={recipe?.cook_time ?? ''} className={inputClass} placeholder="30" />
        </div>
        <div>
          <label className={labelClass}>Servings</label>
          <input name="servings" type="number" min="1" defaultValue={recipe?.servings ?? ''} className={inputClass} placeholder="4" />
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select name="difficulty" defaultValue={recipe?.difficulty ?? ''} className={inputClass}>
            <option value="">—</option>
            <option value="beginner">Easy</option>
            <option value="intermediate">Medium</option>
            <option value="advanced">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={recipe?.category ?? ''} className={inputClass}>
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tags</label>
          <input name="tags" type="text" defaultValue={recipe?.tags?.join(', ') ?? ''} className={inputClass} placeholder="healthy, quick, vegetarian" />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className={labelClass}>Ingredients</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input name="ingredient_qty" value={ing.quantity} onChange={e => setIngredients(prev => prev.map((item, j) => j === i ? { ...item, quantity: e.target.value } : item))}
                className="w-16 px-2 py-2 border border-border rounded-lg text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Qty" />
              <input name="ingredient_unit" value={ing.unit} onChange={e => setIngredients(prev => prev.map((item, j) => j === i ? { ...item, unit: e.target.value } : item))}
                className="w-16 px-2 py-2 border border-border rounded-lg text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Unit" />
              <input name="ingredient_name" value={ing.name} onChange={e => setIngredients(prev => prev.map((item, j) => j === i ? { ...item, name: e.target.value } : item))}
                className="flex-1 px-2 py-2 border border-border rounded-lg text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ingredient" />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setIngredients(prev => [...prev, { name: '', quantity: '', unit: '' }])}
          className="flex items-center gap-1 text-primary text-sm mt-2 hover:underline">
          <Plus size={14} /> Add ingredient
        </button>
      </div>

      {/* Steps */}
      <div>
        <label className={labelClass}>Preparation steps</label>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-2.5">
                <span className="text-primary text-xs font-semibold">{i + 1}</span>
              </div>
              <textarea name="step_description" value={step.description}
                onChange={e => setSteps(prev => prev.map((s, j) => j === i ? { description: e.target.value } : s))}
                rows={2} className={`${inputClass} flex-1`} placeholder={`Step ${i + 1}...`} />
              {steps.length > 1 && (
                <button type="button" onClick={() => setSteps(prev => prev.filter((_, j) => j !== i))} className="mt-2.5 text-text-muted hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSteps(prev => [...prev, { description: '' }])}
          className="flex items-center gap-1 text-primary text-sm mt-2 hover:underline">
          <Plus size={14} /> Add step
        </button>
      </div>

      {/* Nutrition */}
      <div>
        <label className={labelClass}>Nutrition information (per serving)</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: 'calories', label: 'Calories', unit: 'kcal', val: initialNutrition?.calories },
            { name: 'protein_g', label: 'Protein', unit: 'g', val: initialNutrition?.protein_g },
            { name: 'carbs_g', label: 'Carbs', unit: 'g', val: initialNutrition?.carbs_g },
            { name: 'fat_g', label: 'Fat', unit: 'g', val: initialNutrition?.fat_g },
            { name: 'fiber_g', label: 'Fiber', unit: 'g', val: initialNutrition?.fiber_g },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs text-text-muted mb-1">{field.label} ({field.unit})</label>
              <input name={field.name} type="number" min="0" step="0.1" defaultValue={field.val ?? ''} className={inputClass} placeholder="0" />
            </div>
          ))}
        </div>
      </div>

      {/* Instructor */}
      {instructors.length > 0 && (
        <div>
          <label className={labelClass}>Instructor</label>
          <select name="instructor_id" defaultValue={recipe?.instructor_id ?? ''} className={inputClass}>
            <option value="">None</option>
            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      )}

      {/* Toggles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="hidden" name="is_premium" value="false" />
          <input type="checkbox" name="is_premium" value="true" defaultChecked={recipe?.is_premium ?? false} className="w-4 h-4 accent-primary" />
          <span className="text-sm text-text">Premium content</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="hidden" name="publish" value="false" />
          <input type="checkbox" name="publish" value="true" defaultChecked={!!recipe?.published_at} className="w-4 h-4 accent-primary" />
          <span className="text-sm text-text">Publish now</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-medium transition-colors">
          {recipe ? 'Save changes' : 'Create recipe'}
        </button>
        <a href="/admin/receitas" className="px-6 py-2.5 border border-border text-text-muted hover:text-text rounded-full text-sm transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}

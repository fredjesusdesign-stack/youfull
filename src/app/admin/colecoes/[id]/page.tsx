import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateCollection, addItemToCollection, removeItemFromCollection } from '../actions'
import CollectionForm from '@/components/admin/CollectionForm'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export default async function EditColecaoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: collection }, { data: items }, { data: videos }, { data: recipes }, { data: posts }] =
    await Promise.all([
      supabase.from('collections').select('*').eq('id', id).single(),
      supabase.from('collection_items').select('id, content_type, content_id, sort_order').eq('collection_id', id).order('sort_order'),
      supabase.from('videos').select('id, title').not('published_at', 'is', null).order('title'),
      supabase.from('recipes').select('id, title').not('published_at', 'is', null).order('title'),
      supabase.from('posts').select('id, title').not('published_at', 'is', null).order('title'),
    ])

  if (!collection) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/colecoes" className="text-text-muted hover:text-text text-sm">← Collections</Link>
        <span className="text-border">/</span>
        <h1 className="text-2xl font-semibold text-text">{collection.title}</h1>
      </div>

      <CollectionForm action={updateCollection} collection={collection} />

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-text mb-4">Collection content</h2>

        {/* Current items */}
        {items && items.length > 0 && (
          <div className="space-y-2 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                <span className="text-xs text-text-muted bg-border px-2 py-0.5 rounded-full capitalize">{item.content_type}</span>
                <span className="flex-1 text-sm text-text truncate">{item.content_id}</span>
                <form action={removeItemFromCollection}>
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="collection_id" value={id} />
                  <button type="submit" className="p-1 text-text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Add item form */}
        <form action={addItemToCollection} className="flex gap-2 flex-wrap">
          <input type="hidden" name="collection_id" value={id} />
          <select name="content_type" className="px-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="video">Video</option>
            <option value="recipe">Recipe</option>
            <option value="post">Post</option>
          </select>
          <select name="content_id" className="flex-1 min-w-48 px-3 py-2 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <optgroup label="Videos">{videos?.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}</optgroup>
            <optgroup label="Recipes">{recipes?.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</optgroup>
            <optgroup label="Posts">{posts?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</optgroup>
          </select>
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
            Add
          </button>
        </form>
      </div>
    </div>
  )
}

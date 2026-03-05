import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteCollection } from './actions'
import { Plus } from 'lucide-react'
import CollectionOrderer from '@/components/admin/CollectionOrderer'

export default async function AdminColecoesPage() {
  const supabase = await createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, is_premium, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">Coleções</h1>
        <Link href="/admin/colecoes/nova" className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          <Plus size={14} /> Nova coleção
        </Link>
      </div>

      {collections && collections.length > 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs text-text-muted mb-4">Arrasta para reordenar</p>
          <CollectionOrderer
            collections={collections.map(c => ({ id: c.id, title: c.title, is_premium: c.is_premium }))}
          />
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          Nenhuma coleção ainda.{' '}
          <Link href="/admin/colecoes/nova" className="text-primary hover:underline">Criar primeira</Link>
        </div>
      )}
    </div>
  )
}

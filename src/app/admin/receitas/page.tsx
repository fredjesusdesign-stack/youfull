import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteRecipe } from './actions'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default async function AdminReceitasPage() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, category, is_premium, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">Receitas</h1>
        <Link href="/admin/receitas/novo" className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          <Plus size={14} /> Nova receita
        </Link>
      </div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Título</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recipes?.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 text-text font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{r.category ?? '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_premium ? 'bg-primary/10 text-primary' : 'bg-green-50 text-green-700'}`}>
                      {r.is_premium ? 'Premium' : 'Gratuita'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs ${r.published_at ? 'text-green-600' : 'text-text-muted'}`}>
                      {r.published_at ? 'Publicada' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/receitas/${r.id}`} className="p-1.5 text-text-muted hover:text-text transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteRecipe}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!recipes || recipes.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Nenhuma receita ainda. <Link href="/admin/receitas/novo" className="text-primary hover:underline">Adicionar primeira receita</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

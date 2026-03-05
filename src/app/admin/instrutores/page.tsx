import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { deleteInstructor } from './actions'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default async function AdminInstrutoresPage() {
  const supabase = await createClient()
  const { data: instructors } = await supabase.from('instructors').select('*').order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">Instrutores</h1>
        <Link href="/admin/instrutores/novo" className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
          <Plus size={14} /> Novo instrutor
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {instructors?.map(inst => (
          <div key={inst.id} className="bg-surface border border-border rounded-2xl p-4 flex items-start gap-3">
            {inst.avatar_url && (
              <img src={inst.avatar_url} alt={inst.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text text-sm truncate">{inst.name}</p>
              {inst.bio && <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{inst.bio}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Link href={`/admin/instrutores/${inst.id}`} className="p-1.5 text-text-muted hover:text-text"><Pencil size={13} /></Link>
              <form action={deleteInstructor}>
                <input type="hidden" name="id" value={inst.id} />
                <button type="submit" className="p-1.5 text-text-muted hover:text-red-500"><Trash2 size={13} /></button>
              </form>
            </div>
          </div>
        ))}
        {(!instructors || instructors.length === 0) && (
          <p className="text-text-muted col-span-3 py-8 text-center">Nenhum instrutor ainda.</p>
        )}
      </div>
    </div>
  )
}

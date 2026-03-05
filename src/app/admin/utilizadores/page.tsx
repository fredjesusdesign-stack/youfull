import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Users' }

// Use service role to bypass RLS for admin queries
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminUtilizadoresPage() {
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: subscriptions } = await adminSupabase
    .from('subscriptions')
    .select('user_id, status, plan, current_period_end')

  const subMap = new Map(subscriptions?.map(s => [s.user_id, s]) ?? [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">Users</h1>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Subscription</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Since</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map(p => {
                const sub = subMap.get(p.id)
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                    <td className="px-4 py-3 text-text font-medium">{p.full_name || '—'}</td>
                    <td className="px-4 py-3 text-text-muted text-sm hidden md:table-cell">{p.email || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.role === 'admin' ? 'bg-red-50 text-red-600' : p.role === 'premium' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted border border-border'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {sub ? (
                        <span className={`text-xs ${sub.status === 'active' ? 'text-green-600' : 'text-text-muted'}`}>
                          {sub.status}
                        </span>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                      {new Date(p.created_at).toLocaleDateString('en-US')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

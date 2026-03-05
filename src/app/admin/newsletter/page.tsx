import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminNewsletterPage() {
  const { data: subs, count } = await adminSupabase
    .from('newsletter_subs')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">Newsletter</h1>
          <p className="text-text-muted text-sm mt-0.5">{count ?? 0} subscritores</p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="px-4 py-2 border border-border text-text hover:bg-surface rounded-full text-sm transition-colors"
        >
          Exportar CSV
        </a>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Email</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {subs?.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 text-text">{s.email}</td>
                  <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))}
              {(!subs || subs.length === 0) && (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-text-muted">Nenhum subscritor ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-semibold text-text block mb-3">
              Youfull
            </Link>
            <p className="text-text-muted leading-relaxed">
              Viver melhor, com mais leveza. Yoga, receitas saudáveis e inspiração para o teu dia.
            </p>
          </div>
          <div>
            <p className="font-medium text-text mb-3">Explorar</p>
            <ul className="space-y-2 text-text-muted">
              <li><Link href="/videos" className="hover:text-text transition-colors">Vídeos</Link></li>
              <li><Link href="/receitas" className="hover:text-text transition-colors">Receitas</Link></li>
              <li><Link href="/blog" className="hover:text-text transition-colors">Blog</Link></li>
              <li><Link href="/colecoes" className="hover:text-text transition-colors">Coleções</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-text mb-3">Conta</p>
            <ul className="space-y-2 text-text-muted">
              <li><Link href="/precos" className="hover:text-text transition-colors">Planos</Link></li>
              <li><Link href="/login" className="hover:text-text transition-colors">Entrar</Link></li>
              <li><Link href="/registo" className="hover:text-text transition-colors">Registar</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-text mb-3">Seguir</p>
            <ul className="space-y-2 text-text-muted">
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-text-muted text-xs">
          © 2026 Youfull. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

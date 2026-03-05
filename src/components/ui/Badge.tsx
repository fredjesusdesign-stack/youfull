interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'premium' | 'free'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-text-muted border-border',
    premium: 'bg-primary/10 text-primary border-primary/20',
    free: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

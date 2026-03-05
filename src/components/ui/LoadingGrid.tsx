export default function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-2xl bg-surface mb-3" />
          <div className="h-2 bg-surface rounded w-1/3 mb-2" />
          <div className="h-3 bg-surface rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

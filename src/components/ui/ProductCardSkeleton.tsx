export default function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-[var(--border)] overflow-hidden bg-[var(--card-bg)]">
      {/* Image skeleton */}
      <div className="aspect-[3/4] skeleton" />
      {/* Content skeleton */}
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-20 rounded mt-3" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

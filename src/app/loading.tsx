export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gold-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gold-500/10 flex items-center justify-center">
            <span className="font-display text-gold-500 font-bold text-xl">P</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-ivory-100 font-semibold text-sm">
            Panchmukhi Balaji
          </p>
          <p className="font-utility text-gold-500 text-xs tracking-widest uppercase animate-pulse-gold">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}

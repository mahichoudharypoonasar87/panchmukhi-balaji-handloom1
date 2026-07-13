import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: "gold" | "crimson" | "green" | "blue";
}

const COLOR_MAP = {
  gold: "bg-gold-500/10 border-gold-500/30 text-gold-500",
  crimson: "bg-crimson-900/10 border-crimson-900/30 text-crimson-400",
  green: "bg-green-500/10 border-green-500/30 text-green-500",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "gold",
}: StatCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-gold-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl border flex items-center justify-center",
            COLOR_MAP[color]
          )}
        >
          <Icon size={20} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-utility font-semibold px-2 py-1 rounded-full",
              trend.positive
                ? "bg-green-500/10 text-green-500"
                : "bg-crimson-900/10 text-crimson-400"
            )}
          >
            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-[var(--foreground)] mb-0.5">
        {value}
      </p>
      <p className="text-[var(--muted)] text-xs font-utility">{title}</p>
    </div>
  );
}

import { TooltipProps } from "recharts";

export const ChartTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-md px-3 py-2 shadow-[var(--shadow-elevated)]">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}
            {p.dataKey === "utilization" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};
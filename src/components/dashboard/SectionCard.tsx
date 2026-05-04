import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const SectionCard = ({ title, subtitle, icon, children, className, action }: Props) => (
  <section
    className={cn(
      "relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 md:p-8",
      "shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30",
      "overflow-hidden",
      className,
    )}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-60"
      style={{ background: "var(--gradient-glow)" }}
    />
    <div className="relative flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="relative">{children}</div>
  </section>
);
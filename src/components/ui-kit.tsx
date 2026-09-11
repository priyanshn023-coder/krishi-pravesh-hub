import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "field-gradient text-primary-foreground shadow-[0_10px_24px_-14px_var(--primary)] hover:brightness-110",
        wheat: "wheat-gradient text-accent-foreground hover:brightness-105",
        outline: "border-2 border-primary/25 bg-card text-foreground hover:bg-primary-soft",
        ghost: "text-foreground hover:bg-surface-strong",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
        quiet: "bg-surface-strong text-foreground hover:brightness-95",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Card({
  className,
  children,
  as: As = "div",
}: {
  className?: string | undefined;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
}) {
  return <As className={cn("card-soft p-5", className)}>{children}</As>;
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode | undefined;
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-surface-strong text-foreground",
        primary: "bg-primary-soft text-primary",
        wheat: "bg-accent-soft text-accent-foreground",
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-accent-foreground",
        danger: "bg-destructive/12 text-destructive",
        info: "bg-info/12 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  tone,
  children,
  className,
}: VariantProps<typeof badgeVariants> & { children: ReactNode; className?: string }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string | undefined;
  tone?: "neutral" | "primary" | "wheat" | "success" | "danger" | undefined;
  icon?: ReactNode | undefined;
}) {
  const toneClass = {
    neutral: "bg-card",
    primary: "bg-primary-soft",
    wheat: "bg-accent-soft",
    success: "bg-success/12",
    danger: "bg-destructive/10",
  }[tone];
  return (
    <div className={cn("rounded-2xl border border-border p-4", toneClass)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-semibold text-foreground">{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-sm text-muted-foreground">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1 block text-sm font-medium text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border-2 border-input bg-card px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20",
        className,
      )}
      {...props}
    />
  );
}

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "demo";
  title?: string | undefined;
  children: ReactNode;
}) {
  const toneClass = {
    info: "border-info/30 bg-info/8",
    warning: "border-warning/40 bg-warning/12",
    demo: "border-accent/50 bg-accent-soft",
  }[tone];
  return (
    <div className={cn("rounded-2xl border-2 p-4 text-sm leading-relaxed", toneClass)}>
      {title ? <p className="mb-1 font-bold text-foreground">{title}</p> : null}
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode | undefined;
  title: string;
  description: string;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="card-soft flex flex-col items-center px-6 py-12 text-center">
      {icon ? (
        <span className="mb-3 grid size-16 place-items-center rounded-3xl bg-surface-strong text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden
    />
  );
}

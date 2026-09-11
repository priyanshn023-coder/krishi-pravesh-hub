import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Globe2, LogOut, Moon, Sprout, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { Badge } from "./ui-kit";
import { Button } from "./ui-kit";
import { usePreferences } from "./preferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function DemoModeStrip() {
  return (
    <div className="no-print bg-accent-soft px-4 py-1.5 text-center text-xs font-bold tracking-wide text-accent-foreground uppercase">
      Demo mode · sample data only · not official government data
    </div>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-2xl field-gradient text-primary-foreground">
        <Sprout className="size-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-extrabold text-foreground">KrishiPravesh</span>
          <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Farmer coordination platform
          </span>
        </span>
      )}
    </Link>
  );
}

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "hi")}>
        <SelectTrigger
          className={cn("h-10 border-border bg-surface-strong shadow-none", compact ? "w-12 px-3" : "w-28")}
          aria-label={t("Select language", "भाषा चुनें")}
        >
          <Globe2 className="size-4 shrink-0" />
          {!compact ? <SelectValue /> : null}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिन्दी</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="quiet"
        size="sm"
        className="size-10 px-0"
        onClick={toggleTheme}
        aria-label={theme === "light" ? t("Use dark mode", "डार्क मोड") : t("Use light mode", "लाइट मोड")}
        title={theme === "light" ? t("Dark mode", "डार्क मोड") : t("Light mode", "लाइट मोड")}
      >
        {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </Button>
    </div>
  );
}

/** Mobile-first farmer shell: big header + thumb-friendly bottom bar. */
export function FarmerShell({
  children,
  nav,
  title,
}: {
  children: ReactNode;
  nav: NavItem[];
  title: string;
}) {
  const { state, logout } = useSmartMandi();
  const { t } = usePreferences();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter(
    (n) => n.recipient_role === "farmer" && !n.read,
  ).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <DemoModeStrip />
      <header className="no-print sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Brand />
          <div className="flex items-center gap-2">
            <PreferenceControls compact />
            <Link
              to="/farmer/notifications"
              className="relative grid size-11 place-items-center rounded-2xl bg-surface-strong text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <Button
              onClick={logout}
              variant="quiet"
              size="sm"
              className="size-11 px-0"
              aria-label={t("Sign out", "साइन आउट")}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto flex max-w-5xl items-stretch justify-between px-2 py-1.5">
          {nav.map((item) => {
            const active =
              item.to === "/farmer"
                ? pathname === "/farmer"
                : pathname.startsWith(item.to);
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors",
                    active ? "bg-primary-soft text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Desktop-first authority shell with a persistent sidebar. */
export function AuthorityShell({
  children,
  nav,
  centreName,
}: {
  children: ReactNode;
  nav: NavItem[];
  centreName: string;
}) {
  const { logout } = useSmartMandi();
  const { t } = usePreferences();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-surface">
      <DemoModeStrip />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="no-print border-b border-border bg-card lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <Brand />
            <Button
              onClick={logout}
              variant="quiet"
              size="sm"
              className="size-10 px-0 lg:hidden"
              aria-label={t("Sign out", "साइन आउट")}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
          <div className="px-4 pb-3">
            <Badge tone="primary">Authority · {centreName}</Badge>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {nav.map((item) => {
              const active =
                item.to === "/authority"
                  ? pathname === "/authority"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface-strong",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border px-4 py-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {t("Preferences", "प्राथमिकताएं")}
            </p>
            <PreferenceControls />
          </div>
          <div className="no-print hidden px-4 py-4 lg:block">
            <Button
              onClick={logout}
              variant="quiet"
              className="w-full justify-start"
            >
              <LogOut className="size-4" /> {t("Sign out", "साइन आउट")}
            </Button>
          </div>
        </aside>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

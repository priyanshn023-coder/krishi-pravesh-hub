import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { CalendarRange, LayoutDashboard, ListOrdered } from "lucide-react";
import { AuthorityShell, type NavItem } from "@/components/shells";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Authority operations — KrishiPravesh" },
      {
        name: "description",
        content:
          "Procurement centre operations: live queue, slots, gate entries, assessment and demo payments.",
      },
      { property: "og:title", content: "Authority operations — KrishiPravesh" },
      {
        property: "og:description",
        content: "Manage slots, queue, assessment and demo payments at a procurement centre.",
      },
    ],
  }),
  component: AuthorityLayout,
});

function AuthorityLayout() {
  const { state } = useSmartMandi();
  const { t } = usePreferences();
  if (!state.profile) return <Navigate to="/login" search={{ role: "authority" }} />;
  if (state.profile.role !== "authority") return <Navigate to="/farmer" />;

  const centre = DEMO_CENTRES[0];
  const nav: NavItem[] = [
    { to: "/authority", label: t("Dashboard", "डैशबोर्ड"), icon: <LayoutDashboard className="size-4" /> },
    { to: "/authority/queue", label: t("Live queue", "लाइव कतार"), icon: <ListOrdered className="size-4" /> },
    { to: "/authority/slots", label: t("Slots", "स्लॉट"), icon: <CalendarRange className="size-4" /> },
  ];

  return (
    <AuthorityShell nav={nav} centreName={centre.name}>
      <Outlet />
    </AuthorityShell>
  );
}

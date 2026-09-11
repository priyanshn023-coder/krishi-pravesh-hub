import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import {
  Bell,
  CalendarRange,
  LayoutDashboard,
  ListOrdered,
  ScanLine,
} from "lucide-react";
import { AuthorityShell, type NavItem } from "@/components/shells";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Centre operations — SmartMandi" },
      {
        name: "description",
        content:
          "Procurement centre operations: live queue, slots, gate entries, assessment and demo payments.",
      },
      { property: "og:title", content: "Centre operations — SmartMandi" },
      {
        property: "og:description",
        content: "Manage slots, queue, assessment and demo payments at a procurement centre.",
      },
    ],
  }),
  component: AuthorityLayout,
});

const NAV: NavItem[] = [
  { to: "/authority", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { to: "/authority/queue", label: "Live queue", icon: <ListOrdered className="size-4" /> },
  { to: "/authority/slots", label: "Slots", icon: <CalendarRange className="size-4" /> },
  { to: "/authority/rfid", label: "RFID gate", icon: <ScanLine className="size-4" /> },
  { to: "/authority/notifications", label: "Notifications", icon: <Bell className="size-4" /> },
];

function AuthorityLayout() {
  const { state } = useSmartMandi();
  if (!state.profile) return <Navigate to="/login" search={{ role: "authority" }} />;
  if (state.profile.role !== "authority") return <Navigate to="/farmer" />;

  const centre =
    DEMO_CENTRES.find((c) => c.id === state.profile?.centre_id) ?? DEMO_CENTRES[0]!;

  return (
    <AuthorityShell nav={NAV} centreName={centre.name}>
      <Outlet />
    </AuthorityShell>
  );
}

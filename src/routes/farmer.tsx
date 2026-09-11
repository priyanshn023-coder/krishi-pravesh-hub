import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home, MapPin, Mic, QrCode, ScrollText } from "lucide-react";
import { FarmerShell, type NavItem } from "@/components/shells";
import { Button, Card } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer")({
  ssr: false,
  component: FarmerLayout,
});

function FarmerLayout() {
  const { state } = useSmartMandi();
  const { t, tr } = usePreferences();

  const nav: NavItem[] = [
    { to: "/farmer", label: tr("home"), icon: <Home className="size-6" /> },
    { to: "/farmer/centres", label: tr("centres"), icon: <MapPin className="size-6" /> },
    { to: "/farmer/booking", label: tr("token"), icon: <QrCode className="size-6" /> },
    { to: "/farmer/voice", label: tr("voice"), icon: <Mic className="size-6" /> },
    { to: "/farmer/records", label: tr("records"), icon: <ScrollText className="size-6" /> },
  ];

  if (!state.profile || state.profile.role !== "farmer") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-sm text-center">
          <h1 className="text-xl font-bold">{t("Please sign in as a farmer", "कृपया किसान के रूप में साइन इन करें")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("You need to sign in to see your dashboard.", "अपना डैशबोर्ड देखने के लिए साइन इन करें।")}
          </p>
          <Link
            to="/login"
            search={{ role: "farmer" as const, mode: "signin" as const }}
            className="mt-4 inline-block"
          >
            <Button size="lg">{tr("signIn")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <FarmerShell nav={nav} title={t("Farmer area", "किसान क्षेत्र")}>
      <Outlet />
    </FarmerShell>
  );
}

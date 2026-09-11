import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home, MapPin, Mic, QrCode, ScrollText } from "lucide-react";
import { FarmerShell } from "@/components/shells";
import { Button, Card } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";

export const Route = createFileRoute("/farmer")({
  ssr: false,
  component: FarmerLayout,
});

const NAV = [
  { to: "/farmer", label: "Home", icon: <Home className="size-6" /> },
  { to: "/farmer/centres", label: "Centres", icon: <MapPin className="size-6" /> },
  { to: "/farmer/booking", label: "Token", icon: <QrCode className="size-6" /> },
  { to: "/farmer/voice", label: "Voice", icon: <Mic className="size-6" /> },
  { to: "/farmer/records", label: "Records", icon: <ScrollText className="size-6" /> },
];

function FarmerLayout() {
  const { state } = useSmartMandi();

  if (!state.profile || state.profile.role !== "farmer") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-sm text-center">
          <h1 className="text-xl font-bold">Please sign in as a farmer</h1>
          <p className="mt-1 text-muted-foreground">
            You need to sign in to see your dashboard.
          </p>
          <Link to="/login" search={{ role: "farmer" as const }} className="mt-4 inline-block">
            <Button size="lg">Sign in</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <FarmerShell nav={NAV} title="Farmer area">
      <Outlet />
    </FarmerShell>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, Sprout } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button, Card, Field, Notice, Spinner, TextInput } from "@/components/ui-kit";
import { DemoModeStrip } from "@/components/shells";
import { supabaseService, DEMO_OTP } from "@/services";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import type { UserRole } from "@/types/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search["role"] === "authority" ? "authority" : "farmer") as UserRole,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SmartMandi" },
      {
        name: "description",
        content:
          "Sign in to SmartMandi with your mobile number as a farmer or as procurement centre staff.",
      },
      { property: "og:title", content: "Sign in — SmartMandi" },
      { property: "og:description", content: "Mobile sign-in for farmers and centre staff." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const { login } = useSmartMandi();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRole = (r: UserRole) => navigate({ to: "/login", search: { role: r } });

  async function sendOtp() {
    setError(null);
    setBusy(true);
    try {
      await supabaseService.requestOtp(phone);
      setStep("otp");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const profile = await supabaseService.verifyOtp(phone, otp, role, name);
      login(profile);
      navigate({ to: role === "farmer" ? "/farmer" : "/authority" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <DemoModeStrip />
      <div className="mx-auto max-w-md px-4 py-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        <h1 className="text-3xl font-extrabold">Sign in to SmartMandi</h1>
        <p className="mt-1 text-muted-foreground">Use your mobile number.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {(
            [
              { key: "farmer", label: "Farmer", icon: <Sprout className="size-6" /> },
              { key: "authority", label: "Centre staff", icon: <Building2 className="size-6" /> },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-base font-bold transition",
                role === r.key
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        <Card className="mt-5 space-y-4">
          {step === "phone" ? (
            <>
              <Field label="Your name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "farmer" ? "e.g. Ramesh Patidar" : "e.g. Centre Officer"}
                  autoComplete="name"
                />
              </Field>
              <Field label="Mobile number" hint="10 digits, no country code">
                <TextInput
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9XXXXXXXXX"
                />
              </Field>
              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
              <Button size="lg" className="w-full" onClick={sendOtp} disabled={busy}>
                {busy ? <Spinner /> : null} Send code
              </Button>
            </>
          ) : (
            <>
              <Field label="Enter the 4-digit code" hint={`Sent to ${phone}`}>
                <TextInput
                  value={otp}
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="text-center text-2xl tracking-[0.5em]"
                />
              </Field>
              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
              <Button size="lg" className="w-full" onClick={verify} disabled={busy}>
                {busy ? <Spinner /> : null} Sign in
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("phone")}>
                Change number
              </Button>
            </>
          )}
        </Card>

        <div className="mt-5">
          <Notice tone="demo" title="Demo sign-in">
            No real OTP is sent. Any 10-digit number works and the code is{" "}
            <strong>{DEMO_OTP}</strong>. This screen is built so Supabase Auth can be
            connected later without changing the UI.
          </Notice>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Clock,
  IndianRupee,
  MapPin,
  Mic,
  QrCode,
  ScanLine,
  Sprout,
  Truck,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui-kit";
import { DemoModeStrip } from "@/components/shells";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartMandi — Book your mandi slot, skip the long line" },
      {
        name: "description",
        content:
          "SmartMandi helps wheat farmers pick the right procurement centre, book a time slot, get a token and QR, and follow gate entry, queue, assessment and payment in one place.",
      },
      { property: "og:title", content: "SmartMandi — Book your mandi slot, skip the long line" },
      {
        property: "og:description",
        content:
          "Compare centres by distance, rate and waiting time. Book a slot, get a token, track your turn.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    n: "1",
    title: "Choose a centre",
    text: "See distance, today's demo rate, free slots and how long the line is.",
    icon: <MapPin className="size-6" />,
  },
  {
    n: "2",
    title: "Book your time",
    text: "Pick a slot, tell us how much wheat you bring, get a token and QR.",
    icon: <QrCode className="size-6" />,
  },
  {
    n: "3",
    title: "Reach and track",
    text: "Gate scan puts you in the queue. Watch your turn, check and payment.",
    icon: <Truck className="size-6" />,
  },
];

const HELPS = [
  { icon: <Clock className="size-5" />, label: "Know your waiting time before you leave home" },
  { icon: <IndianRupee className="size-5" />, label: "Compare wheat rates across nearby centres" },
  { icon: <Mic className="size-5" />, label: "Ask questions by voice, hear the answer back" },
  { icon: <ScanLine className="size-5" />, label: "Gate entry by RFID, no paper chase" },
  { icon: <BadgeCheck className="size-5" />, label: "Photo check of grain before you load" },
  { icon: <ClipboardList className="size-5" />, label: "Printable record at every step" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <DemoModeStrip />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-2xl field-gradient text-primary-foreground">
            <Sprout className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-extrabold">SmartMandi</span>
            <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Wheat procurement coordination
            </span>
          </span>
        </div>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/how-it-works"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-strong"
          >
            How it works
          </Link>
          <Link
            to="/technology"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-strong"
          >
            Technology
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-4 pb-12">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
            <div className="p-6 sm:p-10">
              <Badge tone="wheat">Wheat · Indore, Madhya Pradesh</Badge>
              <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl">
                Stop waiting all day
                <br />
                at the mandi gate.
              </h1>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                SmartMandi tells you which centre to go to, books your time, gives you a
                token, and shows your turn as it moves — in simple words, on your phone.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" search={{ role: "farmer" }}>
                  <Button size="lg" className="w-full sm:w-auto">
                    I am a Farmer <ArrowRight className="size-5" />
                  </Button>
                </Link>
                <Link to="/login" search={{ role: "authority" }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    I run a Centre
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Demo sign-in: any 10-digit mobile number, code <strong>1234</strong>.
              </p>
            </div>

            <div className="relative wheat-gradient p-6 sm:p-10">
              <div className="rounded-3xl bg-card/90 p-5 backdrop-blur">
                <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                  Your token
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">WHT-IND-1025</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-primary-soft p-3">
                    <p className="text-xs font-bold text-primary uppercase">Your place</p>
                    <p className="text-2xl font-extrabold">4th</p>
                  </div>
                  <div className="rounded-2xl bg-surface-strong p-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Wait</p>
                    <p className="text-2xl font-extrabold">54 min</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Turn expected around <strong className="text-foreground">11:40 AM</strong> ·
                  Choithram Procurement Centre
                </p>
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-accent-foreground">
                Sample screen · demo data
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Three steps. That is all.</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="relative pt-8">
              <span className="absolute -top-4 left-5 grid size-11 place-items-center rounded-2xl field-gradient text-xl font-extrabold text-primary-foreground">
                {s.n}
              </span>
              <span className="text-primary">{s.icon}</span>
              <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl bg-primary-soft p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold sm:text-3xl">What you get</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HELPS.map((h) => (
              <li
                key={h.label}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 text-base font-medium"
              >
                <span className="mt-0.5 text-primary">{h.icon}</span>
                {h.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl border-2 border-accent/50 bg-accent-soft p-5 text-sm">
          <p className="font-bold">What SmartMandi is not</p>
          <p className="mt-1 text-foreground/85">
            SmartMandi is a coordination and decision-support platform. It does not replace
            e-NAM or e-Uparjan, it does not issue official government receipts, the rates
            shown here are demo values, the payment flow moves no real money, and photo
            analysis of grain is only early guidance — the centre's physical test decides
            the official quality.
          </p>
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            <Link to="/how-it-works" className="text-primary underline">
              How SmartMandi works
            </Link>
            <Link to="/technology" className="text-primary underline">
              Technology &amp; algorithms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

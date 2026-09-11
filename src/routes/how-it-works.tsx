import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card, Notice } from "@/components/ui-kit";
import { DemoModeStrip } from "@/components/shells";
import { isConfigured, SERVICE_LABELS, type ServiceKey } from "@/services";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How SmartMandi works — system architecture" },
      {
        name: "description",
        content:
          "The SmartMandi architecture: farmer app, external services layer (Supabase, n8n, AI, ML, payment, RFID) and the procurement centre flow from gate to payment.",
      },
      { property: "og:title", content: "How SmartMandi works — system architecture" },
      {
        property: "og:description",
        content: "Farmer app, external services layer and the gate-to-payment centre flow.",
      },
    ],
  }),
  component: HowItWorks,
});

const DIAGRAM = `Farmer
  |
  v
React Web App  (this website)
  |
  v
External Services Layer
  |-- Supabase        (login, database, files, live updates)
  |-- n8n             (automation, SMS/notification workflows)
  |-- AI APIs         (grain photo check, voice assistant)
  |-- ML Prediction   (waiting-time model)
  |-- Payment API     (payment workflow)
  |-- RFID API        (gate reader)
  |
  v
Procurement Centre
  |
  v
Gate -> Queue -> Assessment -> Procurement -> Payment`;

const SERVICE_KEYS: ServiceKey[] = [
  "supabase",
  "n8n",
  "aiVision",
  "voice",
  "queuePrediction",
  "payment",
  "rfid",
];

const EXPLAINED: { title: string; text: string }[] = [
  {
    title: "This website",
    text: "Everything a farmer or centre officer sees. It holds no secret keys and talks only to the services listed below.",
  },
  {
    title: "Supabase",
    text: "Will store logins, farmer profiles, centres, slots, bookings, assessments and payments, and push live queue changes to both dashboards. Not connected yet.",
  },
  {
    title: "n8n",
    text: "Will run background workflows: send SMS reminders, notify on gate entry, and connect other systems. Not connected yet.",
  },
  {
    title: "AI APIs",
    text: "Will analyse the uploaded grain photo and power voice answers. Today the app shows clearly labelled simulated results.",
  },
  {
    title: "ML prediction API",
    text: "Will host a trained regression model that predicts waiting time. Today a transparent demo estimator runs in the browser on synthetic data.",
  },
  {
    title: "Payment API",
    text: "Will carry out the real payment. Today the app only moves a demo payment record through its stages.",
  },
  {
    title: "RFID API",
    text: "Will receive scans from a real reader at the gate. Today an on-screen simulator produces the same payload.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <DemoModeStrip />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        <h1 className="text-3xl font-extrabold sm:text-4xl">How SmartMandi works</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          One website for farmers and centre staff, built to plug into external services
          that are configured separately.
        </p>

        <Card className="mt-6 overflow-x-auto">
          <pre className="text-xs leading-relaxed font-semibold text-foreground sm:text-sm">
            {DIAGRAM}
          </pre>
        </Card>

        <h2 className="mt-8 text-2xl font-extrabold">Connection status</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICE_KEYS.map((k) => {
            const ready = isConfigured(k);
            return (
              <li
                key={k}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span className="text-sm font-semibold">{SERVICE_LABELS[k]}</span>
                <span
                  className={
                    ready
                      ? "rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success"
                      : "rounded-full bg-surface-strong px-3 py-1 text-xs font-bold text-muted-foreground"
                  }
                >
                  {ready ? "Configured" : "Not connected"}
                </span>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-8 text-2xl font-extrabold">Each part in plain words</h2>
        <div className="mt-3 grid gap-3">
          {EXPLAINED.map((e) => (
            <Card key={e.title}>
              <h3 className="text-lg font-bold">{e.title}</h3>
              <p className="mt-1 text-muted-foreground">{e.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Notice tone="warning" title="Honest boundaries">
            SmartMandi coordinates and advises. It is not e-NAM, not e-Uparjan, not an
            official receipt system. Rates, slots, scans, predictions, photo results and
            payments shown in demo mode are sample data.
          </Notice>
        </div>
      </div>
    </div>
  );
}

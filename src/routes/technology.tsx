import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card, Notice } from "@/components/ui-kit";
import { DemoModeStrip } from "@/components/shells";
import { SCORE_WEIGHTS } from "@/lib/recommendation";
import { queuePredictionService } from "@/services";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "Technology & algorithms — SmartMandi" },
      {
        name: "description",
        content:
          "React, TypeScript, Supabase, n8n, computer vision, LLM voice, queue-time regression, centre recommendation scoring, RFID and the booking state machine explained.",
      },
      { property: "og:title", content: "Technology & algorithms — SmartMandi" },
      {
        property: "og:description",
        content: "Every technology and algorithm behind SmartMandi, explained simply.",
      },
    ],
  }),
  component: TechnologyPage,
});

const TECH = [
  { name: "React", role: "Builds every screen you see and updates it instantly." },
  { name: "TypeScript", role: "Describes the shape of every record so mistakes are caught early." },
  {
    name: "Supabase",
    role: "Login, database, file storage and live updates — to be connected externally.",
  },
  { name: "n8n", role: "Background automation and notification workflows — to be connected externally." },
  {
    name: "Computer vision",
    role: "Preliminary wheat image analysis. Guidance only, never the official grade.",
  },
  { name: "LLM", role: "Understands spoken questions and answers with your own booking data." },
  { name: "Machine learning", role: "Regression model that predicts waiting time at a centre." },
  {
    name: "Recommendation algorithm",
    role: "Ranks centres using waiting time, distance, rate, slot availability and operating status.",
  },
  { name: "RFID", role: "Identifies the farmer physically arriving at the gate." },
  {
    name: "State machine",
    role: "booking → arrival → queue → processing → assessment → procurement → payment.",
  },
];

function TechnologyPage() {
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

        <h1 className="text-3xl font-extrabold sm:text-4xl">Technology &amp; algorithms</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          What powers SmartMandi, and exactly what each piece does.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {TECH.map((t) => (
            <Card key={t.name}>
              <h2 className="text-lg font-bold">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-8 text-2xl font-extrabold">Centre recommendation scoring</h2>
        <Card className="mt-3">
          <p className="text-muted-foreground">
            A transparent weighted score — not an AI claim. Each factor is normalised across
            the centres in the list, then combined:
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["Predicted waiting time", SCORE_WEIGHTS.wait],
              ["Distance from you", SCORE_WEIGHTS.distance],
              ["Rate per quintal", SCORE_WEIGHTS.rate],
              ["Slot availability", SCORE_WEIGHTS.slots],
              ["Operating status", SCORE_WEIGHTS.status],
            ].map(([label, w]) => (
              <li
                key={label as string}
                className="flex items-center justify-between rounded-xl bg-surface-strong px-4 py-2 font-semibold"
              >
                <span>{label as string}</span>
                <span>{Math.round((w as number) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <h2 className="mt-8 text-2xl font-extrabold">Waiting-time prediction</h2>
        <Card className="mt-3">
          <p className="text-muted-foreground">
            Target model: <strong>{queuePredictionService.modelName()}</strong> (Gradient
            Boosting Regression is the alternative). Current version:{" "}
            <strong>{queuePredictionService.modelVersion()}</strong>.
          </p>
          <p className="mt-3 font-semibold">Features used</p>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-muted-foreground sm:grid-cols-2">
            <li>current queue length</li>
            <li>arrivals per hour</li>
            <li>active counters</li>
            <li>average processing time</li>
            <li>crop</li>
            <li>time of day</li>
            <li>day of week</li>
            <li>month / season</li>
            <li>historical centre load</li>
            <li>completed farmers today</li>
            <li>farmers currently being processed</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            In demo mode the estimate comes from a transparent formula over synthetic data.
            It is an estimate, not a statistical confidence interval, and the synthetic data
            is not real historical data.
          </p>
        </Card>

        <h2 className="mt-8 text-2xl font-extrabold">Booking state machine</h2>
        <Card className="mt-3 overflow-x-auto">
          <pre className="text-xs leading-relaxed font-semibold sm:text-sm">
{`booked -> arrived -> waiting -> processing -> assessed
      -> procured -> payment_initiated -> payment_processing
      -> payment_completed
(side states: cancelled, no_show)`}
          </pre>
        </Card>

        <div className="mt-8">
          <Notice tone="warning" title="Claims we do not make">
            Image analysis cannot measure moisture and does not decide official quality.
            Simulated RFID is not hardware. Demo payments transfer no money. Demo rates are
            not official live rates.
          </Notice>
        </div>
      </div>
    </div>
  );
}

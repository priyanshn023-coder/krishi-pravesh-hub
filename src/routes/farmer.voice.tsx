import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Mic, MicOff, PhoneCall, Volume2, VolumeX } from "lucide-react";
import { Badge, Button, Card, Notice, SectionTitle } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi, journeyStageFor } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES, DEMO_RATES } from "@/lib/demoData";
import { positionOf, predictFor } from "@/lib/queue";
import { PAYMENT_STATUS_LABEL, timeOf } from "@/lib/format";
import {
  getSpeechRecognitionCtor,
  voiceService,
  type SpeechRecognitionLike,
  type VoiceContext,
} from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/voice")({
  component: VoiceAssistant,
});

const SUGGESTIONS = [
  "What is my token number?",
  "When should I reach?",
  "What is my waiting time?",
  "What is my payment status?",
  "What is the wheat rate?",
  "What happens after gate entry?",
];

type Phase = "idle" | "listening" | "thinking" | "speaking" | "error";

function VoiceAssistant() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) ?? null : null;
  const slot = booking ? state.slots.find((s) => s.id === booking.slot_id) ?? null : null;
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;
  const inQueue = booking?.status === "waiting" || booking?.status === "processing";
  const prediction = booking && centre && inQueue ? predictFor(centre, state.bookings, booking) : null;

  const ctx: VoiceContext = {
    farmerName: state.profile?.full_name ?? "Farmer",
    farmerId: state.farmer.smartmandi_farmer_id,
    tokenNumber: booking?.token_number ?? null,
    centreName: centre?.name ?? null,
    slotLabel: slot ? `${slot.slot_date} ${slot.start_time} to ${slot.end_time}` : null,
    queuePosition: booking && inQueue ? positionOf(state.bookings, booking) : null,
    waitMinutes: prediction?.prediction_minutes ?? null,
    turnTime: prediction ? timeOf(prediction.predicted_turn_time) : null,
    paymentStatusLabel: PAYMENT_STATUS_LABEL[payment?.status ?? "not_started"],
    wheatRate: centre
      ? DEMO_RATES.find((r) => r.centre_id === centre.id)?.rate_per_quintal ?? null
      : null,
    journeyStage: journeyStageFor(booking),
  };

  const respond = useCallback(
    (question: string) => {
      setPhase("thinking");
      setTranscript(question);
      const reply = voiceService.answer(question, ctx);
      setAnswer(reply);
      setPhase("speaking");
      voiceService.speak(reply);
      window.setTimeout(() => setPhase("idle"), Math.min(12000, reply.length * 60));
    },
    [ctx],
  );

  function startListening() {
    setError(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError(
        "This browser cannot listen to the microphone. Please tap one of the questions below instead.",
      );
      setPhase("error");
      return;
    }
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? "";
      if (said) respond(said);
    };
    rec.onerror = () => {
      setError("I could not hear you. Please try again or tap a question.");
      setPhase("error");
    };
    rec.onend = () => {
      setPhase((p) => (p === "listening" ? "idle" : p));
    };
    setPhase("listening");
    rec.start();
  }

  function stopAll() {
    recognitionRef.current?.stop();
    voiceService.stopSpeaking();
    setPhase("idle");
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Mic className="size-5" />}
        title="Voice assistant"
        subtitle="Ask about your token, timing, waiting time, rate or payment."
      />

      <Card className="text-center">
        <button
          onClick={phase === "listening" || phase === "speaking" ? stopAll : startListening}
          className={cn(
            "mx-auto grid size-32 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-lift)] transition",
            phase === "listening"
              ? "animate-pulse bg-destructive"
              : phase === "speaking"
                ? "wheat-gradient text-accent-foreground"
                : "field-gradient",
          )}
          aria-label={phase === "listening" ? "Stop listening" : "Start listening"}
        >
          {phase === "listening" ? (
            <MicOff className="size-12" />
          ) : phase === "speaking" ? (
            <Volume2 className="size-12" />
          ) : (
            <Mic className="size-12" />
          )}
        </button>
        <p className="mt-4 text-lg font-bold">
          {phase === "listening"
            ? "Listening…"
            : phase === "thinking"
              ? "Thinking…"
              : phase === "speaking"
                ? "Speaking…"
                : "Tap the microphone and ask"}
        </p>
        {phase === "speaking" ? (
          <Button variant="quiet" className="mt-3" onClick={stopAll}>
            <VolumeX className="size-4" /> Stop speaking
          </Button>
        ) : null}
        {error ? <p className="mt-3 font-semibold text-destructive">{error}</p> : null}
      </Card>

      {transcript ? (
        <Card>
          <p className="text-sm font-bold text-muted-foreground uppercase">You asked</p>
          <p className="text-lg font-semibold">{transcript}</p>
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase">SmartMandi says</p>
          <p className="text-lg">{answer}</p>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-lg font-bold">Or tap a question</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => respond(q)}
              className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/50 hover:bg-primary-soft"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <PhoneCall className="size-5 text-primary" /> Phone voice assistant
            </h3>
            <p className="text-sm text-muted-foreground">
              Planned: ask the same questions from any basic phone call.
            </p>
          </div>
          <Link to="/farmer/phone-assistant">
            <Button variant="outline">See the plan</Button>
          </Link>
        </div>
      </Card>

      <Notice tone="demo">
        <Badge tone="wheat">Demo</Badge> Answers are built from your SmartMandi booking data
        in this browser. Speech recognition and speaking use your browser. An external
        AI/voice service can be connected later without changing this screen.
      </Notice>
    </div>
  );
}

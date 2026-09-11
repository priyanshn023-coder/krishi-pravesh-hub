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
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/voice")({
  component: VoiceAssistant,
});

type Phase = "idle" | "listening" | "thinking" | "speaking" | "error";

function VoiceAssistant() {
  const { t } = usePreferences();
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const SUGGESTIONS = [
    t("What is my token number?", "मेरा टोकन नंबर क्या है?"),
    t("When should I reach?", "मुझे कब पहुंचना चाहिए?"),
    t("What is my waiting time?", "मेरा प्रतीक्षा समय क्या है?"),
    t("What is my payment status?", "मेरे भुगतान की स्थिति क्या है?"),
    t("What is the wheat rate?", "गेहूं का भाव क्या है?"),
    t("What happens after gate entry?", "गेट पर प्रवेश के बाद क्या होता है?"),
  ];

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
        t(
          "This browser cannot listen to the microphone. Please tap one of the questions below instead.",
          "यह ब्राउज़र माइक्रोफ़ोन नहीं सुन सकता। कृपया नीचे दिए गए किसी प्रश्न पर टैप करें।",
        ),
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
      setError(t("I could not hear you. Please try again or tap a question.", "मैं आपको सुन नहीं पाया। कृपया फिर से प्रयास करें या किसी प्रश्न पर टैप करें।"));
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
        title={t("Voice assistant", "आवाज़ सहायक")}
        subtitle={t(
          "Ask about your token, timing, waiting time, rate or payment.",
          "अपने टोकन, समय, प्रतीक्षा समय, भाव या भुगतान के बारे में पूछें।",
        )}
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
          aria-label={phase === "listening" ? t("Stop listening", "सुनना बंद करें") : t("Start listening", "सुनना शुरू करें")}
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
            ? t("Listening…", "सुन रहा है…")
            : phase === "thinking"
              ? t("Thinking…", "सोच रहा है…")
              : phase === "speaking"
                ? t("Speaking…", "बोल रहा है…")
                : t("Tap the microphone and ask", "माइक्रोफ़ोन पर टैप करें और पूछें")}
        </p>
        {phase === "speaking" ? (
          <Button variant="quiet" className="mt-3" onClick={stopAll}>
            <VolumeX className="size-4" /> {t("Stop speaking", "बोलना बंद करें")}
          </Button>
        ) : null}
        {error ? <p className="mt-3 font-semibold text-destructive">{error}</p> : null}
      </Card>

      {transcript ? (
        <Card>
          <p className="text-sm font-bold text-muted-foreground uppercase">{t("You asked", "आपने पूछा")}</p>
          <p className="text-lg font-semibold">{transcript}</p>
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase">{t("SmartMandi says", "स्मार्टमंडी कहता है")}</p>
          <p className="text-lg">{answer}</p>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-lg font-bold">{t("Or tap a question", "या एक प्रश्न पर टैप करें")}</h3>
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
              <PhoneCall className="size-5 text-primary" /> {t("Phone voice assistant", "फ़ोन आवाज़ सहायक")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Planned: ask the same questions from any basic phone call.",
                "योजना: किसी भी सामान्य फ़ोन कॉल से वही प्रश्न पूछें।",
              )}
            </p>
          </div>
          <Link to="/farmer/phone-assistant">
            <Button variant="outline">{t("See the plan", "योजना देखें")}</Button>
          </Link>
        </div>
      </Card>

      <Notice tone="demo">
        <Badge tone="wheat">{t("Demo", "डेमो")}</Badge>{" "}
        {t(
          "Answers are built from your SmartMandi booking data in this browser. Speech recognition and speaking use your browser. An external AI/voice service can be connected later without changing this screen.",
          "उत्तर इस ब्राउज़र में आपके स्मार्टमंडी बुकिंग डेटा से बनाए जाते हैं। वाणी पहचान और बोलना आपके ब्राउज़र का उपयोग करते हैं। बाहरी AI/आवाज़ सेवा को बाद में इस स्क्रीन को बदले बिना जोड़ा जा सकता है।",
        )}
      </Notice>
    </div>
  );
}

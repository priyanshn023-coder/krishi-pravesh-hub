import { isConfigured } from "./config";

/**
 * Voice assistant adapter.
 *
 * Browser flow: microphone -> speech-to-text (Web Speech API in demo mode)
 * -> assistant answer built from SmartMandi data -> text-to-speech.
 * Later: route recognition + answering to an external AI/voice API.
 */
export interface VoiceContext {
  farmerName: string;
  farmerId: string;
  tokenNumber: string | null;
  centreName: string | null;
  slotLabel: string | null;
  queuePosition: number | null;
  waitMinutes: number | null;
  turnTime: string | null;
  paymentStatusLabel: string;
  wheatRate: number | null;
  journeyStage: string;
}

export interface VoiceServiceContract {
  isReady(): boolean;
  speechRecognitionAvailable(): boolean;
  answer(question: string, ctx: VoiceContext): string;
  speak(text: string): void;
  stopSpeaking(): void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

export function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWindow;
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return (ctor as (new () => SpeechRecognitionLike) | undefined) ?? null;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function has(q: string, ...words: string[]) {
  return words.some((w) => q.includes(w));
}

export const voiceService: VoiceServiceContract = {
  isReady: () => isConfigured("voice"),

  speechRecognitionAvailable: () => getSpeechRecognitionCtor() !== null,

  answer(question, ctx) {
    const q = question.toLowerCase();

    if (has(q, "token")) {
      return ctx.tokenNumber
        ? `Your token number is ${ctx.tokenNumber.split("").join(" ")}. Please show this token at the gate.`
        : "You do not have a booking yet. Open Find Centre and book a slot first.";
    }
    if (has(q, "reach", "when should i", "what time", "slot")) {
      return ctx.slotLabel
        ? `Your slot at ${ctx.centreName} is ${ctx.slotLabel}. Please reach the gate about fifteen minutes early.`
        : "You have not booked a slot yet.";
    }
    if (has(q, "wait", "waiting", "how long", "queue", "position")) {
      if (ctx.waitMinutes == null) return "You are not in the queue right now.";
      const pos = ctx.queuePosition ? `You are number ${ctx.queuePosition} in the queue. ` : "";
      return `${pos}Estimated waiting time is about ${ctx.waitMinutes} minutes${ctx.turnTime ? `, so your turn is expected around ${ctx.turnTime}` : ""}. This is a predicted estimate.`;
    }
    if (has(q, "payment", "money", "paisa", "paid")) {
      return `Your payment status is: ${ctx.paymentStatusLabel}. This is a demo workflow, no real money is transferred.`;
    }
    if (has(q, "rate", "price", "bhav")) {
      return ctx.wheatRate
        ? `The demo wheat rate shown for ${ctx.centreName ?? "your centre"} is ${ctx.wheatRate} rupees per quintal. This is demo data, not an official live rate.`
        : "Please select a centre first to see its demo wheat rate.";
    }
    if (has(q, "after gate", "gate entry", "what happens")) {
      return "After gate entry you join the queue. When your token is called, your wheat is weighed and checked. After procurement is completed, the payment workflow starts.";
    }
    if (has(q, "status", "where am i", "journey")) {
      return `Your current stage is ${ctx.journeyStage}.`;
    }
    if (has(q, "centre", "mandi", "where")) {
      return ctx.centreName
        ? `Your selected centre is ${ctx.centreName}.`
        : "You have not selected a centre yet. Open Find Centre to compare nearby centres.";
    }
    return "I can help with your token, slot timing, waiting time, queue position, payment status, wheat rate, and what happens after gate entry. Please ask one of these.";
  },

  speak(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  },

  stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  },
};

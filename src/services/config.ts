/**
 * Every external service is configured through environment variables only.
 * No secret keys belong in this frontend — server-side keys must live in the
 * external services (Supabase, n8n, ML API, payment gateway) you connect later.
 */

const env = import.meta.env as Record<string, string | undefined>;

export const serviceConfig = {
  supabase: {
    url: env["VITE_SUPABASE_URL"] ?? "",
    publishableKey: env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "",
  },
  aiVision: {
    endpoint: env["VITE_AI_VISION_ENDPOINT"] ?? "",
  },
  voice: {
    endpoint: env["VITE_VOICE_ENDPOINT"] ?? "",
  },
  queuePrediction: {
    endpoint: env["VITE_QUEUE_PREDICTION_ENDPOINT"] ?? "",
  },
  rfid: {
    endpoint: env["VITE_RFID_ENDPOINT"] ?? "",
  },
  payment: {
    endpoint: env["VITE_PAYMENT_ENDPOINT"] ?? "",
  },
  n8n: {
    webhookUrl: env["VITE_N8N_WEBHOOK_URL"] ?? "",
  },
} as const;

export type ServiceKey = keyof typeof serviceConfig;

export function isConfigured(key: ServiceKey): boolean {
  const cfg = serviceConfig[key] as Record<string, string>;
  return Object.values(cfg).every((v) => v.length > 0);
}

/** True when no external credentials exist — the app runs on demo data. */
export const DEMO_MODE = !isConfigured("supabase");

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  supabase: "Supabase (auth, database, storage, realtime)",
  aiVision: "AI Vision API (wheat image analysis)",
  voice: "Voice / LLM API",
  queuePrediction: "ML queue prediction API",
  rfid: "RFID reader gateway",
  payment: "Payment service",
  n8n: "n8n workflow automation",
};

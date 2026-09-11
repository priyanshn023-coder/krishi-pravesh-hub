import { isConfigured, serviceConfig } from "./config";

/**
 * n8n workflow automation adapter.
 * Nothing is sent unless VITE_N8N_WEBHOOK_URL is configured.
 */
export interface N8nServiceContract {
  isReady(): boolean;
  trigger(workflow: string, payload: Record<string, unknown>): Promise<{ sent: boolean }>;
}

export const n8nService: N8nServiceContract = {
  isReady: () => isConfigured("n8n"),

  async trigger(workflow, payload) {
    if (!isConfigured("n8n")) return { sent: false };
    await fetch(serviceConfig.n8n.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow, payload }),
    });
    return { sent: true };
  },
};

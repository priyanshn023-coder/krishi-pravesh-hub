import type { AppNotification, NotificationEvent, UserRole } from "@/types/domain";
import { isConfigured } from "./config";

/**
 * Notification adapter. Today: in-app only.
 * Later: forward the same payload to n8n / SMS / push.
 */
export interface NotificationServiceContract {
  isReady(): boolean;
  build(input: {
    recipient_role: UserRole;
    event: NotificationEvent;
    title: string;
    body: string;
  }): AppNotification;
}

export const notificationService: NotificationServiceContract = {
  isReady: () => isConfigured("n8n"),
  build: ({ recipient_role, event, title, body }) => ({
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recipient_role,
    event,
    title,
    body,
    read: false,
    channel: "in_app",
    created_at: new Date().toISOString(),
  }),
};

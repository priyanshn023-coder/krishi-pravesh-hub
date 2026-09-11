import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Card, EmptyState, Notice, SectionTitle } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { dateTimeOf } from "@/lib/format";

export const Route = createFileRoute("/farmer/notifications")({
  component: FarmerNotifications,
});

function FarmerNotifications() {
  const { state, markNotificationsRead } = useSmartMandi();
  const list = state.notifications.filter((n) => n.recipient_role === "farmer");

  useEffect(() => {
    markNotificationsRead("farmer");
  }, [markNotificationsRead]);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Bell className="size-5" />}
        title="Notifications"
        subtitle="Every update about your booking."
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-8" />}
          title="Nothing yet"
          description="Updates about your slot, gate entry, queue, assessment and payment appear here."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <Card as="li" key={n.id}>
              <p className="text-lg font-bold">{n.title}</p>
              <p className="text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{dateTimeOf(n.created_at)}</p>
            </Card>
          ))}
        </ul>
      )}

      <Notice tone="demo">
        Notifications are shown inside the app only. SMS, WhatsApp or push delivery can be
        added later through n8n without changing this screen.
      </Notice>
    </div>
  );
}

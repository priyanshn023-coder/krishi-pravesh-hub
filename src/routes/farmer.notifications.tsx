import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Card, EmptyState, Notice, SectionTitle } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { dateTimeOf } from "@/lib/format";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/notifications")({
  component: FarmerNotifications,
});

function FarmerNotifications() {
  const { state, markNotificationsRead } = useSmartMandi();
  const { t } = usePreferences();
  const list = state.notifications.filter((n) => n.recipient_role === "farmer");

  useEffect(() => {
    markNotificationsRead("farmer");
  }, [markNotificationsRead]);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Bell className="size-5" />}
        title={t("Notifications", "सूचनाएं")}
        subtitle={t("Every update about your booking.", "आपकी बुकिंग के बारे में हर अपडेट।")}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-8" />}
          title={t("Nothing yet", "अभी कुछ नहीं")}
          description={t(
            "Updates about your slot, gate entry, queue, assessment and payment appear here.",
            "आपके स्लॉट, गेट प्रवेश, कतार, मूल्यांकन और भुगतान के बारे में अपडेट यहां दिखाई देंगे।",
          )}
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
        {t(
          "Notifications are shown inside the app only. SMS, WhatsApp or push delivery can be added later through n8n without changing this screen.",
          "सूचनाएं केवल ऐप के अंदर दिखाई जाती हैं। SMS, WhatsApp या पुश डिलीवरी बाद में n8n के माध्यम से इस स्क्रीन को बदले बिना जोड़ी जा सकती है।",
        )}
      </Notice>
    </div>
  );
}

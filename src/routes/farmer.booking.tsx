import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, QrCode, Timer, Users } from "lucide-react";
import { Badge, Button, Card, EmptyState, Notice, SectionTitle, Stat } from "@/components/ui-kit";
import { QrBlock } from "@/components/QrBlock";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { journeyStageFor, useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { positionOf, predictFor, queueForCentre } from "@/lib/queue";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  friendlyDate,
  minutesLabel,
  timeOf,
} from "@/lib/format";
import { queuePredictionService } from "@/services";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/booking")({
  component: MyBooking,
});

function MyBooking() {
  const { state, cancelBooking } = useSmartMandi();
  const booking = useMyBooking();
  const { t } = usePreferences();

  if (!booking) {
    return (
      <EmptyState
        icon={<QrCode className="size-8" />}
        title={t("You have no token yet", "आपके पास अभी कोई टोकन नहीं है")}
        description={t(
          "Book a slot at a centre and your token and QR will appear here.",
          "किसी केंद्र पर स्लॉट बुक करें और आपका टोकन और QR यहां दिखाई देगा।",
        )}
        action={
          <Link to="/farmer/centres">
            <Button size="lg">{t("Find a centre", "एक केंद्र खोजें")}</Button>
          </Link>
        }
      />
    );
  }

  const centre = DEMO_CENTRES.find((c) => c.id === booking.centre_id)!;
  const slot = state.slots.find((s) => s.id === booking.slot_id);
  const inQueue = booking.status === "waiting" || booking.status === "processing";
  const position = inQueue ? positionOf(state.bookings, booking) : null;
  const prediction = inQueue ? predictFor(centre, state.bookings, booking) : null;
  const queue = queueForCentre(state.bookings, centre.id);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<QrCode className="size-5" />}
        title={t("My token", "मेरा टोकन")}
        subtitle={t("Show this at the gate.", "इसे गेट पर दिखाएं।")}
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> {t("Print", "प्रिंट करें")}
          </Button>
        }
      />

      <Card className="text-center">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {t("SmartMandi Farmer Record · Slot / Token", "स्मार्टमंडी किसान रिकॉर्ड · स्लॉट / टोकन")}
        </p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">{booking.token_number}</p>
        <Badge tone={BOOKING_STATUS_TONE[booking.status]} className="mt-2">
          {BOOKING_STATUS_LABEL[booking.status]}
        </Badge>
        <div className="mt-4 flex justify-center">
          <QrBlock data={booking.qr_data} />
        </div>
        <dl className="mx-auto mt-4 grid max-w-sm gap-1 text-left text-sm">
          <Row k={t("Farmer", "किसान")} v={state.profile?.full_name ?? "—"} />
          <Row k={t("SmartMandi ID", "स्मार्टमंडी आईडी")} v={state.farmer.smartmandi_farmer_id} />
          <Row k={t("Centre", "केंद्र")} v={centre.name} />
          <Row k={t("Crop", "फसल")} v={t("Wheat", "गेहूं")} />
          <Row
            k={t("Slot", "स्लॉट")}
            v={slot ? `${friendlyDate(slot.slot_date)} · ${slot.start_time}–${slot.end_time}` : "—"}
          />
          <Row
            k={t("Expected quantity", "अनुमानित मात्रा")}
            v={`${booking.expected_quantity_quintal} ${t("quintal", "क्विंटल")}`}
          />
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          {t(
            "SmartMandi Farmer Record — not an official government receipt.",
            "स्मार्टमंडी किसान रिकॉर्ड — आधिकारिक सरकारी रसीद नहीं है।",
          )}
        </p>
      </Card>

      {inQueue ? (
        <Card>
          <h3 className="text-xl font-extrabold">{t("Your turn", "आपकी बारी")}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat
              label={t("Place in line", "कतार में स्थान")}
              value={position ?? "—"}
              icon={<Users className="size-4" />}
              tone="primary"
            />
            <Stat
              label={t("People in queue", "कतार में लोग")}
              value={queue.length}
              hint={t(`${centre.active_counters} counters open`, `${centre.active_counters} काउंटर खुले हैं`)}
            />
            <Stat
              label={t("Estimated wait", "अनुमानित प्रतीक्षा")}
              value={prediction ? minutesLabel(prediction.prediction_minutes) : "—"}
              icon={<Timer className="size-4" />}
              tone="wheat"
            />
            <Stat
              label={t("Turn expected", "बारी अनुमानित")}
              value={prediction ? timeOf(prediction.predicted_turn_time) : "—"}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              `Prediction model: ${queuePredictionService.modelName()} · ${queuePredictionService.modelVersion()}. This is an estimate from demo data, not a guarantee.`,
              `भविष्यवाणी मॉडल: ${queuePredictionService.modelName()} · ${queuePredictionService.modelVersion()}। यह डेमो डेटा से एक अनुमान है, गारंटी नहीं।`,
            )}
          </p>
        </Card>
      ) : (
        <Notice tone="info" title={t("Not in the queue yet", "अभी कतार में नहीं")}>
          {t(
            "Your place in line and waiting time appear after your arrival is scanned at the gate.",
            "गेट पर आपका आगमन स्कैन होने के बाद कतार में स्थान और प्रतीक्षा समय दिखाई देगा।",
          )}
        </Notice>
      )}

      <Card>
        <h3 className="text-xl font-extrabold">{t("Your journey", "आपकी यात्रा")}</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("Current stage:", "वर्तमान चरण:")} <strong>{journeyStageFor(booking)}</strong>
        </p>
        <JourneyTimeline current={journeyStageFor(booking)} />
      </Card>

      {booking.status === "booked" ? (
        <Button
          variant="danger"
          className="no-print w-full"
          onClick={() => cancelBooking(booking.id)}
        >
          {t("Cancel this booking", "यह बुकिंग रद्द करें")}
        </Button>
      ) : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

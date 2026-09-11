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

export const Route = createFileRoute("/farmer/booking")({
  component: MyBooking,
});

function MyBooking() {
  const { state, cancelBooking } = useSmartMandi();
  const booking = useMyBooking();

  if (!booking) {
    return (
      <EmptyState
        icon={<QrCode className="size-8" />}
        title="You have no token yet"
        description="Book a slot at a centre and your token and QR will appear here."
        action={
          <Link to="/farmer/centres">
            <Button size="lg">Find a centre</Button>
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
        title="My token"
        subtitle="Show this at the gate."
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        }
      />

      <Card className="text-center">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          SmartMandi Farmer Record · Slot / Token
        </p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">{booking.token_number}</p>
        <Badge tone={BOOKING_STATUS_TONE[booking.status]} className="mt-2">
          {BOOKING_STATUS_LABEL[booking.status]}
        </Badge>
        <div className="mt-4 flex justify-center">
          <QrBlock data={booking.qr_data} />
        </div>
        <dl className="mx-auto mt-4 grid max-w-sm gap-1 text-left text-sm">
          <Row k="Farmer" v={state.profile?.full_name ?? "—"} />
          <Row k="SmartMandi ID" v={state.farmer.smartmandi_farmer_id} />
          <Row k="Centre" v={centre.name} />
          <Row k="Crop" v="Wheat" />
          <Row
            k="Slot"
            v={slot ? `${friendlyDate(slot.slot_date)} · ${slot.start_time}–${slot.end_time}` : "—"}
          />
          <Row k="Expected quantity" v={`${booking.expected_quantity_quintal} quintal`} />
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          SmartMandi Farmer Record — not an official government receipt.
        </p>
      </Card>

      {inQueue ? (
        <Card>
          <h3 className="text-xl font-extrabold">Your turn</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat
              label="Place in line"
              value={position ?? "—"}
              icon={<Users className="size-4" />}
              tone="primary"
            />
            <Stat
              label="People in queue"
              value={queue.length}
              hint={`${centre.active_counters} counters open`}
            />
            <Stat
              label="Estimated wait"
              value={prediction ? minutesLabel(prediction.prediction_minutes) : "—"}
              icon={<Timer className="size-4" />}
              tone="wheat"
            />
            <Stat
              label="Turn expected"
              value={prediction ? timeOf(prediction.predicted_turn_time) : "—"}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Prediction model: {queuePredictionService.modelName()} ·{" "}
            {queuePredictionService.modelVersion()}. This is an estimate from demo data, not a
            guarantee.
          </p>
        </Card>
      ) : (
        <Notice tone="info" title="Not in the queue yet">
          Your place in line and waiting time appear after your arrival is scanned at the
          gate.
        </Notice>
      )}

      <Card>
        <h3 className="text-xl font-extrabold">Your journey</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Current stage: <strong>{journeyStageFor(booking)}</strong>
        </p>
        <JourneyTimeline current={journeyStageFor(booking)} />
      </Card>

      {booking.status === "booked" ? (
        <Button
          variant="danger"
          className="no-print w-full"
          onClick={() => cancelBooking(booking.id)}
        >
          Cancel this booking
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

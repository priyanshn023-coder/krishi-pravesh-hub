import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  IndianRupee,
  MapPin,
  Mic,
  QrCode,
  ScrollText,
  Timer,
  UserRound,
  Users,
  CalendarPlus,
} from "lucide-react";
import { Badge, Card, EmptyState, Stat } from "@/components/ui-kit";
import { Button } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi, journeyStageFor } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES, DEMO_RATES } from "@/lib/demoData";
import { positionOf, predictFor } from "@/lib/queue";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  friendlyDate,
  minutesLabel,
  PAYMENT_STATUS_LABEL,
  rupees,
  timeOf,
} from "@/lib/format";

export const Route = createFileRoute("/farmer/")({
  component: FarmerDashboard,
});

const ACTIONS = [
  { to: "/farmer/centres", label: "Find Centre", icon: <MapPin className="size-7" /> },
  { to: "/farmer/centres", label: "Book Slot", icon: <CalendarPlus className="size-7" /> },
  { to: "/farmer/booking", label: "My Booking", icon: <QrCode className="size-7" /> },
  { to: "/farmer/crop-check", label: "AI Crop Check", icon: <Camera className="size-7" /> },
  { to: "/farmer/voice", label: "Voice Assistant", icon: <Mic className="size-7" /> },
  { to: "/farmer/records", label: "My Records", icon: <ScrollText className="size-7" /> },
  { to: "/farmer/payment", label: "Payment", icon: <IndianRupee className="size-7" /> },
  { to: "/farmer/profile", label: "Profile", icon: <UserRound className="size-7" /> },
] as const;

function FarmerDashboard() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) : null;
  const slot = booking ? state.slots.find((s) => s.id === booking.slot_id) : null;
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;
  const inQueue = booking && (booking.status === "waiting" || booking.status === "processing");
  const position = booking && inQueue ? positionOf(state.bookings, booking) : null;
  const prediction = booking && centre && inQueue ? predictFor(centre, state.bookings, booking) : null;
  const rate = centre
    ? DEMO_RATES.find((r) => r.centre_id === centre.id)?.rate_per_quintal
    : null;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl field-gradient p-5 text-primary-foreground">
        <p className="text-sm font-semibold opacity-80">Namaste</p>
        <h2 className="text-3xl font-extrabold">{state.profile?.full_name}</h2>
        <div className="mt-3 inline-flex flex-col rounded-2xl bg-card/15 px-4 py-2 backdrop-blur">
          <span className="text-[11px] font-bold tracking-wide uppercase opacity-80">
            SmartMandi Farmer ID
          </span>
          <span className="text-lg font-extrabold">{state.farmer.smartmandi_farmer_id}</span>
        </div>
      </section>

      {booking && centre ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Your booking</p>
              <h3 className="text-2xl font-extrabold">{booking.token_number}</h3>
              <p className="text-muted-foreground">{centre.name} · Wheat</p>
            </div>
            <Badge tone={BOOKING_STATUS_TONE[booking.status]}>
              {BOOKING_STATUS_LABEL[booking.status]}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat
              label="Slot"
              value={slot ? `${slot.start_time}` : "—"}
              hint={slot ? `${friendlyDate(slot.slot_date)} · till ${slot.end_time}` : undefined}
              tone="wheat"
            />
            <Stat
              label="Your place in line"
              value={position ? `${position}` : "—"}
              hint={inQueue ? "Updates live" : "Not in queue yet"}
              icon={<Users className="size-4" />}
            />
            <Stat
              label="Waiting time"
              value={prediction ? minutesLabel(prediction.prediction_minutes) : "—"}
              hint={prediction ? "Predicted estimate" : "Available after gate entry"}
              icon={<Timer className="size-4" />}
              tone="primary"
            />
            <Stat
              label="Turn expected"
              value={prediction ? timeOf(prediction.predicted_turn_time) : "—"}
              hint={rate ? `Demo rate ${rupees(rate)}/qtl` : undefined}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-strong p-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Right now</p>
              <p className="text-lg font-bold">{journeyStageFor(booking)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-muted-foreground">Payment</p>
              <p className="text-lg font-bold">
                {PAYMENT_STATUS_LABEL[payment?.status ?? "not_started"]}
              </p>
            </div>
          </div>

          <Link to="/farmer/booking" className="mt-4 block">
            <Button size="lg" className="w-full">
              Open my token &amp; journey
            </Button>
          </Link>
        </Card>
      ) : (
        <EmptyState
          icon={<MapPin className="size-8" />}
          title="No booking yet"
          description="Find a nearby centre, compare rate and waiting time, and book your slot."
          action={
            <Link to="/farmer/centres">
              <Button size="lg">Find a centre</Button>
            </Link>
          }
        />
      )}

      <section>
        <h3 className="mb-3 text-xl font-extrabold">What do you want to do?</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center text-sm font-bold shadow-[var(--shadow-soft)] transition hover:bg-primary-soft"
            >
              <span className="text-primary">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

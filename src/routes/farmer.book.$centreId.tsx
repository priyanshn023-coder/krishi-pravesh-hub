import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Wheat } from "lucide-react";
import { Badge, Button, Card, Field, Notice, SectionTitle, TextInput } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES, DEMO_RATES, WHEAT } from "@/lib/demoData";
import { friendlyDate, rupees } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/book/$centreId")({
  component: BookSlot,
});

function BookSlot() {
  const { centreId } = Route.useParams();
  const navigate = useNavigate();
  const { state, createBooking } = useSmartMandi();

  const centre = DEMO_CENTRES.find((c) => c.id === centreId);
  const rate = DEMO_RATES.find((r) => r.centre_id === centreId)?.rate_per_quintal ?? 0;

  const slots = useMemo(
    () =>
      state.slots
        .filter((s) => s.centre_id === centreId && s.crop_id === WHEAT.id)
        .sort((a, b) =>
          `${a.slot_date}${a.start_time}`.localeCompare(`${b.slot_date}${b.start_time}`),
        ),
    [state.slots, centreId],
  );

  const dates = useMemo(() => [...new Set(slots.map((s) => s.slot_date))], [slots]);
  const [date, setDate] = useState(dates[0] ?? "");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("20");
  const [error, setError] = useState<string | null>(null);

  if (!centre) {
    return (
      <Card>
        <p className="font-bold">Centre not found.</p>
        <Link to="/farmer/centres" className="mt-3 inline-block">
          <Button>Back to centres</Button>
        </Link>
      </Card>
    );
  }

  const daySlots = slots.filter((s) => s.slot_date === date);
  const chosen = slots.find((s) => s.id === slotId) ?? null;
  const qty = Number(quantity);

  function confirm() {
    setError(null);
    if (!chosen) return setError("Please choose a slot.");
    if (!qty || qty <= 0) return setError("Enter how much wheat you will bring.");
    if (qty > 500) return setError("Please enter a quantity up to 500 quintal.");
    const booking = createBooking({ centreId, slotId: chosen.id, quantity: qty });
    if (booking) navigate({ to: "/farmer/booking" });
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Wheat className="size-5" />}
        title={`Book a slot at ${centre.name}`}
        subtitle={`${centre.centre_type} · ${centre.city} · open ${centre.operating_hours}`}
      />

      <Card>
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Step 1 · Crop
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-primary bg-primary-soft p-4">
          <Wheat className="size-7 text-primary" />
          <div>
            <p className="text-lg font-extrabold">Wheat (गेहूँ)</p>
            <p className="text-sm text-muted-foreground">Demo rate {rupees(rate)} per quintal</p>
          </div>
          <CheckCircle2 className="ml-auto size-6 text-primary" />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Step 2 · Day
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDate(d);
                setSlotId(null);
              }}
              className={cn(
                "shrink-0 rounded-2xl border-2 px-5 py-3 text-base font-bold",
                date === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card",
              )}
            >
              {friendlyDate(d)}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Step 3 · Time slot
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {daySlots.map((s) => {
            const remaining = s.capacity - s.booked_count;
            const full = remaining <= 0 || s.status === "closed";
            return (
              <li key={s.id}>
                <button
                  disabled={full}
                  onClick={() => setSlotId(s.id)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-4 text-left transition disabled:opacity-50",
                    slotId === s.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <p className="text-lg font-extrabold">
                    {s.start_time} – {s.end_time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacity {s.capacity} · booked {s.booked_count} ·{" "}
                    <strong className={full ? "text-destructive" : "text-success"}>
                      {full ? "full" : `${remaining} left`}
                    </strong>
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {daySlots.length === 0 ? (
          <p className="mt-2 text-muted-foreground">No slots for this day.</p>
        ) : null}
      </Card>

      <Card>
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Step 4 · Quantity
        </p>
        <div className="mt-2">
          <Field label="How much wheat will you bring? (quintal)">
            <TextInput
              value={quantity}
              inputMode="decimal"
              onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
        </div>
        {qty > 0 && rate > 0 ? (
          <p className="mt-2 text-muted-foreground">
            At the demo rate that is about{" "}
            <strong className="text-foreground">{rupees(Math.round(qty * rate))}</strong>. Final
            amount depends on the centre's official weighing and quality check.
          </p>
        ) : null}
      </Card>

      {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}

      <div className="sticky bottom-24 z-10">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">You are booking</p>
            <p className="font-bold">
              {chosen
                ? `${friendlyDate(chosen.slot_date)} · ${chosen.start_time}–${chosen.end_time}`
                : "Choose a slot above"}
            </p>
          </div>
          <Button size="lg" onClick={confirm} disabled={!chosen}>
            Confirm &amp; get token
          </Button>
        </Card>
      </div>

      <Notice tone="demo">
        <Badge tone="wheat">Demo</Badge> Booking is stored on this device only. When
        Supabase is connected, the same screen will write to the real database.
      </Notice>
    </div>
  );
}

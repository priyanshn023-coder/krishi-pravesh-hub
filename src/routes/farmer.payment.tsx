import { createFileRoute, Link } from "@tanstack/react-router";
import { IndianRupee, Printer } from "lucide-react";
import { Badge, Button, Card, EmptyState, Notice, SectionTitle, Stat } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { dateTimeOf, PAYMENT_STATUS_LABEL, rupees } from "@/lib/format";
import { PAYMENT_DISCLAIMER } from "@/services";

export const Route = createFileRoute("/farmer/payment")({
  component: FarmerPayment,
});

const STEPS = ["initiated", "processing", "completed"] as const;

function FarmerPayment() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;
  const assessment = booking
    ? state.assessments.find((a) => a.booking_id === booking.id)
    : null;
  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) : null;

  if (!booking || !payment) {
    return (
      <EmptyState
        icon={<IndianRupee className="size-8" />}
        title="No payment yet"
        description="Payment starts after the centre completes your quality check and procurement."
        action={
          <Link to="/farmer/booking">
            <Button size="lg">See my booking</Button>
          </Link>
        }
      />
    );
  }

  const stepIndex = STEPS.indexOf(payment.status as (typeof STEPS)[number]);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<IndianRupee className="size-5" />}
        title="Payment"
        subtitle="Track your demo payment from start to finish."
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        }
      />

      <Card>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          SmartMandi Farmer Record · Payment
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-2xl font-extrabold">{payment.reference}</p>
          <Badge tone={payment.status === "completed" ? "success" : "wheat"}>
            {PAYMENT_STATUS_LABEL[payment.status]}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Amount" value={rupees(payment.amount)} tone="primary" />
          <Stat label="Rate used" value={`${rupees(payment.rate_per_quintal)}/qtl`} />
          <Stat label="Net quantity" value={`${payment.net_quantity_quintal} qtl`} />
          <Stat label="Token" value={booking.token_number} />
        </div>

        <ol className="mt-5 space-y-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={
                i <= stepIndex
                  ? "flex items-center gap-3 rounded-xl bg-primary-soft p-3 font-bold text-primary"
                  : "flex items-center gap-3 rounded-xl bg-surface-strong p-3 text-muted-foreground"
              }
            >
              <span className="grid size-7 place-items-center rounded-full bg-card text-sm font-bold">
                {i + 1}
              </span>
              Payment {s}
            </li>
          ))}
        </ol>

        <dl className="mt-5 grid gap-1 text-sm">
          <Row k="Centre" v={centre?.name ?? "—"} />
          <Row k="Farmer" v={state.profile?.full_name ?? "—"} />
          <Row k="SmartMandi ID" v={state.farmer.smartmandi_farmer_id} />
          <Row k="Bank account" v={state.farmer.bank_account_masked ?? "Not added"} />
          <Row
            k="Net weight"
            v={assessment ? `${assessment.net_weight_kg} kg` : "From centre assessment"}
          />
          <Row k="Last update" v={dateTimeOf(payment.updated_at)} />
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          SmartMandi Farmer Record — not an official government receipt.
        </p>
      </Card>

      <Notice tone="warning" title="Important">
        {PAYMENT_DISCLAIMER} The real transfer will be handled by the procurement
        department's own payment system.
      </Notice>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

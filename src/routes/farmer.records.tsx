import { createFileRoute } from "@tanstack/react-router";
import { Printer, ScrollText } from "lucide-react";
import { Button, Card, EmptyState, Notice, SectionTitle } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { dateTimeOf, friendlyDate, rupees } from "@/lib/format";

export const Route = createFileRoute("/farmer/records")({
  component: Records,
});

function Records() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) : null;
  const slot = booking ? state.slots.find((s) => s.id === booking.slot_id) : null;
  const gate = booking ? state.gateEntries.find((g) => g.booking_id === booking.id) : null;
  const assessment = booking ? state.assessments.find((a) => a.booking_id === booking.id) : null;
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;

  const records: { title: string; rows: [string, string][]; available: boolean }[] = [
    {
      title: "1 · Registration Record",
      available: true,
      rows: [
        ["Farmer name", state.profile?.full_name ?? "—"],
        ["Mobile", state.profile?.phone ?? "—"],
        ["SmartMandi Farmer ID", state.farmer.smartmandi_farmer_id],
        ["Village", state.farmer.village],
        ["District", `${state.farmer.district}, ${state.farmer.state}`],
        ["Crops", state.farmer.crops.join(", ")],
      ],
    },
    {
      title: "2 · Slot / Token Record",
      available: Boolean(booking),
      rows: booking
        ? [
            ["Token", booking.token_number],
            ["Centre", centre?.name ?? "—"],
            ["Crop", "Wheat"],
            [
              "Slot",
              slot ? `${friendlyDate(slot.slot_date)} ${slot.start_time}–${slot.end_time}` : "—",
            ],
            ["Expected quantity", `${booking.expected_quantity_quintal} quintal`],
            ["Booked on", dateTimeOf(booking.created_at)],
          ]
        : [],
    },
    {
      title: "3 · Gate Entry Record",
      available: Boolean(gate),
      rows: gate
        ? [
            ["RFID", gate.rfid_id],
            ["Reader", gate.reader_id],
            ["Entered at", dateTimeOf(gate.entered_at)],
            ["Source", "RFID simulator (demo)"],
          ]
        : [],
    },
    {
      title: "4 · Assessment Record",
      available: Boolean(assessment),
      rows: assessment
        ? [
            ["Gross weight", `${assessment.gross_weight_kg} kg`],
            ["Tare weight", `${assessment.tare_weight_kg} kg`],
            ["Net weight", `${assessment.net_weight_kg} kg`],
            ["Moisture", `${assessment.moisture_percent}%`],
            ["Foreign matter", `${assessment.foreign_matter_percent}%`],
            ["Damaged grain", `${assessment.damaged_grain_percent}%`],
            ["Grade", assessment.quality_grade],
            ["Assessed by", assessment.assessed_by],
          ]
        : [],
    },
    {
      title: "5 · Procurement Record",
      available: Boolean(assessment && booking),
      rows:
        assessment && booking
          ? [
              ["Token", booking.token_number],
              ["Centre", centre?.name ?? "—"],
              ["Net quantity", `${(assessment.net_weight_kg / 100).toFixed(2)} quintal`],
              ["Grade", assessment.quality_grade],
              ["Completed at", dateTimeOf(assessment.assessed_at)],
            ]
          : [],
    },
    {
      title: "6 · Payment Record",
      available: Boolean(payment),
      rows: payment
        ? [
            ["Reference", payment.reference],
            ["Amount", rupees(payment.amount)],
            ["Rate used", `${rupees(payment.rate_per_quintal)}/quintal`],
            ["Net quantity", `${payment.net_quantity_quintal} quintal`],
            ["Status", payment.status],
            ["Updated", dateTimeOf(payment.updated_at)],
          ]
        : [],
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<ScrollText className="size-5" />}
        title="My records"
        subtitle="Keep or print a copy of every step."
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> Print all
          </Button>
        }
      />

      {records.map((r) => (
        <Card key={r.title}>
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            SmartMandi Farmer Record
          </p>
          <h3 className="text-xl font-extrabold">{r.title}</h3>
          {r.available ? (
            <dl className="mt-3 grid gap-1 text-sm">
              {r.rows.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Not available yet — this record appears once that step is completed.
            </p>
          )}
        </Card>
      ))}

      {!booking ? (
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title="Most records appear after booking"
          description="Book a slot to start building your record trail."
        />
      ) : null}

      <Notice tone="warning">
        These are SmartMandi farmer records for your own reference. They are not official
        government receipts.
      </Notice>
    </div>
  );
}

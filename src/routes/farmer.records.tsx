import { createFileRoute } from "@tanstack/react-router";
import { Printer, ScrollText } from "lucide-react";
import { Button, Card, EmptyState, Notice, SectionTitle } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { dateTimeOf, friendlyDate, rupees } from "@/lib/format";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/records")({
  component: Records,
});

function Records() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const { t } = usePreferences();
  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) : null;
  const slot = booking ? state.slots.find((s) => s.id === booking.slot_id) : null;
  const gate = booking ? state.gateEntries.find((g) => g.booking_id === booking.id) : null;
  const assessment = booking ? state.assessments.find((a) => a.booking_id === booking.id) : null;
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;

  const records: { title: string; rows: [string, string][]; available: boolean }[] = [
    {
      title: t("1 · Registration Record", "1 · पंजीकरण रिकॉर्ड"),
      available: true,
      rows: [
        [t("Farmer name", "किसान का नाम"), state.profile?.full_name ?? "—"],
        [t("Mobile", "मोबाइल"), state.profile?.phone ?? "—"],
        [t("SmartMandi Farmer ID", "स्मार्टमंडी किसान आईडी"), state.farmer.smartmandi_farmer_id],
        [t("Village", "गांव"), state.farmer.village],
        [t("District", "जिला"), `${state.farmer.district}, ${state.farmer.state}`],
        [t("Crops", "फसलें"), state.farmer.crops.join(", ")],
      ],
    },
    {
      title: t("2 · Slot / Token Record", "2 · स्लॉट / टोकन रिकॉर्ड"),
      available: Boolean(booking),
      rows: booking
        ? [
            [t("Token", "टोकन"), booking.token_number],
            [t("Centre", "केंद्र"), centre?.name ?? "—"],
            [t("Crop", "फसल"), t("Wheat", "गेहूं")],
            [
              t("Slot", "स्लॉट"),
              slot ? `${friendlyDate(slot.slot_date)} ${slot.start_time}–${slot.end_time}` : "—",
            ],
            [
              t("Expected quantity", "अनुमानित मात्रा"),
              `${booking.expected_quantity_quintal} ${t("quintal", "क्विंटल")}`,
            ],
            [t("Booked on", "बुक की गई तारीख"), dateTimeOf(booking.created_at)],
          ]
        : [],
    },
    {
      title: t("3 · Gate Entry Record", "3 · गेट प्रवेश रिकॉर्ड"),
      available: Boolean(gate),
      rows: gate
        ? [
            ["RFID", gate.rfid_id],
            [t("Reader", "रीडर"), gate.reader_id],
            [t("Entered at", "प्रवेश समय"), dateTimeOf(gate.entered_at)],
            [t("Source", "स्रोत"), t("RFID simulator (demo)", "RFID सिम्युलेटर (डेमो)")],
          ]
        : [],
    },
    {
      title: t("4 · Assessment Record", "4 · मूल्यांकन रिकॉर्ड"),
      available: Boolean(assessment),
      rows: assessment
        ? [
            [t("Gross weight", "सकल वजन"), `${assessment.gross_weight_kg} kg`],
            [t("Tare weight", "टेयर वजन"), `${assessment.tare_weight_kg} kg`],
            [t("Net weight", "शुद्ध वजन"), `${assessment.net_weight_kg} kg`],
            [t("Moisture", "नमी"), `${assessment.moisture_percent}%`],
            [t("Foreign matter", "बाहरी पदार्थ"), `${assessment.foreign_matter_percent}%`],
            [t("Damaged grain", "क्षतिग्रस्त अनाज"), `${assessment.damaged_grain_percent}%`],
            [t("Grade", "ग्रेड"), assessment.quality_grade],
            [t("Assessed by", "मूल्यांकनकर्ता"), assessment.assessed_by],
          ]
        : [],
    },
    {
      title: t("5 · Procurement Record", "5 · खरीद रिकॉर्ड"),
      available: Boolean(assessment && booking),
      rows:
        assessment && booking
          ? [
              [t("Token", "टोकन"), booking.token_number],
              [t("Centre", "केंद्र"), centre?.name ?? "—"],
              [
                t("Net quantity", "शुद्ध मात्रा"),
                `${(assessment.net_weight_kg / 100).toFixed(2)} ${t("quintal", "क्विंटल")}`,
              ],
              [t("Grade", "ग्रेड"), assessment.quality_grade],
              [t("Completed at", "पूर्ण समय"), dateTimeOf(assessment.assessed_at)],
            ]
          : [],
    },
    {
      title: t("6 · Payment Record", "6 · भुगतान रिकॉर्ड"),
      available: Boolean(payment),
      rows: payment
        ? [
            [t("Reference", "संदर्भ"), payment.reference],
            [t("Amount", "राशि"), rupees(payment.amount)],
            [t("Rate used", "उपयोग की गई दर"), `${rupees(payment.rate_per_quintal)}/quintal`],
            [
              t("Net quantity", "शुद्ध मात्रा"),
              `${payment.net_quantity_quintal} ${t("quintal", "क्विंटल")}`,
            ],
            [t("Status", "स्थिति"), payment.status],
            [t("Updated", "अद्यतन"), dateTimeOf(payment.updated_at)],
          ]
        : [],
    },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<ScrollText className="size-5" />}
        title={t("My records", "मेरे रिकॉर्ड")}
        subtitle={t("Keep or print a copy of every step.", "हर चरण की एक प्रति रखें या प्रिंट करें।")}
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> {t("Print all", "सब प्रिंट करें")}
          </Button>
        }
      />

      {records.map((r) => (
        <Card key={r.title}>
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {t("SmartMandi Farmer Record", "स्मार्टमंडी किसान रिकॉर्ड")}
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
              {t(
                "Not available yet — this record appears once that step is completed.",
                "अभी उपलब्ध नहीं है — यह रिकॉर्ड उस चरण के पूरा होने पर दिखाई देगा।",
              )}
            </p>
          )}
        </Card>
      ))}

      {!booking ? (
        <EmptyState
          icon={<ScrollText className="size-8" />}
          title={t("Most records appear after booking", "अधिकांश रिकॉर्ड बुकिंग के बाद दिखाई देते हैं")}
          description={t(
            "Book a slot to start building your record trail.",
            "अपना रिकॉर्ड ट्रेल बनाना शुरू करने के लिए एक स्लॉट बुक करें।",
          )}
        />
      ) : null}

      <Notice tone="warning">
        {t(
          "These are SmartMandi farmer records for your own reference. They are not official government receipts.",
          "ये आपके अपने संदर्भ के लिए स्मार्टमंडी किसान रिकॉर्ड हैं। ये आधिकारिक सरकारी रसीदें नहीं हैं।",
        )}
      </Notice>
    </div>
  );
}

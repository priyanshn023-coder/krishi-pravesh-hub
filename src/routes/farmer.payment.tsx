import { createFileRoute, Link } from "@tanstack/react-router";
import { IndianRupee, Printer } from "lucide-react";
import { Badge, Button, Card, EmptyState, Notice, SectionTitle, Stat } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { dateTimeOf, PAYMENT_STATUS_LABEL, rupees } from "@/lib/format";
import { PAYMENT_DISCLAIMER } from "@/services";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/payment")({
  component: FarmerPayment,
});

const STEPS = ["initiated", "processing", "completed"] as const;

function FarmerPayment() {
  const { state } = useSmartMandi();
  const booking = useMyBooking();
  const { t } = usePreferences();
  const payment = booking ? state.payments.find((p) => p.booking_id === booking.id) : null;
  const assessment = booking
    ? state.assessments.find((a) => a.booking_id === booking.id)
    : null;
  const centre = booking ? DEMO_CENTRES.find((c) => c.id === booking.centre_id) : null;

  const STEP_LABEL: Record<(typeof STEPS)[number], string> = {
    initiated: t("Payment initiated", "भुगतान शुरू हुआ"),
    processing: t("Payment processing", "भुगतान प्रक्रिया में"),
    completed: t("Payment completed", "भुगतान पूर्ण"),
  };

  if (!booking || !payment) {
    return (
      <EmptyState
        icon={<IndianRupee className="size-8" />}
        title={t("No payment yet", "अभी कोई भुगतान नहीं")}
        description={t(
          "Payment starts after the centre completes your quality check and procurement.",
          "केंद्र द्वारा आपकी गुणवत्ता जांच और खरीद पूरी करने के बाद भुगतान शुरू होता है।",
        )}
        action={
          <Link to="/farmer/booking">
            <Button size="lg">{t("See my booking", "मेरी बुकिंग देखें")}</Button>
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
        title={t("Payment", "भुगतान")}
        subtitle={t("Track your demo payment from start to finish.", "अपने डेमो भुगतान को शुरू से अंत तक ट्रैक करें।")}
        action={
          <Button variant="quiet" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> {t("Print", "प्रिंट करें")}
          </Button>
        }
      />

      <Card>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {t("SmartMandi Farmer Record · Payment", "स्मार्टमंडी किसान रिकॉर्ड · भुगतान")}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-2xl font-extrabold">{payment.reference}</p>
          <Badge tone={payment.status === "completed" ? "success" : "wheat"}>
            {PAYMENT_STATUS_LABEL[payment.status]}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label={t("Amount", "राशि")} value={rupees(payment.amount)} tone="primary" />
          <Stat label={t("Rate used", "उपयोग की गई दर")} value={`${rupees(payment.rate_per_quintal)}/qtl`} />
          <Stat label={t("Net quantity", "शुद्ध मात्रा")} value={`${payment.net_quantity_quintal} qtl`} />
          <Stat label={t("Token", "टोकन")} value={booking.token_number} />
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
              {STEP_LABEL[s]}
            </li>
          ))}
        </ol>

        <dl className="mt-5 grid gap-1 text-sm">
          <Row k={t("Centre", "केंद्र")} v={centre?.name ?? "—"} />
          <Row k={t("Farmer", "किसान")} v={state.profile?.full_name ?? "—"} />
          <Row k={t("SmartMandi ID", "स्मार्टमंडी आईडी")} v={state.farmer.smartmandi_farmer_id} />
          <Row
            k={t("Bank account", "बैंक खाता")}
            v={state.farmer.bank_account_masked ?? t("Not added", "नहीं जोड़ा गया")}
          />
          <Row
            k={t("Net weight", "शुद्ध वजन")}
            v={assessment ? `${assessment.net_weight_kg} kg` : t("From centre assessment", "केंद्र मूल्यांकन से")}
          />
          <Row k={t("Last update", "अंतिम अद्यतन")} v={dateTimeOf(payment.updated_at)} />
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          {t(
            "SmartMandi Farmer Record — not an official government receipt.",
            "स्मार्टमंडी किसान रिकॉर्ड — आधिकारिक सरकारी रसीद नहीं है।",
          )}
        </p>
      </Card>

      <Notice tone="warning" title={t("Important", "महत्वपूर्ण")}>
        {PAYMENT_DISCLAIMER}{" "}
        {t(
          "The real transfer will be handled by the procurement department's own payment system.",
          "वास्तविक हस्तांतरण खरीद विभाग की अपनी भुगतान प्रणाली द्वारा संभाला जाएगा।",
        )}
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

import { Check } from "lucide-react";
import { JOURNEY_STAGES, type JourneyStage } from "@/types/domain";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/preferences";

function stageLabel(stage: JourneyStage, t: (en: string, hi: string) => string): string {
  switch (stage) {
    case "Registration":
      return t("Registration", "पंजीकरण");
    case "Centre Selected":
      return t("Centre Selected", "केंद्र चयनित");
    case "Slot Booked":
      return t("Slot Booked", "स्लॉट बुक हुआ");
    case "Token Generated":
      return t("Token Generated", "टोकन जनरेट हुआ");
    case "Arrived at Gate":
      return t("Arrived at Gate", "गेट पर पहुंचे");
    case "Waiting":
      return t("Waiting", "प्रतीक्षा");
    case "Processing":
      return t("Processing", "प्रक्रिया जारी");
    case "Quality Assessment":
      return t("Quality Assessment", "गुणवत्ता मूल्यांकन");
    case "Procurement Completed":
      return t("Procurement Completed", "खरीद पूर्ण");
    case "Payment Initiated":
      return t("Payment Initiated", "भुगतान शुरू");
    case "Payment Processing":
      return t("Payment Processing", "भुगतान प्रक्रिया में");
    case "Payment Completed":
      return t("Payment Completed", "भुगतान पूर्ण");
    default:
      return stage;
  }
}

function plainLabel(stage: JourneyStage, t: (en: string, hi: string) => string): string {
  switch (stage) {
    case "Registration":
      return t("You joined KrishiPravesh", "आप कृषिप्रवेश से जुड़े");
    case "Centre Selected":
      return t("You chose a centre", "आपने एक केंद्र चुना");
    case "Slot Booked":
      return t("Your time is booked", "आपका समय बुक हो गया");
    case "Token Generated":
      return t("Token and QR ready", "टोकन और QR तैयार");
    case "Arrived at Gate":
      return t("You reached the gate", "आप गेट पर पहुंचे");
    case "Waiting":
      return t("Waiting for your turn", "आपकी बारी का इंतज़ार");
    case "Processing":
      return t("Your wheat is being handled", "आपके गेहूं की प्रक्रिया जारी है");
    case "Quality Assessment":
      return t("Quality checked and weighed", "गुणवत्ता जांची और तौली गई");
    case "Procurement Completed":
      return t("Wheat taken by the centre", "गेहूं केंद्र द्वारा ले लिया गया");
    case "Payment Initiated":
      return t("Payment started", "भुगतान शुरू हुआ");
    case "Payment Processing":
      return t("Payment on the way", "भुगतान प्रक्रिया में है");
    case "Payment Completed":
      return t("Payment finished", "भुगतान पूर्ण हुआ");
    default:
      return "";
  }
}

export function JourneyTimeline({ current }: { current: JourneyStage }) {
  const { t } = usePreferences();
  const currentIndex = JOURNEY_STAGES.indexOf(current);
  return (
    <ol className="relative space-y-1">
      {JOURNEY_STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              {i < JOURNEY_STAGES.length - 1 && (
                <span
                  className={cn(
                    "w-0.5 flex-1 bg-border",
                    done && "bg-success",
                    active && "bg-primary/40",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-4", active && "rounded-xl bg-primary-soft px-3 py-2 -mt-1")}>
              <p
                className={cn(
                  "font-bold",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stageLabel(stage, t)}
                {active ? t(" — you are here", " — आप यहां हैं") : ""}
              </p>
              <p className="text-sm text-muted-foreground">{plainLabel(stage, t)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

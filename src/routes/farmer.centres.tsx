import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, IndianRupee, MapPin, Sparkles, Wheat } from "lucide-react";
import { Badge, Button, Card, Notice, SectionTitle } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { DEMO_CENTRES } from "@/lib/demoData";
import { queueLengthByCentre } from "@/lib/queue";
import {
  buildCentreInsights,
  explain,
  sortInsights,
  type SortKey,
} from "@/lib/recommendation";
import { friendlyDate, minutesLabel, rupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/centres")({
  component: FindCentre,
});

function FindCentre() {
  const { state } = useSmartMandi();
  const { t } = usePreferences();
  const [sort, setSort] = useState<SortKey>("recommended");

  const SORTS: { key: SortKey; label: string }[] = [
    { key: "recommended", label: t("Recommended", "अनुशंसित") },
    { key: "nearest", label: t("Nearest", "सबसे नज़दीक") },
    { key: "rate", label: t("Best rate", "सबसे अच्छा दाम") },
    { key: "wait", label: t("Shortest wait", "सबसे कम प्रतीक्षा") },
    { key: "earliest", label: t("Earliest slot", "सबसे जल्दी स्लॉट") },
  ];

  const insights = useMemo(
    () => buildCentreInsights(DEMO_CENTRES, state.slots, queueLengthByCentre(state.bookings)),
    [state.slots, state.bookings],
  );
  const top = insights[0];
  const list = useMemo(() => sortInsights(insights, sort), [insights, sort]);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<MapPin className="size-5" />}
        title={t("Find a centre for your wheat", "अपने गेहूं के लिए एक केंद्र खोजें")}
        subtitle={t(
          "Compare distance, demo rate, free slots and how long the line is.",
          "दूरी, डेमो दर, खाली स्लॉट और कतार की लंबाई की तुलना करें।",
        )}
      />

      <div className="no-print -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition",
              sort === s.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {top ? (
        <Card className="border-2 border-primary/40 bg-primary-soft">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            <p className="text-sm font-extrabold tracking-wide uppercase">
              {t("Recommended for you", "आपके लिए अनुशंसित")}
            </p>
          </div>
          <h3 className="mt-2 text-2xl font-extrabold">{top.centre.name}</h3>
          <p className="mt-1 text-foreground/80">{explain(top)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              `Match score ${top.score}/100 · calculated from waiting time 30%, distance 25%, rate 25%, slots 10%, operating status 10%. This is a transparent ranking, not an AI prediction.`,
              `मैच स्कोर ${top.score}/100 · प्रतीक्षा समय 30%, दूरी 25%, दर 25%, स्लॉट 10%, संचालन स्थिति 10% से गणना की गई। यह एक पारदर्शी रैंकिंग है, AI भविष्यवाणी नहीं।`,
            )}
          </p>
          <Link
            to="/farmer/book/$centreId"
            params={{ centreId: top.centre.id }}
            className="mt-4 inline-block"
          >
            <Button size="lg">{t("Book at this centre", "इस केंद्र पर बुक करें")}</Button>
          </Link>
        </Card>
      ) : null}

      <ul className="grid gap-3">
        {list.map((i) => (
          <Card as="li" key={i.centre.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold">{i.centre.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {i.centre.centre_type} · {i.centre.city}
                </p>
              </div>
              <Badge tone={i.centre.active ? "success" : "danger"}>
                {i.centre.active ? t("Open today", "आज खुला है") : t("Closed today", "आज बंद है")}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Info
                icon={<MapPin className="size-4" />}
                label={t("Distance", "दूरी")}
                value={`${i.distanceKm} km`}
              />
              <Info
                icon={<IndianRupee className="size-4" />}
                label={t("Demo rate", "डेमो दर")}
                value={`${rupees(i.ratePerQuintal)}/qtl`}
              />
              <Info
                icon={<Clock className="size-4" />}
                label={t("Predicted wait", "अनुमानित प्रतीक्षा")}
                value={minutesLabel(i.waitMinutes)}
              />
              <Info
                icon={<Wheat className="size-4" />}
                label={t("Free places", "खाली स्थान")}
                value={`${i.openSlots}`}
              />
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {t("Wheat accepted", "गेहूं स्वीकार किया जाता है")} · {i.centre.operating_hours} ·{" "}
              {i.earliestSlot
                ? t(
                    `earliest slot ${friendlyDate(i.earliestSlot.slot_date)} ${i.earliestSlot.start_time}`,
                    `सबसे जल्दी स्लॉट ${friendlyDate(i.earliestSlot.slot_date)} ${i.earliestSlot.start_time}`,
                  )
                : t("no free slot in the next 3 days", "अगले 3 दिनों में कोई खाली स्लॉट नहीं")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/farmer/book/$centreId" params={{ centreId: i.centre.id }}>
                <Button disabled={!i.centre.active || !i.earliestSlot}>
                  {t("Book a slot", "स्लॉट बुक करें")}
                </Button>
              </Link>
              <span className="self-center text-sm font-semibold text-muted-foreground">
                {t(`Score ${i.score}/100`, `स्कोर ${i.score}/100`)}
              </span>
            </div>
          </Card>
        ))}
      </ul>

      <Notice tone="demo" title={t("About these numbers", "इन आंकड़ों के बारे में")}>
        {t(
          "Rates, slot counts and waiting times shown here are demo values generated for this prototype. They are not official live mandi rates.",
          "यहां दिखाई गई दरें, स्लॉट संख्या और प्रतीक्षा समय इस प्रोटोटाइप के लिए बनाए गए डेमो मान हैं। ये आधिकारिक लाइव मंडी दरें नहीं हैं।",
        )}
      </Notice>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface-strong px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

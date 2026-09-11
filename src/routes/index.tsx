import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Clock,
  IndianRupee,
  MapPin,
  Mic,
  QrCode,
  ScanLine,
  Truck,
  UserPlus,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui-kit";
import { Brand, DemoModeStrip, PreferenceControls } from "@/components/shells";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiPravesh — Book your mandi slot, skip the long line" },
      {
        name: "description",
        content:
          "KrishiPravesh helps wheat farmers pick the right procurement centre, book a time slot, get a token and QR, and follow gate entry, queue, assessment and payment in one place.",
      },
      { property: "og:title", content: "KrishiPravesh — Book your mandi slot, skip the long line" },
      {
        property: "og:description",
        content:
          "Compare centres by distance, rate and waiting time. Book a slot, get a token, track your turn.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, tr } = usePreferences();

  const steps = [
    {
      n: "1",
      title: t("Choose a centre", "केंद्र चुनें"),
      text: t(
        "See distance, today's demo rate, free slots and how long the line is.",
        "दूरी, आज का डेमो भाव, खाली स्लॉट और कतार की लंबाई देखें।",
      ),
      icon: <MapPin className="size-6" />,
    },
    {
      n: "2",
      title: t("Book your time", "अपना समय बुक करें"),
      text: t(
        "Pick a slot, tell us how much wheat you bring, get a token and QR.",
        "स्लॉट चुनें, बताएं कितना गेहूं ला रहे हैं, टोकन और QR पाएं।",
      ),
      icon: <QrCode className="size-6" />,
    },
    {
      n: "3",
      title: t("Reach and track", "पहुंचें और ट्रैक करें"),
      text: t(
        "Gate scan puts you in the queue. Watch your turn, check and payment.",
        "गेट स्कैन से आप कतार में आ जाते हैं। अपनी बारी, जांच और भुगतान देखें।",
      ),
      icon: <Truck className="size-6" />,
    },
  ];

  const helps = [
    { icon: <Clock className="size-5" />, label: t("Know your waiting time before you leave home", "घर से निकलने से पहले प्रतीक्षा समय जानें") },
    { icon: <IndianRupee className="size-5" />, label: t("Compare wheat rates across nearby centres", "पास के केंद्रों के गेहूं भाव तुलना करें") },
    { icon: <Mic className="size-5" />, label: t("Ask questions by voice, hear the answer back", "आवाज़ से सवाल पूछें, जवाब सुनें") },
    { icon: <ScanLine className="size-5" />, label: t("Gate entry by RFID, no paper chase", "RFID से गेट प्रवेश, कागज़ का झंझट नहीं") },
    { icon: <BadgeCheck className="size-5" />, label: t("Photo check of grain before you load", "लोड करने से पहले अनाज की फोटो जांच") },
    { icon: <ClipboardList className="size-5" />, label: t("Printable record at every step", "हर चरण पर प्रिंट योग्य रिकॉर्ड") },
  ];

  return (
    <div className="min-h-screen">
      <DemoModeStrip />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Brand size="lg" />
        <nav className="flex items-center gap-1">
          <PreferenceControls compact />
          <div className="hidden items-center gap-1 sm:flex">
            <Link
              to="/how-it-works"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-strong"
            >
              {tr("howItWorks")}
            </Link>
            <Link
              to="/technology"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-strong"
            >
              {tr("technology")}
            </Link>
            <Link to="/login" search={{ role: "farmer", mode: "signin" }}>
              <Button size="sm" variant="outline">
                {tr("signIn")}
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-4 pb-12">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
            <div className="p-6 sm:p-10">
              <Badge tone="wheat">{t("Wheat · Indore, Madhya Pradesh", "गेहूं · इंदौर, मध्य प्रदेश")}</Badge>
              <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl">
                {t("Stop waiting all day", "दिनभर मंडी गेट पर")}
                <br />
                {t("at the mandi gate.", "इंतज़ार बंद करें।")}
              </h1>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                {t(
                  "KrishiPravesh tells you which centre to go to, books your time, gives you a token, and shows your turn as it moves — in simple words, on your phone.",
                  "कृषिप्रवेश बताता है किस केंद्र जाना है, आपका समय बुक करता है, टोकन देता है और आपकी बारी दिखाता है — सरल शब्दों में, आपके फोन पर।",
                )}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" search={{ role: "farmer", mode: "signin" }}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("I am a Farmer", "मैं किसान हूं")} <ArrowRight className="size-5" />
                  </Button>
                </Link>
                <Link to="/login" search={{ role: "authority", mode: "signin" }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {t("I run a Centre", "मैं केंद्र चलाता हूं")}
                  </Button>
                </Link>
              </div>
              <Link
                to="/login"
                search={{ role: "farmer", mode: "register" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary underline"
              >
                <UserPlus className="size-4" />
                {t("New here? Register as a farmer or procurement authority", "नए हैं? किसान या खरीद प्राधिकरण के रूप में पंजीकरण करें")}
              </Link>

              <p className="mt-5 text-sm text-muted-foreground">
                {t("Demo sign-in: any 10-digit mobile number, code", "डेमो साइन-इन: कोई भी 10 अंकों का मोबाइल नंबर, कोड")}{" "}
                <strong>1234</strong>.
              </p>
            </div>

            <div className="relative wheat-gradient p-6 sm:p-10">
              <div className="rounded-3xl bg-card/90 p-5 backdrop-blur">
                <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                  {t("Your token", "आपका टोकन")}
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">WHT-IND-1025</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-primary-soft p-3">
                    <p className="text-xs font-bold text-primary uppercase">{t("Your place", "आपका स्थान")}</p>
                    <p className="text-2xl font-extrabold">{t("4th", "चौथा")}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-strong p-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase">{t("Wait", "प्रतीक्षा")}</p>
                    <p className="text-2xl font-extrabold">54 {t("min", "मिनट")}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("Turn expected around", "बारी लगभग")}{" "}
                  <strong className="text-foreground">11:40 AM</strong> · Choithram Procurement Centre
                </p>
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-accent-foreground">
                {t("Sample screen · demo data", "नमूना स्क्रीन · डेमो डेटा")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{t("Three steps. That is all.", "तीन चरण। बस इतना ही।")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} className="relative pt-8">
              <span className="absolute -top-4 left-5 grid size-11 place-items-center rounded-2xl field-gradient text-xl font-extrabold text-primary-foreground">
                {s.n}
              </span>
              <span className="text-primary">{s.icon}</span>
              <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl bg-primary-soft p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t("What you get", "आपको क्या मिलता है")}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {helps.map((h) => (
              <li
                key={h.label}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 text-base font-medium"
              >
                <span className="mt-0.5 text-primary">{h.icon}</span>
                {h.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl border-2 border-accent/50 bg-accent-soft p-5 text-sm">
          <p className="font-bold">{t("What KrishiPravesh is not", "कृषिप्रवेश क्या नहीं है")}</p>
          <p className="mt-1 text-foreground/85">
            {t(
              "KrishiPravesh is a coordination and decision-support platform. It does not replace e-NAM or e-Uparjan, it does not issue official government receipts, the rates shown here are demo values, the payment flow moves no real money, and photo analysis of grain is only early guidance — the centre's physical test decides the official quality.",
              "कृषिप्रवेश एक समन्वय और निर्णय-सहायता मंच है। यह e-NAM या e-उपार्जन का विकल्प नहीं है, आधिकारिक सरकारी रसीद जारी नहीं करता, यहां दिखाए भाव डेमो हैं, भुगतान प्रवाह में कोई वास्तविक पैसा नहीं जाता, और अनाज की फोटो जांच केवल शुरुआती मार्गदर्शन है — केंद्र की भौतिक जांच ही आधिकारिक गुणवत्ता तय करती है।",
            )}
          </p>
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            <Link to="/how-it-works" className="text-primary underline">
              {t("How KrishiPravesh works", "कृषिप्रवेश कैसे काम करता है")}
            </Link>
            <Link to="/technology" className="text-primary underline">
              {t("Technology & algorithms", "तकनीक और एल्गोरिदम")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

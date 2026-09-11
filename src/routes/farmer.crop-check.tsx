import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Badge, Button, Card, Notice, SectionTitle, Spinner } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { AI_DISCLAIMER, aiVisionService } from "@/services";
import type { AiCropAssessment } from "@/types/domain";
import { dateTimeOf } from "@/lib/format";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/crop-check")({
  component: CropCheck,
});

type Phase = "idle" | "ready" | "analysing" | "done" | "error";

function CropCheck() {
  const { t } = usePreferences();
  const { state, saveAiAssessment } = useSmartMandi();
  const booking = useMyBooking();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<AiCropAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("Please choose a photo file.", "कृपया एक फ़ोटो फ़ाइल चुनें।"));
      setPhase("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setImageName(file.name);
      setResult(null);
      setError(null);
      setPhase("ready");
    };
    reader.readAsDataURL(file);
  }

  async function analyse() {
    if (!imageUrl) return;
    setPhase("analysing");
    setError(null);
    try {
      const r = await aiVisionService.analyseCropImage({
        imageDataUrl: imageUrl,
        imageName,
        bookingId: booking?.id ?? null,
      });
      setResult(r);
      saveAiAssessment(r);
      setPhase("done");
    } catch {
      setError(t("The photo check could not run. Please try again.", "फ़ोटो जांच नहीं चल सकी। कृपया फिर से प्रयास करें।"));
      setPhase("error");
    }
  }

  const past = state.aiAssessments.slice(0, 3);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Camera className="size-5" />}
        title={t("Photo check of your wheat", "आपके गेहूं की फ़ोटो जांच")}
        subtitle={t(
          "Take a clear photo of the grain in daylight. You get early guidance before you load.",
          "दिन के उजाले में अनाज की स्पष्ट फ़ोटो लें। लोड करने से पहले आपको शुरुआती मार्गदर्शन मिलता है।",
        )}
      />

      <Notice tone="warning" title={t("Please read", "कृपया पढ़ें")}>
        {AI_DISCLAIMER}
      </Notice>

      <Card>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={t("Wheat sample uploaded by the farmer", "किसान द्वारा अपलोड किया गया गेहूं का नमूना")}
            className="mx-auto max-h-72 w-full rounded-2xl object-cover"
          />
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 px-6 py-12 text-center"
          >
            <Upload className="size-10 text-primary" />
            <span className="text-lg font-bold">{t("Tap to take or choose a photo", "फ़ोटो लेने या चुनने के लिए टैप करें")}</span>
            <span className="text-sm text-muted-foreground">
              {t(
                "Spread the grain on a plain surface, hold the phone straight above.",
                "अनाज को एक समतल सतह पर फैलाएं, फ़ोन को सीधे ऊपर पकड़ें।",
              )}
            </span>
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            {imageUrl ? t("Choose another photo", "दूसरी फ़ोटो चुनें") : t("Choose photo", "फ़ोटो चुनें")}
          </Button>
          <Button onClick={analyse} disabled={!imageUrl || phase === "analysing"}>
            {phase === "analysing" ? <Spinner /> : null} {t("Check my wheat", "मेरा गेहूं जांचें")}
          </Button>
        </div>

        {phase === "analysing" ? (
          <p className="mt-3 text-muted-foreground">{t("Looking at the photo…", "फ़ोटो देखी जा रही है…")}</p>
        ) : null}
        {error ? <p className="mt-3 font-semibold text-destructive">{error}</p> : null}
      </Card>

      {result ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-extrabold">{t("Preliminary result", "प्रारंभिक परिणाम")}</h3>
            <Badge tone="wheat">{t("Simulated · demo", "सिम्युलेटेड · डेमो")}</Badge>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-primary">
            {result.preliminary_quality}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("Confidence", "विश्वास")} {Math.round(result.confidence * 100)}% · {t("model", "मॉडल")} {result.model} ·{" "}
            {dateTimeOf(result.created_at)}
          </p>

          <h4 className="mt-4 font-bold">{t("What the photo shows", "फ़ोटो में क्या दिखता है")}</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {result.observations.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          <h4 className="mt-4 font-bold">{t("What you can do", "आप क्या कर सकते हैं")}</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {result.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <p className="mt-4 rounded-xl bg-surface-strong p-3 text-sm">
            {t(
              "This is early guidance only. Moisture cannot be judged from a photo. The centre's physical test decides the official quality and grade.",
              "यह केवल शुरुआती मार्गदर्शन है। फ़ोटो से नमी का आकलन नहीं किया जा सकता। केंद्र की भौतिक जांच आधिकारिक गुणवत्ता और ग्रेड तय करती है।",
            )}
          </p>
        </Card>
      ) : null}

      {past.length > 0 ? (
        <Card>
          <h3 className="text-lg font-bold">{t("Earlier checks", "पहले की जांचें")}</h3>
          <ul className="mt-2 space-y-2">
            {past.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl bg-surface-strong p-3 text-sm"
              >
                <img src={a.image_data_url} alt="" className="size-12 rounded-lg object-cover" />
                <div>
                  <p className="font-bold">{a.preliminary_quality}</p>
                  <p className="text-muted-foreground">{dateTimeOf(a.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

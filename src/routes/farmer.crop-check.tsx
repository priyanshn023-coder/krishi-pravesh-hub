import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Badge, Button, Card, Notice, SectionTitle, Spinner } from "@/components/ui-kit";
import { useMyBooking, useSmartMandi } from "@/store/SmartMandiProvider";
import { AI_DISCLAIMER, aiVisionService } from "@/services";
import type { AiCropAssessment } from "@/types/domain";
import { dateTimeOf } from "@/lib/format";

export const Route = createFileRoute("/farmer/crop-check")({
  component: CropCheck,
});

type Phase = "idle" | "ready" | "analysing" | "done" | "error";

function CropCheck() {
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
      setError("Please choose a photo file.");
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
      setError("The photo check could not run. Please try again.");
      setPhase("error");
    }
  }

  const past = state.aiAssessments.slice(0, 3);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Camera className="size-5" />}
        title="Photo check of your wheat"
        subtitle="Take a clear photo of the grain in daylight. You get early guidance before you load."
      />

      <Notice tone="warning" title="Please read">
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
            alt="Wheat sample uploaded by the farmer"
            className="mx-auto max-h-72 w-full rounded-2xl object-cover"
          />
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 px-6 py-12 text-center"
          >
            <Upload className="size-10 text-primary" />
            <span className="text-lg font-bold">Tap to take or choose a photo</span>
            <span className="text-sm text-muted-foreground">
              Spread the grain on a plain surface, hold the phone straight above.
            </span>
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            {imageUrl ? "Choose another photo" : "Choose photo"}
          </Button>
          <Button onClick={analyse} disabled={!imageUrl || phase === "analysing"}>
            {phase === "analysing" ? <Spinner /> : null} Check my wheat
          </Button>
        </div>

        {phase === "analysing" ? (
          <p className="mt-3 text-muted-foreground">Looking at the photo…</p>
        ) : null}
        {error ? <p className="mt-3 font-semibold text-destructive">{error}</p> : null}
      </Card>

      {result ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-extrabold">Preliminary result</h3>
            <Badge tone="wheat">Simulated · demo</Badge>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-primary">
            {result.preliminary_quality}
          </p>
          <p className="text-sm text-muted-foreground">
            Confidence {Math.round(result.confidence * 100)}% · model {result.model} ·{" "}
            {dateTimeOf(result.created_at)}
          </p>

          <h4 className="mt-4 font-bold">What the photo shows</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {result.observations.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          <h4 className="mt-4 font-bold">What you can do</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {result.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <p className="mt-4 rounded-xl bg-surface-strong p-3 text-sm">
            This is early guidance only. Moisture cannot be judged from a photo. The centre's
            physical test decides the official quality and grade.
          </p>
        </Card>
      ) : null}

      {past.length > 0 ? (
        <Card>
          <h3 className="text-lg font-bold">Earlier checks</h3>
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

import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { Card, Notice, SectionTitle } from "@/components/ui-kit";
import { isConfigured } from "@/services";

export const Route = createFileRoute("/farmer/phone-assistant")({
  component: PhoneAssistant,
});

const FLOW = `Farmer's phone call
   |
   v
Telephony provider (to be configured)
   |
   v
Webhook endpoint
   |
   v
Speech recognition
   |
   v
AI assistant
   |
   v
SmartMandi data (token, slot, queue, payment)
   |
   v
Text to speech
   |
   v
Farmer hears the answer`;

function PhoneAssistant() {
  const connected = isConfigured("voice");
  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<PhoneCall className="size-5" />}
        title="Phone voice assistant"
        subtitle="Planned for farmers without a smartphone or internet."
      />

      <Notice tone={connected ? "info" : "warning"} title="Status">
        {connected
          ? "A voice service endpoint is configured. Telephony must still be set up separately."
          : "Not connected. Phone calling is not available — no telephony provider or credentials are configured."}
      </Notice>

      <Card className="overflow-x-auto">
        <pre className="text-xs leading-relaxed font-semibold sm:text-sm">{FLOW}</pre>
      </Card>

      <Card>
        <h3 className="text-lg font-bold">What a farmer would be able to ask</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>My token number</li>
          <li>When to reach the centre</li>
          <li>How long the wait is right now</li>
          <li>My place in the queue</li>
          <li>My payment status</li>
          <li>Today's wheat rate at my centre</li>
        </ul>
      </Card>

      <Card>
        <h3 className="text-lg font-bold">What must be configured later</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>A telephony provider number and webhook</li>
          <li>Speech recognition for Hindi and English</li>
          <li>An AI assistant endpoint with access to SmartMandi data</li>
          <li>Text-to-speech playback back into the call</li>
        </ul>
        <p className="mt-3 text-sm">
          All of these are configured outside this website through environment variables. No
          keys are stored in the frontend.
        </p>
      </Card>
    </div>
  );
}

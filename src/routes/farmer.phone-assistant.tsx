import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { Card, Notice, SectionTitle } from "@/components/ui-kit";
import { isConfigured } from "@/services";
import { usePreferences } from "@/components/preferences";

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
  const { t } = usePreferences();
  const connected = isConfigured("voice");
  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<PhoneCall className="size-5" />}
        title={t("Phone voice assistant", "फ़ोन आवाज़ सहायक")}
        subtitle={t(
          "Planned for farmers without a smartphone or internet.",
          "स्मार्टफ़ोन या इंटरनेट न रखने वाले किसानों के लिए योजनाबद्ध।",
        )}
      />

      <Notice tone={connected ? "info" : "warning"} title={t("Status", "स्थिति")}>
        {connected
          ? t(
              "A voice service endpoint is configured. Telephony must still be set up separately.",
              "एक आवाज़ सेवा एंडपॉइंट कॉन्फ़िगर किया गया है। टेलीफोनी अभी भी अलग से सेट करनी होगी।",
            )
          : t(
              "Not connected. Phone calling is not available — no telephony provider or credentials are configured.",
              "जुड़ा नहीं है। फ़ोन कॉलिंग उपलब्ध नहीं है — कोई टेलीफोनी प्रदाता या क्रेडेंशियल कॉन्फ़िगर नहीं है।",
            )}
      </Notice>

      <Card className="overflow-x-auto">
        <pre className="text-xs leading-relaxed font-semibold sm:text-sm">{FLOW}</pre>
      </Card>

      <Card>
        <h3 className="text-lg font-bold">{t("What a farmer would be able to ask", "किसान क्या पूछ सकेगा")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>{t("My token number", "मेरा टोकन नंबर")}</li>
          <li>{t("When to reach the centre", "केंद्र पर कब पहुंचना है")}</li>
          <li>{t("How long the wait is right now", "अभी कितनी प्रतीक्षा है")}</li>
          <li>{t("My place in the queue", "कतार में मेरा स्थान")}</li>
          <li>{t("My payment status", "मेरे भुगतान की स्थिति")}</li>
          <li>{t("Today's wheat rate at my centre", "मेरे केंद्र पर आज का गेहूं भाव")}</li>
        </ul>
      </Card>

      <Card>
        <h3 className="text-lg font-bold">{t("What must be configured later", "बाद में क्या कॉन्फ़िगर करना होगा")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>{t("A telephony provider number and webhook", "एक टेलीफोनी प्रदाता नंबर और वेबहुक")}</li>
          <li>{t("Speech recognition for Hindi and English", "हिंदी और अंग्रेज़ी के लिए वाणी पहचान")}</li>
          <li>{t("An AI assistant endpoint with access to SmartMandi data", "स्मार्टमंडी डेटा तक पहुंच वाला एक AI सहायक एंडपॉइंट")}</li>
          <li>{t("Text-to-speech playback back into the call", "कॉल में वापस टेक्स्ट-टू-स्पीच प्लेबैक")}</li>
        </ul>
        <p className="mt-3 text-sm">
          {t(
            "All of these are configured outside this website through environment variables. No keys are stored in the frontend.",
            "ये सभी इस वेबसाइट के बाहर पर्यावरण वेरिएबल के माध्यम से कॉन्फ़िगर किए जाते हैं। कोई कुंजी फ्रंटएंड में संग्रहीत नहीं है।",
          )}
        </p>
      </Card>
    </div>
  );
}

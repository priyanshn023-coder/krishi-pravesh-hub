import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button, Card, Field, Notice, SectionTitle, TextInput } from "@/components/ui-kit";
import { useSmartMandi } from "@/store/SmartMandiProvider";
import { usePreferences } from "@/components/preferences";

export const Route = createFileRoute("/farmer/profile")({
  component: FarmerProfilePage,
});

function FarmerProfilePage() {
  const { state, updateFarmer, resetDemo } = useSmartMandi();
  const { t } = usePreferences();
  const f = state.farmer;
  const [form, setForm] = useState({
    village: f.village,
    district: f.district,
    state: f.state,
    land_area_acres: String(f.land_area_acres),
    external_euparjan_id: f.external_euparjan_id ?? "",
    external_enam_id: f.external_enam_id ?? "",
    external_mp_emandi_id: f.external_mp_emandi_id ?? "",
    fpo_or_society_id: f.fpo_or_society_id ?? "",
    bank_account_masked: f.bank_account_masked ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function save() {
    if (!form.village.trim() || !form.district.trim()) {
      setError(t("Village and district cannot be empty.", "गांव और जिला खाली नहीं हो सकते।"));
      return;
    }
    setError(null);
    updateFarmer({
      village: form.village.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      land_area_acres: Number(form.land_area_acres) || 0,
      external_euparjan_id: form.external_euparjan_id.trim() || null,
      external_enam_id: form.external_enam_id.trim() || null,
      external_mp_emandi_id: form.external_mp_emandi_id.trim() || null,
      fpo_or_society_id: form.fpo_or_society_id.trim() || null,
      bank_account_masked: form.bank_account_masked.trim() || null,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<UserRound className="size-5" />}
        title={t("My profile", "मेरी प्रोफ़ाइल")}
        subtitle={t(
          "Keep your details correct so the centre can find you quickly.",
          "अपनी जानकारी सही रखें ताकि केंद्र आपको जल्दी ढूंढ सके।",
        )}
      />

      <Card>
        <div className="rounded-2xl bg-primary-soft p-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {t("SmartMandi Farmer ID", "स्मार्टमंडी किसान आईडी")}
          </p>
          <p className="text-2xl font-extrabold text-primary">{f.smartmandi_farmer_id}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.profile?.full_name} · {state.profile?.phone}
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-bold">{t("Where you farm", "आप कहां खेती करते हैं")}</h3>
        <Field label={t("Village", "गांव")}>
          <TextInput value={form.village} onChange={(e) => set("village", e.target.value)} />
        </Field>
        <Field label={t("District", "जिला")}>
          <TextInput value={form.district} onChange={(e) => set("district", e.target.value)} />
        </Field>
        <Field label={t("State", "राज्य")}>
          <TextInput value={form.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label={t("Land area (acres)", "भूमि क्षेत्र (एकड़)")}>
          <TextInput
            value={form.land_area_acres}
            inputMode="decimal"
            onChange={(e) => set("land_area_acres", e.target.value.replace(/[^\d.]/g, ""))}
          />
        </Field>
        <Field label={t("Crops", "फसलें")} hint={t("Wheat only in this prototype", "इस प्रोटोटाइप में केवल गेहूं")}>
          <TextInput value={f.crops.join(", ")} readOnly className="bg-surface-strong" />
        </Field>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-bold">{t("Other IDs (optional)", "अन्य आईडी (वैकल्पिक)")}</h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "If you already have IDs on other systems, keep them here for your own reference. SmartMandi does not connect to those systems.",
            "यदि आपके पास पहले से अन्य प्रणालियों पर आईडी हैं, तो उन्हें अपने संदर्भ के लिए यहां रखें। स्मार्टमंडी उन प्रणालियों से जुड़ा नहीं है।",
          )}
        </p>
        <Field label={t("e-Uparjan ID", "e-उपार्जन आईडी")}>
          <TextInput
            value={form.external_euparjan_id}
            onChange={(e) => set("external_euparjan_id", e.target.value)}
          />
        </Field>
        <Field label={t("e-NAM ID", "e-NAM आईडी")}>
          <TextInput
            value={form.external_enam_id}
            onChange={(e) => set("external_enam_id", e.target.value)}
          />
        </Field>
        <Field label={t("MP e-Mandi ID", "MP e-मंडी आईडी")}>
          <TextInput
            value={form.external_mp_emandi_id}
            onChange={(e) => set("external_mp_emandi_id", e.target.value)}
          />
        </Field>
        <Field label={t("FPO / society ID", "FPO / सोसाइटी आईडी")}>
          <TextInput
            value={form.fpo_or_society_id}
            onChange={(e) => set("fpo_or_society_id", e.target.value)}
          />
        </Field>
        <Field label={t("Bank account (last digits only)", "बैंक खाता (केवल अंतिम अंक)")}>
          <TextInput
            value={form.bank_account_masked}
            onChange={(e) => set("bank_account_masked", e.target.value)}
            placeholder="XXXX XXXX 4471"
          />
        </Field>
      </Card>

      {error ? <p className="font-semibold text-destructive">{error}</p> : null}
      {saved ? (
        <p className="font-semibold text-success">{t("Saved on this device.", "इस डिवाइस पर सहेजा गया।")}</p>
      ) : null}

      <Button size="lg" className="w-full" onClick={save}>
        {t("Save my details", "मेरी जानकारी सहेजें")}
      </Button>

      <Notice tone="demo" title={t("Demo data", "डेमो डेटा")}>
        {t(
          "Your profile is saved in this browser only. Reset the demo to start the whole journey again with fresh sample data.",
          "आपकी प्रोफ़ाइल केवल इस ब्राउज़र में सहेजी गई है। नए नमूना डेटा के साथ पूरी यात्रा फिर से शुरू करने के लिए डेमो रीसेट करें।",
        )}
      </Notice>

      <Button variant="outline" className="w-full" onClick={resetDemo}>
        {t("Reset demo data", "डेमो डेटा रीसेट करें")}
      </Button>
    </div>
  );
}

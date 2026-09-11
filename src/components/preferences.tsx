import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "hi";
export type Theme = "light" | "dark";
export type ColorTheme = "green" | "orange" | "blue" | "yellow";

export const COLOR_THEMES: { id: ColorTheme; en: string; hi: string; swatch: string }[] = [
  { id: "green", en: "Light Green", hi: "हल्का हरा", swatch: "oklch(0.72 0.14 148)" },
  { id: "orange", en: "Light Orange", hi: "हल्का नारंगी", swatch: "oklch(0.76 0.15 50)" },
  { id: "blue", en: "Light Blue", hi: "हल्का नीला", swatch: "oklch(0.72 0.12 235)" },
  { id: "yellow", en: "Yellow", hi: "पीला", swatch: "oklch(0.85 0.16 92)" },
];

/** Shared dictionary for strings that appear on many screens. */
export const DICTIONARY = {
  appName: { en: "KrishiPravesh", hi: "कृषिप्रवेश" },
  tagline: { en: "Farmer coordination platform", hi: "किसान समन्वय मंच" },
  demoStrip: {
    en: "Demo mode · sample data only · not official government data",
    hi: "डेमो मोड · केवल नमूना डेटा · आधिकारिक सरकारी डेटा नहीं",
  },
  signIn: { en: "Sign in", hi: "साइन इन" },
  signOut: { en: "Sign out", hi: "साइन आउट" },
  register: { en: "Register", hi: "पंजीकरण" },
  farmer: { en: "Farmer", hi: "किसान" },
  authority: { en: "Procurement Authority", hi: "खरीद प्राधिकरण" },
  notifications: { en: "Notifications", hi: "सूचनाएं" },
  preferences: { en: "Preferences", hi: "प्राथमिकताएं" },
  language: { en: "Language", hi: "भाषा" },
  colorTheme: { en: "Colour theme", hi: "रंग थीम" },
  darkMode: { en: "Dark mode", hi: "डार्क मोड" },
  lightMode: { en: "Light mode", hi: "लाइट मोड" },
  back: { en: "Back", hi: "वापस" },
  home: { en: "Home", hi: "होम" },
  centres: { en: "Centres", hi: "केंद्र" },
  token: { en: "Token", hi: "टोकन" },
  voice: { en: "Voice", hi: "आवाज़" },
  records: { en: "Records", hi: "रिकॉर्ड" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  liveQueue: { en: "Live queue", hi: "लाइव कतार" },
  slots: { en: "Slots", hi: "स्लॉट" },
  howItWorks: { en: "How it works", hi: "यह कैसे काम करता है" },
  technology: { en: "Technology", hi: "तकनीक" },
  wheat: { en: "Wheat", hi: "गेहूं" },
  payment: { en: "Payment", hi: "भुगतान" },
  demoData: { en: "Demo data", hi: "डेमो डेटा" },
} as const;

export type DictionaryKey = keyof typeof DICTIONARY;

interface PreferencesValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  /** Inline pair translation. */
  t: (english: string, hindi: string) => string;
  /** Dictionary translation for shared strings. */
  tr: (key: DictionaryKey) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const KEYS = {
  language: "krishipravesh-language",
  theme: "krishipravesh-theme",
  color: "krishipravesh-color-theme",
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("green");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(KEYS.language);
    const savedTheme = localStorage.getItem(KEYS.theme);
    const savedColor = localStorage.getItem(KEYS.color);
    if (savedLanguage === "en" || savedLanguage === "hi") setLanguageState(savedLanguage);
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    if (COLOR_THEMES.some((c) => c.id === savedColor)) setColorThemeState(savedColor as ColorTheme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(KEYS.theme, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset["theme"] = colorTheme;
    localStorage.setItem(KEYS.color, colorTheme);
  }, [colorTheme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    localStorage.setItem(KEYS.language, language);
  }, [language, hydrated]);

  const value = useMemo<PreferencesValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
      colorTheme,
      setColorTheme: setColorThemeState,
      t: (english, hindi) => (language === "hi" ? hindi : english),
      tr: (key) => DICTIONARY[key][language],
    }),
    [language, theme, colorTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}

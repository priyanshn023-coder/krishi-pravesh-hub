import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "hi";
type Theme = "light" | "dark";

interface PreferencesValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (english: string, hindi: string) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("krishipravesh-language");
    const savedTheme = localStorage.getItem("krishipravesh-theme");
    if (savedLanguage === "en" || savedLanguage === "hi") setLanguageState(savedLanguage);
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("krishipravesh-theme", theme);
  }, [theme]);

  const value = useMemo<PreferencesValue>(
    () => ({
      language,
      setLanguage: (next) => {
        setLanguageState(next);
        localStorage.setItem("krishipravesh-language", next);
        document.documentElement.lang = next === "hi" ? "hi" : "en";
      },
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
      t: (english, hindi) => (language === "hi" ? hindi : english),
    }),
    [language, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
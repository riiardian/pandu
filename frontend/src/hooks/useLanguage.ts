"use client";

import { useState, useEffect } from "react";

export type Language = "id" | "en";

export function useLanguage(): Language {
  const [lang, setLang] = useState<Language>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pandu_lang") as Language | null;
      if (saved === "en" || saved === "id") {
        setLang(saved);
      }
    } catch (e) {}

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: Language }>;
      if (customEvent.detail?.lang) {
        setLang(customEvent.detail.lang);
      }
    };

    window.addEventListener("pandu_lang_change", handleLangChange);
    return () => {
      window.removeEventListener("pandu_lang_change", handleLangChange);
    };
  }, []);

  return lang;
}

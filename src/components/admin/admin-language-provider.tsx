"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { adminTranslations, type AdminLanguage } from "@/lib/admin/admin-translations";

type AdminLanguageContextValue = {
  language: AdminLanguage;
  setLanguage: (language: AdminLanguage) => void;
  toggleLanguage: () => void;
  t: (typeof adminTranslations)[AdminLanguage];
};

const AdminLanguageContext = createContext<AdminLanguageContextValue | null>(null);

const STORAGE_KEY = "nexform-admin-language";

/** Independent from the public site's language toggle — an admin's dashboard language preference. */
export function AdminLanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: AdminLanguage;
}) {
  const [language, setLanguageState] = useState<AdminLanguage>(initialLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = adminTranslations[language].dir;
  }, [language]);

  const setLanguage = (next: AdminLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  return (
    <AdminLanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t: adminTranslations[language] }}
    >
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) throw new Error("useAdminLanguage must be used within an AdminLanguageProvider");
  return ctx;
}

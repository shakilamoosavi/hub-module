import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { CurrencyProvider } from "../../components/CurrencyProvider";
import { AuthProvider } from "../../components/auth/AuthProvider";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const messagesLoaders: Record<string, () => Promise<any>> = {
  "en-US": () => import("../../locales/en-US/common.json"),
  "en": () => import("../../locales/en-US/common.json"),
  "fa-IR": () => import("../../locales/fa-IR/common.json"),
  "fa": () => import("../../locales/fa-IR/common.json"),
  "ar-AE": () => import("../../locales/ar-AE/common.json"),
  "ar": () => import("../../locales/ar-AE/common.json"),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale = "en-US" } = await params;
  setRequestLocale(locale);
  const loadMessages = messagesLoaders[locale] || messagesLoaders["en-US"];
  const messages = (await loadMessages()).default;
  const rtlLocales = ["fa", "fa-IR", "ar", "ar-AE"];
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  // Choose font class based on locale
  let fontClass = "font-en";
  if (locale.startsWith("fa")) fontClass = "font-fa";
  else if (locale.startsWith("ar")) fontClass = "font-ar";

  return (
    <NextIntlClientProvider locale={locale} messages={messages || {}}>
      <AuthProvider>
        <CurrencyProvider>
          <div dir={dir} data-locale={locale} className={`flex min-h-screen flex-col ${fontClass}`}>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <div id="modal-root" aria-hidden="true" />
          </div>
        </CurrencyProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

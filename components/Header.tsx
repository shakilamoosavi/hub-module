"use client";
import UserDropdown from "./UserDropdown";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCurrency } from "./CurrencyProvider";
import type { CurrencyCode } from "./CurrencyProvider";
import { useAuth } from "./auth/AuthProvider";

const currencies = [
  { code: "usd", label: "USD" },
  { code: "irr", label: "IRR" },
  { code: "gold", label: "Gold" },
];

const languages = [
  { code: "en", label: "EN" },
  { code: "fa", label: "FA" },
  { code: "ar", label: "AR" },
];

import React, { useState, useRef, useEffect } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Header() {
  // Dropdown open states
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("header");
  const { currency, setCurrency, convertFromUSD } = useCurrency();
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();

  // Hamburger menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Determine if current locale is RTL
  const isRTL = locale.startsWith('ar') || locale.startsWith('fa');

  // Close menu and dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Mobile menu
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      // Language dropdown
      if (langRef.current && langRef.current !== target && !langRef.current.contains(target)) {
        setLangOpen(false);
      }
      // Currency dropdown
      if (currencyRef.current && currencyRef.current !== target && !currencyRef.current.contains(target)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // Helper to get current query string
  function getQueryString() {
    const params = searchParams;
    if (!params) return "";
    const entries = Array.from(params.entries());
    if (entries.length === 0) return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  }

  return (
    <header className="header fixed top-0 start-0 w-full z-50 bg-white dark:bg-zinc-900 shadow-md transition-colors duration-200">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Start: Logo and menu */}
        <div className="flex items-center gap-6 flex-1">
          {/* Hamburger menu button for mobile */}
          <button
            className="sm:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Bars3Icon className="w-7 h-7 text-zinc-700 dark:text-zinc-200" />
          </button>
          <nav className="flex items-center gap-2">
            <Link href={`/${locale}/`} className="flex items-center gap-2 group">
              <img src="/assets/images/logo.png" alt="Logo" className="h-4 object-contain transition-transform group-hover:scale-105" />
            </Link>
            {/* Appointment link: show only on desktop */}
            <Link
              href={`/${locale}/appointment`}
              className="menu-link px-4 py-2 rounded font-semibold hidden sm:inline-block"
            >
              {t("appointmentBooking")}
            </Link>
          </nav>
        </div>
        {/* End: Language, currency, user controls */}
        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 justify-end">
          {/* Language selector with flags and animated dropdown */}
          <div className="relative" ref={langRef} tabIndex={0}>
            <button
              className="flex items-center gap-2 border shadow-sm border-gray-100 text-gray-700 rounded px-2 py-1 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              type="button"
              onClick={() => setLangOpen((v) => !v)}
            >
              <img
                src={`/assets/images/flags/${locale.split('-')[0].toUpperCase()}.png`}
                alt={locale}
                className="w-5 h-5 rounded-full border"
              />
              <span className="font-medium">{t(`langs.${locale.split('-')[0]?.toUpperCase()}`)}</span>
              <svg className="w-4 h-4 ms-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <ul
              className={`absolute start-0 mt-2 w-32 bg-white shadow-lg border border-gray-100 rounded transition-all duration-200 z-10 scale-95 ${langOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none'}`}
              role="listbox"
            >
              {languages.map((l) => (
                <li
                  key={l.code}
                  className={`flex items-center text-sm gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${locale.startsWith(l.code) ? 'font-bold bg-blue-100' : ''}`}
                  role="option"
                  aria-selected={locale.startsWith(l.code)}
                  tabIndex={0}
                  onMouseDown={() => {
                    const newPath = pathname.replace(/^\/(en-US|fa-IR|ar-AE|en|fa|ar)/, "");
                    router.replace(`/${l.code}${newPath}${getQueryString()}`);
                    setLangOpen(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const newPath = pathname.replace(/^\/(en-US|fa-IR|ar-AE|en|fa|ar)/, "");
                      router.replace(`/${l.code}${newPath}${getQueryString()}`);
                      setLangOpen(false);
                    }
                  }}
                >
                  <img
                    src={`/assets/images/flags/${l.code}.png`}
                    alt={l.label}
                    className="w-5 h-5 rounded-full border"
                  />
                  <span className="uppercase">{t(`langs.${l.label?.toUpperCase()}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Currency selector as custom dropdown */}
          <div className="relative" ref={currencyRef} tabIndex={0}>
            <button
              className="flex items-center gap-2 border shadow-sm border-gray-100 text-gray-700 rounded px-2 py-1 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              aria-haspopup="listbox"
              aria-expanded={currencyOpen}
              type="button"
              onClick={() => setCurrencyOpen((v) => !v)}
            >
              <span className="font-medium">{t(`currencies.${currency?.toUpperCase()}`)}</span>
              <svg className="w-4 h-4 ms-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <ul
              className={`absolute text-sm start-0 mt-2 w-32 bg-white shadow-lg border border-gray-100 rounded transition-all duration-200 z-10 scale-95 ${currencyOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none'}`}
              role="listbox"
            >
              {currencies.map((c) => (
                <li
                  key={c.code}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${currency === c.code ? 'font-bold bg-blue-100' : ''}`}
                  role="option"
                  aria-selected={currency === c.code}
                  tabIndex={0}
                  onMouseDown={() => { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); }
                  }}
                >
                  <span>{t(`currencies.${c.label?.toUpperCase()}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Login/User controls */}
          {/* {user ? (
            <UserDropdown user={user} wallet={convertFromUSD(user.walletUSD)} currency={currency} t={t} locale={locale} logout={logout} />
          ) : (
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center rounded px-5 py-2 text-sm text-gray-500 border border-gray-500 hover:bg-gray-200"
            >
              {t("login")}
            </Link>
          )} */}
        </div>

        {/* Mobile menu (animated) */}
        <div
          ref={menuRef}
          className={`sm:hidden fixed top-0 start-0 w-full h-full bg-black/30 z-40 transition-opacity duration-200 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ backdropFilter: menuOpen ? 'blur(2px)' : 'none' }}
        >
          <div className={`absolute top-0 w-64 max-w-full h-full bg-white shadow-lg transform transition-transform duration-300 ${isRTL ? 'right-0' : 'left-0'} ${menuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
            <button
              className={`absolute top-4 p-2 ${isRTL ? 'left-4' : 'right-4'}`}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col gap-6 p-6 pt-16">
              {/* Appointment link: show only in mobile menu */}
              <Link
                href={`/${locale}/appointment`}
                className="menu-link px-4 py-2 rounded font-semibold sm:hidden"
                onClick={() => setMenuOpen(false)}
              >
                {t("appointmentBooking")}
              </Link>
              {/* Language selector (reuse) */}
              <div className="relative" ref={langRef} tabIndex={0}>
                <button
                  className="w-full flex items-center gap-2 border shadow-sm border-gray-100 text-gray-700 rounded px-2 py-1 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                >
                  <img
                    src={`/assets/images/flags/${locale.split('-')[0]}.png`}
                    alt={locale}
                    className="w-5 h-5 rounded-full border"
                  />
                  <span className="font-medium">{t(`langs.${locale.split('-')[0]?.toUpperCase()}`)}</span>
                  <svg className="w-4 h-4 ms-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <ul
                  className={`w-full absolute start-0 text-sm mt-2 w-32 bg-white shadow-lg border border-gray-100 rounded transition-all duration-200 z-10 scale-95 ${langOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none'}`}
                  role="listbox"
                >
                  {languages.map((l) => (
                    <li
                      key={l.code}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${locale.startsWith(l.code) ? 'font-bold bg-blue-100' : ''}`}
                      role="option"
                      aria-selected={locale.startsWith(l.code)}
                      tabIndex={0}
                      onMouseDown={() => {
                        const newPath = pathname.replace(/^\/(en-US|fa-IR|ar-AE|en|fa|ar)/, "");
                        router.replace(`/${l.code}${newPath}${getQueryString()}`);
                        setLangOpen(false);
                        setMenuOpen(false);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          const newPath = pathname.replace(/^\/(en-US|fa-IR|ar-AE|en|fa|ar)/, "");
                          router.replace(`/${l.code}${newPath}${getQueryString()}`);
                          setLangOpen(false);
                          setMenuOpen(false);
                        }
                      }}
                    >
                      <img
                        src={`/assets/images/flags/${l.code}.png`}
                        alt={l.label}
                        className="w-5 h-5 rounded-full border"
                      />
                      <span>{t(`langs.${l.label?.toUpperCase()}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Currency selector as custom dropdown */}
              <div className="relative" ref={currencyRef} tabIndex={0}>
                <button
                  className="w-full flex items-center gap-2 border shadow-sm border-gray-100 text-gray-700 rounded px-2 py-1 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  aria-haspopup="listbox"
                  aria-expanded={currencyOpen}
                  type="button"
                  onClick={() => setCurrencyOpen((v) => !v)}
                >
                  <span className="font-medium">{t(`currencies.${currency?.toUpperCase()}`)}</span>
                  <svg className="w-4 h-4 ms-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <ul
                  className={`w-full absolute start-0 mt-2 text-sm w-32 bg-white shadow-lg border border-gray-100 rounded transition-all duration-200 z-10 scale-95 ${currencyOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none'}`}
                  role="listbox"
                >
                  {currencies.map((c) => (
                    <li
                      key={c.code}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${currency === c.code ? 'font-bold bg-blue-100' : ''}`}
                      role="option"
                      aria-selected={currency === c.code}
                      tabIndex={0}
                      onMouseDown={() => { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); setMenuOpen(false); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); setMenuOpen(false); }
                      }}
                    >
                      <span>{t(`currencies.${c.label?.toUpperCase()}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Login/User controls */}
              {/* {user ? (
                <div className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-200">
                  <span className="font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                  <span>
                    {t("wallet")}: {convertFromUSD(user.walletUSD)} {currency.toUpperCase()}
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/${locale}/change-password`}
                      className="rounded border border-transparent px-3 py-1 text-xs font-medium text-blue-600 hover:border-blue-600"
                    >
                      {t("changePassword")}
                    </Link>
                    <button
                      onClick={logout}
                      className="rounded border px-3 py-1 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {t("logout")}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  {t("login")}
                </Link>
              )} */}
            </div>
          </div>
        </div>
        </div>
    </header>
  );
}

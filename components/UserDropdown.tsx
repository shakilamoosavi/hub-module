"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserDropdown({ user, wallet, currency, t, locale, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 border rounded px-2 py-1 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        onClick={() => setOpen((v) => !v)}
      >
        {user.firstName} {user.lastName}
        <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border rounded shadow-lg z-20">
          <div className="px-4 py-3 text-sm border-b">{t("wallet")}: <span className="font-bold">{wallet} {currency.toUpperCase()}</span></div>
          <Link
            href={`/${locale}/change-password`}
            className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-zinc-800 border-b"
            onClick={() => setOpen(false)}
          >
            {t("changePassword")}
          </Link>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-zinc-800"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}

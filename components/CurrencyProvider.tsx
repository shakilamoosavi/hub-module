"use client";
import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";

export type CurrencyCode = "usd" | "irr" | "gold";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertFromUSD: (amountInUsd: number, target?: CurrencyCode) => number;
  rates: Record<CurrencyCode, number>;
};

const conversionTable: Record<CurrencyCode, number> = {
  usd: 1,
  irr: 42000,
  gold: 0.0005,
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "usd",
  setCurrency: () => {},
  convertFromUSD: (value: number) => value,
  rates: conversionTable,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("usd");

  // On mount, load currency from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("hub-module-currency");
      if (stored === "usd" || stored === "irr" || stored === "gold") {
        setCurrencyState(stored);
      }
    }
  }, []);

  // When currency changes, save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hub-module-currency", currency);
    }
  }, [currency]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
  };

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      convertFromUSD: (amountInUsd: number, target: CurrencyCode = currency) =>
        Number((amountInUsd * conversionTable[target]).toFixed(2)),
      rates: conversionTable,
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

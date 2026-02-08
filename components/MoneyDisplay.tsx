"use client";
import React from "react";
import { useCurrency } from "./CurrencyProvider";

const currencyDecimal: Record<string, number> = {
  usd: 2,
  irr: 0,
  gold: 4,
};

function formatMoney(value: string | number, currency: string) {
  const decimal = currencyDecimal[currency] ?? 2;
  let num = Number(value);
  if (isNaN(num)) return "";
  num = Number(num.toFixed(decimal));
  const [intPart, decPart] = num.toString().split(".");
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (decimal === 0) return intWithSep;
  return decPart ? `${intWithSep}.${decPart}` : intWithSep;
}

export default function MoneyDisplay({ value, label, placeholder }: { value: string | number, label?: string, placeholder?: string }) {
  const { currency } = useCurrency();
  const formatted = value === undefined || value === null || value === "" ? (placeholder || "-") : formatMoney(value, currency);
  return (
    <div>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
        {formatted}
      </span>
    </div>
  );
}

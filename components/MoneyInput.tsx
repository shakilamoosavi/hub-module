"use client";
import React from "react";
import { useCurrency } from "../components/CurrencyProvider";

const currencyDecimal: Record<string, number> = {
  usd: 2,
  irr: 0,
  gold: 4,
};

function formatMoney(value: string | number, currency: string) {
  const decimal = currencyDecimal[currency] ?? 2;
  let num = Number(value);
  if (isNaN(num)) return "";
  // Fix to decimal places
  num = Number(num.toFixed(decimal));
  // Split integer and decimal
  const [intPart, decPart] = num.toString().split(".");
  // Add thousands separator
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (decimal === 0) return intWithSep;
  return decPart ? `${intWithSep}.${decPart}` : intWithSep;
}

type MoneyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string | number;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
};

export default function MoneyInput({ value, onChange, label, placeholder, ...props }: MoneyInputProps) {
  const { currency } = useCurrency();
  const decimal = currencyDecimal[currency] ?? 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric except dot
    let val = e.target.value.replace(/[^\d.]/g, "");
    // Only allow one dot
    val = val.replace(/(\..*)\./g, "$1");
    // Limit decimal places
    if (decimal === 0) {
      val = val.split(".")[0];
    } else if (val.includes(".")) {
      const [int, dec] = val.split(".");
      val = int + "." + dec.slice(0, decimal);
    }
    onChange(val);
  };

  return (
    <div>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <input
        {...props}
        value={formatMoney(value, currency)}
        onChange={handleChange}
        inputMode="decimal"
        autoComplete="off"
        pattern={decimal === 0 ? "\\d*" : `\\d*(\\.\\d{0,${decimal}})?`}
        placeholder={placeholder}
      />
    </div>
  );
}

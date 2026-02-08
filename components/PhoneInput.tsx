"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import PhoneInputLib, { type Country, type Value } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export interface PhoneInputValue {
  country?: Country;
  e164: string; // +<countryCode><nationalNumber>
}

interface PhoneInputProps {
  value?: PhoneInputValue | null;
  onChange?: (value: PhoneInputValue | null) => void;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const isFa = locale === "fa" || locale === "fa-IR";

  const defaultCountry: Country = isFa ? "IR" : "US";

  const [phone, setPhone] = useState<Value | undefined>(value?.e164 as Value | undefined);
  const [country, setCountry] = useState<Country | undefined>(value?.country ?? defaultCountry);
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleChange = (val: Value) => {
    setPhone(val);
    if (!val) {
      setIsValid(true);
      onChange?.(null);
      return;
    }
    const valid = isValidPhoneNumber(val);
    setIsValid(valid);
    onChange?.({ country, e164: val });
  };

  const handleCountryChange = (nextCountry: Country | undefined) => {
    setCountry(nextCountry);
    if (!phone) return;
    // phone already contains full E.164; just re-validate
    const valid = isValidPhoneNumber(phone);
    setIsValid(valid);
    onChange?.({ country: nextCountry, e164: phone as string });
  };

  return (
    <div dir="ltr" className="space-y-1">
      <PhoneInputLib
        international
        defaultCountry={defaultCountry}
        country={country}
        onCountryChange={handleCountryChange}
        value={phone}
        onChange={handleChange}
        disabled={disabled}
        countryCallingCodeEditable={false}
        className="flex rounded border px-2 py-2 text-sm focus-within:border-blue-500 bg-white dark:bg-zinc-900"
      />
      {!isValid && phone && (
        <p className="text-xs text-red-500">{t("errors.invalidPhone", { defaultValue: "Invalid phone number" })}</p>
      )}
    </div>
  );
}

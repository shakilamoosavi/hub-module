"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { PhoneInput, PhoneInputValue } from "../../PhoneInput";
import Dropdown from "../../Dropdown";
import PasswordInput from "../PasswordInput";
// Static country/province/city data (same as ServiceSearchModal)
const countries = [
  {
    code: "IR",
    name: "Iran",
    provinces: [
      { code: "THR", name: "Tehran", cities: ["Tehran", "Karaj"] },
      { code: "ESF", name: "Isfahan", cities: ["Isfahan", "Kashan"] },
    ],
  },
  {
    code: "US",
    name: "USA",
    provinces: [
      { code: "CA", name: "California", cities: ["Los Angeles", "San Francisco"] },
      { code: "TX", name: "Texas", cities: ["Austin", "Houston"] },
    ],
  },
];

const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });

const initialForm = {
  firstName: "",
  lastName: "",
  birthdate: "",
  country: "",
  city: "",
  email: "",
  phone: "",
  password: "",
  repeatPassword: "",
};

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const locale = useLocale();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);
  const [birthdateValue, setBirthdateValue] = useState<DateObject | null>(null);
  const [phoneValue, setPhoneValue] = useState<PhoneInputValue | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(null);
  const isFaLocale = locale === "fa" || locale === "fa-IR";

  // Dropdown state for country/province/city
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const selectedCountry = countries.find(c => c.code === country);
  const selectedProvince = selectedCountry?.provinces.find(p => p.code === province);
  const countryOptions = countries.map(c => ({ value: c.code, label: c.name }));
  const provinceOptions = selectedCountry?.provinces.map(p => ({ value: p.code, label: p.name })) || [];
  const cityOptions = selectedProvince?.cities.map(c => ({ value: c, label: c })) || [];

  const handleChange = (field: keyof typeof initialForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (field === "phone") return;
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleBirthdateChange = (date: DateObject | null) => {
    setBirthdateValue(date);
  };

  const handlePhoneChange = (val: PhoneInputValue | null) => {
    setPhoneValue(val);
    setForm((prev) => ({ ...prev, phone: val?.e164 || "" }));
  };



  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.phone || !country || !province || !city) {
      setStatus(t("errors.required"));
      return;
    }
    // Password validation is handled in PasswordInput
    if (form.password !== form.repeatPassword) {
      setStatus(t("errors.passwordsDontMatch"));
      return;
    }
    // Convert birthdate (Jalali or Gregorian) to ISO string if selected
    let birthdateStr = "";
    if (birthdateValue) {
      const date = birthdateValue.toDate(); // always Gregorian JS Date
      birthdateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    const submitForm = {
      ...form,
      country,
      province,
      city,
      birthdate: birthdateStr,
    };
    await register(submitForm);
    router.replace(`/${locale}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.firstName")}</label>
          <input
            type="text"
            value={form.firstName}
            onChange={handleChange("firstName")}
            className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.lastName")}</label>
          <input
            type="text"
            value={form.lastName}
            onChange={handleChange("lastName")}
            className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.phone")}</label>
          <PhoneInput value={phoneValue} onChange={handlePhoneChange} />
        </div>
        <div>
          <PasswordInput
            value={form.password}
            onChange={val => setForm(prev => ({ ...prev, password: val }))}
            label={t("fields.password")}
            placeholder={t("fields.password")}
            onError={setPasswordError}
          />
          {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
        </div>
        <div>
          <PasswordInput
            value={form.repeatPassword}
            onChange={val => setForm(prev => ({ ...prev, repeatPassword: val }))}
            label={t("fields.repeatPassword")}
            placeholder={t("fields.repeatPassword")}
            onError={setRepeatPasswordError}
          />
          {repeatPasswordError && <p className="mt-1 text-xs text-red-500">{repeatPasswordError}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.country")}</label>
          <Dropdown
            dataList={countryOptions}
            value={country}
            onChange={val => { setCountry(val as string); setProvince(""); setCity(""); }}
            placeholder={t("fields.country")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.province")}</label>
          <Dropdown
            dataList={provinceOptions}
            value={province}
            onChange={val => { setProvince(val as string); setCity(""); }}
            disabled={!country}
            placeholder={t("fields.province")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.city")}</label>
          <Dropdown
            dataList={cityOptions}
            value={city}
            onChange={val => setCity(val as string)}
            disabled={!province}
            placeholder={t("fields.city")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("fields.birthdate")}</label>
          <DatePicker
            value={birthdateValue}
            onChange={handleBirthdateChange}
            calendar={isFaLocale ? persian : gregorian}
            locale={isFaLocale ? persian_fa : gregorian_en}
            calendarPosition="bottom-center"
            containerClassName="w-full"
            inputClass="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
      {status && <p className="mt-4 text-sm text-red-500">{status}</p>}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        {t("submit")}
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../AuthProvider";
import { PhoneInput, PhoneInputValue } from "../../PhoneInput";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const { requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [phoneValue, setPhoneValue] = useState<PhoneInputValue | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    const contactValue = mode === "email" ? value : phoneValue?.e164 || "";
    if (!contactValue) {
      setStatus(t("errors.required"));
      return;
    }
    await requestPasswordReset(mode === "email" ? { email: contactValue } : { phone: contactValue });
    setStatus(t("success"));
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex gap-2">
        {["email", "phone"].map((option) => (
          <button
            key={option}
            onClick={() => {
              setMode(option as "email" | "phone");
              setStatus(null);
            }}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
              mode === option ? "border-blue-500 text-blue-600" : "border-transparent bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {option === "email" ? t("emailTab") : t("phoneTab")}
          </button>
        ))}
      </div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {mode === "email" ? t("emailLabel") : t("phoneLabel")}
      </label>
      <div className="mb-4">
        {mode === "email" ? (
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <PhoneInput value={phoneValue} onChange={setPhoneValue} />
        )}
      </div>
      {status && <p className="mb-4 text-sm text-blue-600">{status}</p>}
      <button
        onClick={handleSubmit}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        {t("submit")}
      </button>
    </div>
  );
}

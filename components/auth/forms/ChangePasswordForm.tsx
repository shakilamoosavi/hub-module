"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../AuthProvider";

export function ChangePasswordForm() {
  const t = useTranslations("auth.changePassword");
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      setStatus(t("errors.required"));
      return;
    }
    if (next !== confirm) {
      setStatus(t("errors.mismatch"));
      return;
    }
    await changePassword({ current, next });
    setStatus(t("success"));
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {[{
        label: t("current"),
        value: current,
        onChange: setCurrent,
      }, {
        label: t("new"),
        value: next,
        onChange: setNext,
      }, {
        label: t("confirm"),
        value: confirm,
        onChange: setConfirm,
      }].map((field) => (
        <div key={field.label} className="mb-4">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{field.label}</label>
          <input
            type="password"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      ))}
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

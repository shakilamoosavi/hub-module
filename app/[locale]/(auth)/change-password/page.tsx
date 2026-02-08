"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../components/auth/AuthProvider";
import PasswordInput from "../../../../components/auth/PasswordInput";

function validatePassword(password) {
  // At least 8 chars, at least one number, one English letter, one special char, no spaces, only English letters/numbers/special
  return /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(password) &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
    !/\s/.test(password);
}

export default function ChangePasswordPage() {
  const t = useTranslations("auth.changePassword");
  const { user, logout, changePassword } = useAuth();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPasswordError) {
      setError(newPasswordError);
      return;
    }
    if (repeatPasswordError) {
      setError(repeatPasswordError);
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        logout();
        router.replace("/login?success=1");
      }, 1500);
    } catch (err) {
      setError(t("changeFailed"));
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-3xl font-semibold text-black dark:text-white mb-2">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PasswordInput
            value={oldPassword}
            onChange={setOldPassword}
            label={t("oldPassword")}
            placeholder={t("oldPassword")}
          />
        </div>
        <div>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            label={t("newPassword")}
            placeholder={t("newPassword")}
            onError={setNewPasswordError}
          />
          {newPasswordError && <p className="mt-1 text-xs text-red-500">{newPasswordError}</p>}
        </div>
        <div>
          <PasswordInput
            value={repeatPassword}
            onChange={setRepeatPassword}
            label={t("repeatPassword")}
            placeholder={t("repeatPassword")}
            onError={val => setRepeatPasswordError(val || (repeatPassword !== newPassword ? t("passwordsDontMatch") : null))}
          />
          {repeatPasswordError && <p className="mt-1 text-xs text-red-500">{repeatPasswordError}</p>}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{t("success")}</div>}
        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">{t("submit")}</button>
      </form>
    </section>
  );
}

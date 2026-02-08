"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { PhoneInput, PhoneInputValue } from "../../PhoneInput";
import { LoginService } from "../../../services/LoginService";
import { useEffect } from "react";



export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const locale = useLocale();
  const { login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const loginService = new LoginService();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [phoneValue, setPhoneValue] = useState<PhoneInputValue | null>(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"collect" | "verify">("collect");
  const [status, setStatus] = useState<string | null>(null);
  const [showSnack, setShowSnack] = useState(false);

  // For modular: send code step can be implemented with API if needed
  const handleSendCode = () => {
    const contactValue = mode === "email" ? contact : phoneValue?.e164 || "";
    if (!contactValue) {
      setStatus(t("errors.contactRequired"));
      return;
    }
    setStatus(t("codeSent", { target: contactValue }));
    setContact(contactValue);
    setStep("verify");
  };

  const handleLogin = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await loginService.login(contact, code); // code is used as password for demo
      // Save JWT in localStorage for BaseService
      if (typeof window !== 'undefined' && result.token) {
        localStorage.setItem('jwt', result.token);
      }
      login(result.user, result.token); // Save user in context and set cookie
      router.replace(`/${locale}`);
    } catch (err: any) {
      if (err?.status === 401) {
        logout();
        router.replace(`/${locale}/login`);
      }
      setStatus(err?.message || t("errors.loginFailed"));
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  // Hide snack after 3 seconds
  useEffect(() => {
    if (showSnack) {
      const timer = setTimeout(() => setShowSnack(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSnack]);

  
  
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex gap-2">
        <button
          className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
            mode === "email" ? "border-blue-500 text-blue-600" : "border-transparent bg-zinc-100 dark:bg-zinc-800"
          }`}
          onClick={() => {
            setMode("email");
            setStep("collect");
            setCode("");
            setStatus(null);
          }}
        >
          {t("emailTab")}
        </button>
        <button
          className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
            mode === "phone" ? "border-blue-500 text-blue-600" : "border-transparent bg-zinc-100 dark:bg-zinc-800"
          }`}
          onClick={() => {
            setMode("phone");
            setStep("collect");
            setCode("");
            setStatus(null);
          }}
        >
          {t("phoneTab")}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {mode === "email" ? t("emailLabel") : t("phoneLabel")}
          </label>
          {mode === "email" ? (
            <input
              type="email"
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={step === "verify"}
            />
          ) : (
            <PhoneInput value={phoneValue} onChange={setPhoneValue} disabled={step === "verify"} />
          )}
        </div>
        {step === "verify" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("codeLabel")}</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        )}
        {/* Snack message for errors */}
        {showSnack && status && (
          <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded bg-red-600 px-6 py-3 text-white shadow-lg animate-fade-in">
            {status}
          </div>
        )}
        {step === "collect" ? (
          <button
            onClick={handleSendCode}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {t("sendCode")}
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? t("loading") : t("login")}
          </button>
        )}
      </div>

      {/* Register and Forgot Password links */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.push(`/${locale}/register`)}
        >
          {t("registerLink", { defaultValue: "Register" })}
        </button>
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => router.push(`/${locale}/forgot-password`)}
        >
          {t("forgotPasswordLink", { defaultValue: "Forgot password?" })}
        </button>
      </div>
    </div>
  );
}

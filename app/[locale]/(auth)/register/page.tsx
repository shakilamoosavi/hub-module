"use client";
import { useTranslations } from "next-intl";
import { RegisterForm } from "../../../../components/auth/forms/RegisterForm";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-black dark:text-white">{t("title")}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
      </div>
      <RegisterForm />
    </section>
  );
}

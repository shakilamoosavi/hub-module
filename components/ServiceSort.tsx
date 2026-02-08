import React from "react";
import { BarsArrowDownIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

const SORTS = [
  { key: "default", labelKey: "default" },
  { key: "nearest", labelKey: "nearest" },
  { key: "mostSuccess", labelKey: "mostSuccess" },
];

export default function ServiceSort({ selected, onChange }: { selected: string; onChange: (key: string) => void }) {
  const t = useTranslations("services.sort");
  return (
    <div className="md:rounded-2xl bg-white md:shadow-sm p-4 mb-3 flex items-center gap-4">
      <span className="flex items-center text-gray-500 text-sm text-base">
        <BarsArrowDownIcon className="w-5 h-5 ms-1 me-2" />
        {t('sortBy')}: 
      </span>
      {SORTS.map(sort => (
        <button
          key={sort.key}
          type="button"
          className={`text-sm font-medium transition-colors ${selected === sort.key ? 'text-[var(--font-color-1)]' : 'text-gray-500'}`}
          onClick={() => onChange(sort.key)}
        >
          {t(sort.labelKey)}
        </button>
      ))}
    </div>
  );
}

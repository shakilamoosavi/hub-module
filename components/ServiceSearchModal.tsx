"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Dropdown from "./Dropdown";


const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });

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

export function ServiceSearchModal({
	open,
	onClose,
	onSearch,
	initial,
}: {
	open: boolean;
	onClose: () => void;
	onSearch: (data: { date: string; country: string; province: string; city: string }) => void;
	initial?: { date?: string; country?: string; province?: string; city?: string };
}) {
	const t = useTranslations();
	const locale = useLocale();
	const today = new Date();
	const [date, setDate] = useState(initial?.date ? new Date(initial.date) : today);
	const [country, setCountry] = useState(initial?.country || "");
	const [province, setProvince] = useState(initial?.province || "");
	const [city, setCity] = useState(initial?.city || "");

	const selectedCountry = countries.find(c => c.code === country);
	const selectedProvince = selectedCountry?.provinces.find(p => p.code === province);

	// Prepare dropdown data
	const countryOptions = countries.map(c => ({ value: c.code, label: c.name }));
	const provinceOptions = selectedCountry?.provinces.map(p => ({ value: p.code, label: p.name })) || [];
	const cityOptions = selectedProvince?.cities.map(c => ({ value: c, label: c })) || [];

	const handleSearch = () => {
		if (!date || !country || !province || !city) return;
		onSearch({
			date: date.toISOString().slice(0, 10),
			country,
			province,
			city,
		});
		onClose();
	};

	if (!open) return null;

	return (
			 <div
				 className="fixed inset-0 z-50 flex items-center justify-center"
				 style={{ background: "rgba(0,0,0,0.4)" }}
			 >
			<div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg relative">
				<button className="absolute top-2 right-2 text-xl" onClick={onClose}>
					&times;
				</button>
				   <h2 className="text-lg font-bold mb-4">
					   {t("services.searchTitle")}
				   </h2>
				   <div className="mb-4">
					   <label className="block mb-1 font-medium">{t("services.date")}</label>
					<DatePicker
						value={date}
						onChange={setDate}
						minDate={today}
						calendarPosition="bottom-center"
						inputClass="w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
					/>
				</div>
				<div className="mb-4">
					   <Dropdown
						   label={t("services.country")}
						   dataList={countryOptions}
						   value={country}
						   onChange={val => { setCountry(val as string); setProvince(""); setCity(""); }}
						   placeholder={t("services.selectCountry")}
					   />
				</div>
				<div className="mb-4">
					   <Dropdown
						   label={t("services.province")}
						   dataList={provinceOptions}
						   value={province}
						   onChange={val => { setProvince(val as string); setCity(""); }}
						   disabled={!country}
						   placeholder={t("services.selectProvince")}
					   />
				</div>
				<div className="mb-4">
					   <Dropdown
						   label={t("services.city")}
						   dataList={cityOptions}
						   value={city}
						   onChange={val => setCity(val as string)}
						   disabled={!province}
						   placeholder={t("services.selectCity")}
					   />
				</div>
				   <button
					   className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
					   onClick={handleSearch}
					   disabled={!date || !country || !province || !city}
				   >
					   {t("services.searchBtn")}
				   </button>
			</div>
		</div>
	);
}

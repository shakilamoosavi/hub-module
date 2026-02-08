"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import ServiceCategories from "../../components/ServiceCategories";
import { useCurrency } from "../../components/CurrencyProvider";
import React, { useState } from "react";
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const t = useTranslations();
  const { currency } = useCurrency();
  const params = useParams();
  const locale = params?.locale || 'fa-IR';

  // --- Add state for search and suggestions ---
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  // City lists for each locale
  const cityLists = {
    'fa': [
      { label: "همه شهرها", value: null },
      ...["تهران", "اصفهان", "مشهد", "شیراز", "تبریز", "کرج", "قم", "اهواز", "رشت", "کرمانشاه",
      "ارومیه", "زاهدان", "کرمان", "همدان", "یزد", "اردبیل", "بندرعباس", "گرگان", "ساری", "خرم‌آباد",
      "قزوین", "سنندج", "بوشهر", "بجنورد", "یاسوج", "شهرکرد", "ایلام", "زنجان", "سبزوار", "مراغه"].map(c => ({ label: c, value: c }))
    ],
    'en': [
      { label: "All cities", value: null },
      ...["Tehran", "Isfahan", "Mashhad", "Shiraz", "Tabriz", "Karaj", "Qom", "Ahvaz", "Rasht", "Kermanshah",
      "Urmia", "Zahedan", "Kerman", "Hamedan", "Yazd", "Ardabil", "Bandar Abbas", "Gorgan", "Sari", "Khorramabad",
      "Qazvin", "Sanandaj", "Bushehr", "Bojnourd", "Yasuj", "Shahrekord", "Ilam", "Zanjan", "Sabzevar", "Maragheh"].map(c => ({ label: c, value: c }))
    ],
    'ar': [
      { label: "كل المدن", value: null },
      ...["طهران", "أصفهان", "مشهد", "شيراز", "تبريز", "كرج", "قم", "أهواز", "رشت", "كرمانشاه",
      "أرومية", "زاهدان", "كرمان", "همدان", "يزد", "أردبيل", "بندر عباس", "جرغان", "ساري", "خرم آباد",
      "قزوين", "سنندج", "بوشهر", "بجنورد", "ياسوج", "شهركرد", "إيلام", "زنجان", "سبزوار", "مراغه"].map(c => ({ label: c, value: c }))
    ]
  };
  const allLocations = cityLists[locale] || cityLists['fa'];
  const filteredLocations = locationSearch
    ? allLocations.filter(l => l.label.includes(locationSearch)).slice(0, 30)
    : allLocations.slice(0, 30);
  // Popular search list for each locale (not translated)
  const popularSearchesByLocale = {
    'fa': ["ویزیت پزشک", "مشاوره آنلاین", "دندانپزشکی", "فیزیوتراپی"],
    'en': ["Doctor visit", "Online consultation", "Dentistry", "Physiotherapy"],
    'ar': ["زيارة الطبيب", "استشارة عبر الإنترنت", "طب الأسنان", "العلاج الطبيعي"]
  };
  const popularSearches = popularSearchesByLocale[locale] || popularSearchesByLocale['fa-IR'];

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-black">
      <section
        className="w-full px-4 min-h-screen flex flex-col justify-center items-center"
        style={{
          backgroundImage: 'url(/assets/images/bg-pattern.webp)',
          width: '100vw',
          minHeight: '100vh',
          paddingBottom: '65px',
          position: 'relative',
          backgroundColor: 'rgb(52, 110, 209)',
          margin: 0,
        }}
      >
        <h1 className="text-center text-white mt-[40px] font-bold drop-shadow-lg">
          <p className="text-3xl">{t("hubModuleTitle")}</p>
          <p className="text-2xl max-w-[600px]">
            {t("hubModuleSubtitle")}
          </p>
        </h1>

        {/* Location dropdown and search input */}
        <div className="flex flex-col items-center gap-4 mt-10 w-full max-w-xl">
          {/* Location search hint */}
          <div className="mb-2 text-center font-medium text-[var(--font-color-3)]">
            {t("hubModuleSubtitle2")}
          </div>
          {/* Location Dropdown (modal trigger) */}
          <button
            className="w-full rounded-lg px-4 py-2 text-base text-blue-500 bg-white border border-gray-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
            onClick={() => setLocationModalOpen(true)}
          >
            <MapPinIcon className="w-5 h-5" />
            <span>{selectedLocation || t('home.selectLocation')}</span>
          </button>

          {/* Location Modal */}
          {locationModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setLocationModalOpen(false)}
            >
              <div
                className="bg-white rounded-xl shadow-lg p-0 w-full max-w-xl relative mx-2"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <button
                    className="text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={() => setLocationModalOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <span className="font-semibold text-gray-700 text-base">{t('home.selectLocation')}</span>
                  <span style={{ width: 32 }}></span> {/* Spacer for symmetry */}
                </div>
                <div className="p-6 pt-4">
                  <input
                    type="text"
                    className="w-full rounded-lg px-4 py-2 mb-4 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={t('home.searchLocation')}
                    value={locationSearch}
                    onChange={e => setLocationSearch(e.target.value)}
                    autoFocus
                  />
                  <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {filteredLocations.map((loc, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700"
                        onMouseDown={() => {
                          setSelectedLocation(loc.value || "");
                          setLocationModalOpen(false);
                          setLocationSearch("");
                        }}
                      >
                        {loc.label}
                      </li>
                    ))}
                    {filteredLocations.length === 0 && (
                      <li className="px-4 py-2 text-gray-400">{t('home.noLocationFound')}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Search Text Input with suggestions */}
          <div className="relative w-full">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              className="w-full bg-white rounded-lg px-4 py-2 ps-10 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={t('home.searchPlaceholder')}
              onFocus={e => setShowSuggestions(true)}
              onBlur={e => setTimeout(() => setShowSuggestions(false), 150)}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-3">
                <div className="font-semibold text-gray-500 pb-2 border-b border-gray-200 mb-2 flex items-center gap-2">
                  {t('home.popularSearches')}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {popularSearches.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm px-2 py-1 rounded-2xl cursor-pointer hover:bg-blue-50 text-gray-700 text-sm border border-gray-200"
                      onMouseDown={() => { setSearchText(item); setShowSuggestions(false); }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-5">
            <div className="flex flex-col items-center px-2 md:px-5 py-1">
              <span dir="ltr" className="text-white text:xl md:text-2xl font-bold">+60,000</span>
              <span className="text-[var(--font-color-3)]">{t('home.doctors')}</span>
            </div>
            <div style={{ borderLeft: '.5px dashed var(--border-color-1)', borderRight: '.5px dashed var(--border-color-1)' }} className="flex flex-col items-center px-2 md:px-5 py-1">
              <span dir="ltr" className="text-white text:xl md:text-2xl font-bold">+22,000,000</span>
              <span className="text-[var(--font-color-3)]">{t('home.successfulAppointment')}</span>
            </div>
            <div className="flex flex-col items-center px-2 md:px-5 py-1">
              <span dir="ltr" className="text-white text:xl md:text-2xl font-bold">+1,300</span>
              <span className="text-[var(--font-color-3)]">{t('home.cityAndVillage')}</span>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl w-full mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-zinc-50">
          {t("home.welcome")}
        </h1>
        {/* <div className="text-lg text-zinc-700 dark:text-zinc-300 mb-2">
          Current currency: <span className="font-semibold">{currency.toUpperCase()}</span>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          (Switch language and currency from the header)
        </div>
        <ServiceCategories /> */}
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Dropdown from "@/components/Dropdown";
import Toggle from "@/components/Toggle";
import { useTranslations } from "next-intl";

export default function AppointmentPage() {
  const t = useTranslations("appointment");
  const [showFilters, setShowFilters] = React.useState(false);
  const [specialty, setSpecialty] = React.useState("");
  const [service, setService] = React.useState("");
  const [city, setCity] = React.useState("");
  const [insurance, setInsurance] = React.useState("");
  const [doctorSex, setDoctorSex] = React.useState("all");
  const [withAvailableAppointment, setWithAvailableAppointment] = React.useState(false);
  const router = require('next/navigation').useRouter();
  // Animation classes
  const filterPanelClass = showFilters
    ? "transition-all duration-300 opacity-100 translate-y-0 scale-100"
    : "transition-all duration-300 opacity-0 -translate-y-4 scale-95 pointer-events-none";
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <section
        className="relative flex flex-col items-center justify-start w-screen min-h-[400px] h-[70vh] bg-cover bg-center pt-16 md:pt-18 pb-12"
        style={{ backgroundColor: "var(--bg-color-2)", backgroundImage: "url(/assets/images/desktop-front-gradient.png)" }}
      >
        <div
          className="z-10 w-full max-w-[598px] transition-all duration-300"
        >

          {/* Title and description above the box */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 mt-8 drop-shadow-lg">{t("medicalSpecialtiesTitle")}</h1>
            <p className="text-white text-base md:text-lg mb-4 drop-shadow-lg">{t("medicalSpecialtiesDesc")}</p>
          </div>

          {/* Overlapping search box */}
          <div
            className={`mx-auto flex w-full flex-col rounded-2xl bg-white p-8 pb-10 shadow-sm-4 md:px-20 md:py-12 transition-all duration-300`}
            style={{ minHeight: showFilters ? 650 : 420, height: 'auto' }}
          >
            {/* Top buttons: مطب، درمانگاه، وکالت */}
            <div className="flex flex-row justify-center gap-4 mb-6">
              <button type="button" className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">{t('officeBtn')}</button>
              <button type="button" className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">{t('clinicBtn')}</button>
              <button type="button" className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">{t('legalBtn')}</button>
            </div>
            {/* Dropdowns */}
            <div className="flex flex-col gap-4">
              <Dropdown
                label={t('specialtyLabel')}
                dataList={[
                  { label: 'متخصص قلب', value: 'cardio' },
                  { label: 'متخصص پوست', value: 'derma' },
                  { label: 'متخصص مغز و اعصاب', value: 'neuro' },
                ]}
                value={specialty}
                onChange={val => setSpecialty(val as string)}
                placeholder={t('specialtyPlaceholder')}
              />
              <Dropdown
                label={t('serviceLabel')}
                dataList={[
                  { label: 'ویزیت حضوری', value: 'visit' },
                  { label: 'مشاوره آنلاین', value: 'consult' },
                  { label: 'تست آزمایشگاهی', value: 'lab' },
                ]}
                value={service}
                onChange={val => setService(val as string)}
                placeholder={t('servicePlaceholder')}
              />
              <Dropdown
                label={t('cityLabel')}
                dataList={[
                  { label: 'تهران', value: 'tehran' },
                  { label: 'اصفهان', value: 'isfahan' },
                  { label: 'مشهد', value: 'mashhad' },
                ]}
                value={city}
                onChange={val => setCity(val as string)}
                placeholder={t('cityPlaceholder')}
              />
              {/* Animated Filter Panel */}
              <div
                className={`transition-all ${filterPanelClass}`}
                style={{ maxHeight: showFilters ? 400 : 0, overflow: 'hidden' }}
              >
                <Dropdown
                  label={t('insuranceLabel')}
                  dataList={[
                    { label: 'تامین اجتماعی', value: 'tamin' },
                    { label: 'سلامت', value: 'salamat' },
                    { label: 'آزاد', value: 'azad' },
                  ]}
                  value={insurance}
                  onChange={val => setInsurance(val as string)}
                  placeholder={t('insurancePlaceholder')}
                />
                <div className="flex items-center gap-6 mt-4">
                  <span className="font-medium">{t('doctorSexLabel')}</span>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="doctorSex" value="all" checked={doctorSex === "all"} onChange={() => setDoctorSex("all")}
                      className="accent-blue-600" /> {t('doctorSexAll')}
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="doctorSex" value="male" checked={doctorSex === "male"} onChange={() => setDoctorSex("male")}
                      className="accent-blue-600" /> {t('doctorSexMale')}
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="doctorSex" value="female" checked={doctorSex === "female"} onChange={() => setDoctorSex("female")}
                      className="accent-blue-600" /> {t('doctorSexFemale')}
                  </label>
                </div>
                <div className="mt-4">
                  <Toggle
                    label={t('withAvailableAppointment')}
                    name="withAvailableAppointment"
                    checked={withAvailableAppointment}
                    onChange={setWithAvailableAppointment}
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-blue-500 text-sm hover:text-blue-700 transition"
                    onClick={() => setShowFilters(false)}
                  >
                    {t('closeFilters')}
                  </button>
                </div>
              </div>
              
              {/* More Filters Button */}
              <div className="mt-4">
                {!showFilters && (
                  <button
                    type="button"
                    className="px-4 py-2 text-blue-500 text-sm hover:text-blue-700 transition"
                    onClick={() => setShowFilters(true)}
                  >
                    {t('moreFilters')}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                style={{ marginTop: '0.5rem' }}
                onClick={() => {
                  // Build params for services page
                  const params = new URLSearchParams();
                  params.set('category', 'office');
                  if (specialty) params.set('specialty', specialty);
                  if (service) params.set('service', service);
                  if (city) params.set('city', city);
                  if (insurance) params.set('insurance', insurance);
                  if (doctorSex) params.set('doctorSex', doctorSex);
                  if (withAvailableAppointment) params.set('withAvailableAppointment', '1');
                  router.push(`/fa/services?${params.toString()}`);
                }}
              >
                {t('searchAppointment')}
              </button>

            </div>
          </div>
        </div>
      </section>
      <h1 className="text-2xl font-bold mb-4 text-center">
        {t("title")}
      </h1>
      <p className="text-center text-zinc-600 dark:text-zinc-300 mb-8">
        {t("description")}
      </p>
      {/* Add your appointment form or content here */}
    </div>
  );
}

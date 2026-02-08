"use client";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/solid';
import React, { useState } from "react";
import AppointmentDateRangeManagement, { AppointmentDateObj } from "./AppointmentDateRangeManagement";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import { useTranslations } from "next-intl";

interface ServiceAppointmentProps {
  dates: AppointmentDateObj[];
  addresses: Array<{
    title: { [key: string]: string; en: string; fa: string; ar: string };
    description: { [key: string]: string; en: string; fa: string; ar: string };
  }>;
  lang: "fa" | "en" | "ar";
  serviceName?: { [key: string]: string; en: string; fa: string; ar: string };
  serviceImage?: string;
}

export default function ServiceAppointment({ dates, addresses, lang, serviceName, serviceImage }: ServiceAppointmentProps) {
  const t = useTranslations("appointment");
  // Step titles translation keys
  const stepTitles = {
    1: t('step1Title'),
    2: t('step2Title'),
    3: t('step3Title'),
  };
  const [selectedDate, setSelectedDate] = useState<AppointmentDateObj | undefined>(undefined);
  const [step, setStep] = useState<1 | 2 | 3>(() => (addresses.length === 1 ? 1 : 1));
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number | null>(addresses.length === 1 ? 0 : null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // If only one address, skip step 2 and select it by default after date selection
  const [showNoAppointments, setShowNoAppointments] = useState(false);
  const handleDateSelect = (dateObj: AppointmentDateObj) => {
    setSelectedDate(dateObj);
    if (dateObj.availableAppointments === 0) {
      setShowNoAppointments(true);
      return;
    }
    setShowNoAppointments(false);
    // Do not change step automatically
    if (addresses.length === 1) {
      setSelectedAddressIdx(0);
    }
  };
  const handleAddressSelect = (idx: number) => {
    setSelectedAddressIdx(idx);
    // Do not change step automatically
  };
  // Store mock times for each date
  const [mockTimesByDate, setMockTimesByDate] = useState<{ [date: string]: { time: string; isAvailable: boolean }[] }>({});

  // Generate mock times for a date if not already present
  const getMockTimes = (date: string) => {
    if (!mockTimesByDate[date]) {
      const times = Array.from({ length: 15 }, (_, i) => {
        const hour = 8 + i;
        return {
          time: `${hour.toString().padStart(2, '0')}:00`,
          isAvailable: Math.random() > 0.3 // 70% chance available
        };
      });
      setMockTimesByDate(prev => ({ ...prev, [date]: times }));
      return times;
    }
    return mockTimesByDate[date];
  };

  // --- Unified top section for all steps ---
  return (
    <div className="w-full min-h-[360px]">
      {/* Only render info row if at least one of name, date, address is present */}
      {(serviceName || selectedDate || selectedAddressIdx !== null) && (
        <>
          <div className="flex items-center gap-4 mb-6">
            {/* Service image on the start (left) side */}
            {typeof serviceImage === 'string' && (
              <img src={serviceImage} alt="service" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            )}
            {/* Info stack: name, date, location */}
            <div className="flex flex-col gap-2">
              {serviceName && (
                <div className="font-bold text-lg leading-tight">{serviceName[lang]}</div>
              )}
              {selectedDate && step > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {(() => {
                      const dateObj = new Date(selectedDate.date);
                      let dayName = "";
                      if (
                        dateObj.getFullYear() === new Date().getFullYear() &&
                        dateObj.getMonth() === new Date().getMonth() &&
                        dateObj.getDate() === new Date().getDate()
                      ) {
                        dayName = t("today");
                      } else if (lang === "fa") {
                        dayName = momentJalaali(dateObj).locale("fa").format("dddd");
                      } else {
                        dayName = moment(dateObj).locale(lang).format("dddd");
                      }
                      const formattedDate = lang === "fa"
                        ? momentJalaali(dateObj).locale("fa").format("jYYYY/jMM/jDD")
                        : moment(dateObj).locale(lang).format("YYYY/MM/DD");
                      return `${dayName} - ${formattedDate}`;
                    })()}
                  </span>
                </div>
              )}
              {selectedAddressIdx !== null && step > 2 && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600 text-sm">{addresses[selectedAddressIdx].description[lang]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step title */}
          {<div className="mt-6 mb-2 text-md text-gray-400 text-center">{stepTitles[step]}</div>}
        </>
      )}

      {/* Step 1: Date selection */}
      {step === 1 && (
        <>
          <AppointmentDateRangeManagement
            dates={dates}
            lang={lang}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
          {/* Full-width Select and Continue button for step 1 */}
          {selectedDate && selectedDate.availableAppointments > 0 && (
            <button
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
              onClick={() => {
                if (addresses.length === 1) {
                  setSelectedAddressIdx(0);
                  setStep(3);
                } else {
                  setStep(2);
                }
              }}
            >
              {t('selectAndContinue')}
            </button>
          )}
        </>
      )}

      {/* Show message and button only when user selects a date with 0 availableAppointments */}
      {showNoAppointments && selectedDate && selectedDate.availableAppointments === 0 && (
        <div className="flex flex-col items-center gap-3 my-3">
          <div className="text-gray-600 text-base text-lg">{t('noAppointmentsForThisDay')}</div>
          <button
            className="flex bg-green-600 text-white px-20 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            onClick={() => {
              if (!selectedDate) return;
              // Find the next available date after the selected date
              const selectedIdx = dates.findIndex(d => d.date === selectedDate.date);
              let nextAvailable = null;
              if (selectedIdx !== -1) {
                for (let i = selectedIdx + 1; i < dates.length; i++) {
                  if (dates[i].availableAppointments > 0) {
                    nextAvailable = dates[i];
                    break;
                  }
                }
              }
              // If not found, select the nearest available date to today
              if (!nextAvailable) {
                const today = new Date();
                let minDiff = Infinity;
                dates.forEach(d => {
                  if (d.availableAppointments > 0) {
                    const diff = Math.abs(new Date(d.date).getTime() - today.getTime());
                    if (diff < minDiff) {
                      minDiff = diff;
                      nextAvailable = d;
                    }
                  }
                });
              }
              if (nextAvailable) {
                setSelectedDate(nextAvailable);
                setShowNoAppointments(false);
                if (addresses.length === 1) {
                  setSelectedAddressIdx(0);
                }
                // Do not change step
              }
            }}
          >
            {t('goToNextAvailableAppointment')}
            {(lang === "fa" || lang === "ar") ? <ChevronLeftIcon className="w-5 h-5 ms-2" /> : <ChevronRightIcon className="w-5 h-5 ms-2" />}
          </button>
        </div>
      )}

      {/* Step 2: Location selection (if more than 1 location) */}
      {step === 2 && selectedDate && addresses.length > 1 && (
        <div className="flex flex-col gap-6">
          <div>
            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-4 cursor-pointer transition-all shadow-sm mb-3 hover:border-blue-400 flex items-start gap-3 ${selectedAddressIdx === idx ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}
                onClick={() => handleAddressSelect(idx)}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressIdx === idx}
                  onChange={() => handleAddressSelect(idx)}
                  className="mt-1 accent-blue-600"
                  onClick={e => e.stopPropagation()}
                />
                <div>
                  <span className="text-gray-700 font-semibold block">{addr.title[lang]}</span>
                  <span className="text-gray-500 text-xs block">{addr.description[lang]}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Full-width Select and Continue button for step 2 */}
          {selectedAddressIdx !== null && (
            <button
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
              onClick={() => setStep(3)}
            >
              {t('selectAndContinue')}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Time selection */}
      {step === 3 && selectedDate && selectedAddressIdx !== null && (
        <div className="flex flex-col gap-6">
          {/* Available times */}
          <div className="flex flex-wrap">
            {getMockTimes(selectedDate.date).map((item, idx) => (
              <div
                key={item.time}
                className={`flex justify-center items-center rounded-lg text-[14px] font-normal leading-6 m-[6px] w-[calc(20%-12px)] h-[36px] px-[12px] border transition-all
                  ${item.isAvailable
                    ? 'border-green-600 text-green-700 bg-white cursor-pointer hover:bg-green-100/100'
                    : 'border-[#F2F4F7] text-[#98A2B3] bg-[linear-gradient(0deg,#F2F4F7,#F2F4F7),linear-gradient(0deg,#F9FAFB,#F9FAFB)] cursor-not-allowed'}
                  ${selectedTime === item.time && item.isAvailable ? 'ring-2 ring-green-600 bg-green-100/100' : ''}
                `}
                style={{ minWidth: 70, minHeight: 40 }}
                onClick={() => item.isAvailable && setSelectedTime(item.time)}
              >
                {item.time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

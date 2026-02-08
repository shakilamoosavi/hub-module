"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from "@heroicons/react/24/solid";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import "moment/locale/fa";
import { useTranslations } from "next-intl";

export type AppointmentDateObj = {
  date: string; // ISO string or 'YYYY-MM-DD'
  availableAppointments: number;
};

export type AppointmentDateRangeManagementProps = {
  dates: AppointmentDateObj[];
  lang: "fa" | "en" | "ar";
  selectedDate?: AppointmentDateObj;
  onSelect?: (item: AppointmentDateObj) => void;
};

export default function AppointmentDateRangeManagement(props: AppointmentDateRangeManagementProps) {

function getDayName(date: Date, lang: string, t: any): string {
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return t("today");
  }
  if (lang === "fa") {
    return momentJalaali(date).locale("fa").format("dddd");
  }
  return moment(date).locale(lang).format("dddd");
}

  const { dates = [], lang, selectedDate, onSelect } = props;
  const t = useTranslations("appointment");
  const VISIBLE_COUNT = 5;
  const [startIdx, setStartIdx] = useState(0);
  const endIdx = Math.min(startIdx + VISIBLE_COUNT, dates.length);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollStarted, setScrollStarted] = useState(false);

  // For Jalaali, use moment-jalaali
  const formatDate = (date: Date) => {
    if (lang === "fa") {
      return momentJalaali(date).locale("fa").format("jYYYY/jMM/jDD");
    }
    return moment(date).locale(lang).format("YYYY/MM/DD");
  };

  const handlePrev = () => {
    setScrollStarted(true);
    setStartIdx((prev) => {
      const newIdx = Math.max(0, prev - VISIBLE_COUNT);
      return newIdx;
    });
  };
  const handleNext = () => {
    setScrollStarted(true);
    setStartIdx((prev) => {
      const newIdx = Math.min(dates.length - VISIBLE_COUNT, prev + VISIBLE_COUNT);
      return newIdx;
    });
  };

  useEffect(() => {
    // Scroll to the first visible card smoothly
    if (cardRefs.current[0] && cardRefs.current[startIdx]) {
      cardRefs.current[startIdx]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [startIdx]);

  return (
    <div className="w-full py-4 flex items-center justify-center gap-2">
      <XCircleIcon 
        className={`w-6 h-6 text-gray-400 ${(!scrollStarted && (dates.length <= VISIBLE_COUNT)) ? '' : 'opacity-0 pointer-events-none'}`}
        title="Not available" 
      />
      <button
        onClick={handlePrev}
        className={`p-2 rounded-full border border-gray-200 bg-white shadow transition ${(startIdx === 0) ? 'opacity-0 pointer-events-none' : ''}`}
        aria-label="Previous dates"
      >
        {(lang === "fa" || lang === "ar") ? <ChevronRightIcon className="w-4 h-4 text-gray-400" /> : <ChevronLeftIcon className="w-4 h-4 text-gray-400" />}
      </button>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ scrollBehavior: 'smooth', maxWidth: 650 }}>
        {dates.map((item, idx) => {
          const isVisible = idx >= startIdx && idx < endIdx;
          const dateObj = new Date(item.date);
          const isSelected = selectedDate && item.date === selectedDate.date;
          return (
            <div
              key={item.date}
              ref={el => { cardRefs.current[idx] = el; }}
              className={`min-w-[110px] px-4 py-5 rounded-lg shadow border cursor-pointer transition-all
                ${isSelected ? "border-blue-600 bg-blue-100 text-blue-600" : "border-gray-200 bg-white text-gray-600 hover:bg-blue-100"}
                ${isVisible ? '' : 'opacity-0 pointer-events-none'}`}
              style={{ transition: 'opacity 0.3s, transform 0.3s' }}
              onClick={() => onSelect && onSelect(item)}
            >
              <div className={`text-sm text-center mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                {getDayName(dateObj, lang, t)}
              </div>
              <div className={`text-lg text-center mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                {formatDate(dateObj)}
              </div>
              <div className={`text-xs text-center ${isSelected ? 'text-blue-600' : 'text-green-600'}`}>
                { item.availableAppointments ? t("availableAppointments", { count: item.availableAppointments }) : '-'}
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleNext}
        className={`p-2 rounded-full border border-gray-200 bg-white shadow transition ${(endIdx >= dates.length) ? 'opacity-0 pointer-events-none' : ''}`}
        aria-label="Next dates"
      >
        {(lang === "fa" || lang === "ar") ? <ChevronLeftIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  );
}

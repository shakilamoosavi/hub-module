import React from "react";
import dynamic from "next/dynamic";
import { BuildingLibraryIcon, PhoneIcon, ChatBubbleLeftRightIcon, FunnelIcon, XMarkIcon, CalendarDaysIcon, CloudIcon } from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import "moment/locale/fa";
import Dropdown from "./Dropdown";
import { useRouter, useSearchParams } from "next/navigation";
import Toggle from "./Toggle";

const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });

const toIsoDateString = (dateObject: DateObject) => {
  // Convert to Gregorian DateObject, then to native Date and format with moment
  // to guarantee ASCII digits in the ISO string (avoid localized numerals).
  const asGregorian = new DateObject(dateObject).convert(gregorian);
  const jsDate = asGregorian.toDate();
  // Force English locale here to ensure ASCII digits (not localized numerals)
  return moment(jsDate).locale('en').format("YYYY-MM-DD");
};

const convertIsoToDateObject = (value: string, isFaLocale: boolean) => {
  if (!value) {
    return null;
  }
  const base = new DateObject({
    date: value,
    format: "YYYY-MM-DD",
    calendar: gregorian,
    locale: gregorian_en,
  });
  return isFaLocale ? base.convert(persian) : base;
};



const FILTER_TABS = [
  { key: 'office', labelKey: 'tabOffice' },
  { key: 'phone', labelKey: 'tabPhone' },
  { key: 'text', labelKey: 'tabText' },
  { key: 'ai', labelKey: 'tabAI' },
] as const;

type FilterTabKey = typeof FILTER_TABS[number]['key'];

type OfficeFilters = {
  specialty: string;
  service: string;
  // city: string;
  area: string;
  insurance: string;
  doctorSex: 'all' | 'male' | 'female';
  nearestToLocation: boolean;
  withAvailableAppointment: boolean;
  fromDate: string;
  toDate: string;
};

type PhoneFilters = {
  specialty: string;
  withAvailableAppointment: boolean;
  fromDate: string;
  toDate: string;
};

type TextFilters = {
  specialty: string;
  doctorSex: 'all' | 'male' | 'female';
  fromDate: string;
  toDate: string;
};

type AiFilters = {
  specialty: string;
  doctorSex: 'all' | 'male' | 'female';
  fromDate: string;
  toDate: string;
};

type FiltersState = {
  office: OfficeFilters;
  phone: PhoneFilters;
  text: TextFilters;
  ai: AiFilters;
};

const DEFAULT_FILTERS: FiltersState = {
  office: {
    specialty: '',
    service: '',
    // city: '',
    area: '',
    insurance: '',
    doctorSex: 'all',
    nearestToLocation: false,
    withAvailableAppointment: false,
    fromDate: '',
    toDate: '',
  },
  phone: {
    specialty: '',
    withAvailableAppointment: false,
    fromDate: '',
    toDate: '',
  },
  text: {
    specialty: '',
    doctorSex: 'all',
    fromDate: '',
    toDate: '',
  },
  ai: {
    specialty: '',
    doctorSex: 'all',
    fromDate: '',
    toDate: '',
  },
};

const cloneTabDefaults = <T extends FilterTabKey>(tab: T): FiltersState[T] => ({
  ...DEFAULT_FILTERS[tab],
});

const createDefaultFilters = (): FiltersState => ({
  office: cloneTabDefaults('office'),
  phone: cloneTabDefaults('phone'),
  text: cloneTabDefaults('text'),
  ai: cloneTabDefaults('ai'),
});


type ServicesFilterProps = {
  selected: FilterTabKey;
  onChange: (key: FilterTabKey) => void;
};

export default function ServicesFilter({ selected, onChange }: ServicesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("services.filters");
  const locale = useLocale();
  const isFaLocale = locale?.startsWith('fa');
  const calendarConfig = React.useMemo(() => (isFaLocale ? persian : gregorian), [isFaLocale]);
  const localeConfig = React.useMemo(() => (isFaLocale ? persian_fa : gregorian_en), [isFaLocale]);

  // Today's date as a DateObject in the correct calendar/locale for the picker
  const todayDateObject = React.useMemo(() => {
    const base = new DateObject({ date: new Date(), calendar: gregorian, locale: gregorian_en });
    return isFaLocale ? base.convert(persian) : base;
  }, [isFaLocale]);

  const [filters, setFilters] = React.useState<FiltersState>(() => ({
    office: cloneTabDefaults('office'),
    phone: cloneTabDefaults('phone'),
    text: cloneTabDefaults('text'),
    ai: cloneTabDefaults('ai'),
  }));

  // Refs and state for dynamic sizing of the scrollable filter area
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const tabsRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [maxContentHeight, setMaxContentHeight] = React.useState<number | undefined>(undefined);

  // Compute available height for the content area (viewport minus header/footer/tabs/margins)
  const updateMaxContentHeight = React.useCallback(() => {
    if (!contentRef.current) return;
    const headerPaddingTop = parseFloat(getComputedStyle(document.body).paddingTop || '0') || 0;
    const footerEl = document.querySelector('footer');
    const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
    const tabsHeight = tabsRef.current ? tabsRef.current.getBoundingClientRect().height : 0;
    const extraMargins = 50; // margins/paddings to keep some breathing room
    const available = Math.max(120, window.innerHeight - headerPaddingTop - footerHeight - tabsHeight - extraMargins);
    setMaxContentHeight(available);
  }, []);

  React.useEffect(() => {
    updateMaxContentHeight();
    window.addEventListener('resize', updateMaxContentHeight);
    return () => window.removeEventListener('resize', updateMaxContentHeight);
  }, [updateMaxContentHeight]);

  const searchParamsString = searchParams.toString();

  // Sync tab and filters from route params
  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const tabParam = params.get('category');
    const routeTab = FILTER_TABS.some(tab => tab.key === tabParam)
      ? (tabParam as FilterTabKey)
      : selected;

    if (tabParam && routeTab !== selected) {
      onChange(routeTab);
    }

    const filterDefaults = DEFAULT_FILTERS[routeTab];
    const parsedFilters: Partial<typeof filterDefaults> = {};
    let shouldUpdate = false;
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

    Object.entries(filterDefaults).forEach(([key, defaultValue]) => {
      const value = params.get(key);
      if (value === null) {
        return;
      }
      if (typeof defaultValue === 'boolean') {
        // Store as string '1' or '' to match type
        parsedFilters[key as keyof typeof filterDefaults] = value === '1' ? '1' : '';
        shouldUpdate = true;
        return;
      }
      // Ensure string for string fields
      if (typeof defaultValue === 'string') {
        parsedFilters[key as keyof typeof filterDefaults] = String(value);
        shouldUpdate = true;
        return;
      }
      if ((key === 'fromDate' || key === 'toDate')) {
        if (!isoRegex.test(value)) {
          return;
        }
        parsedFilters[key as keyof typeof filterDefaults] = value as any;
        shouldUpdate = true;
        return;
      }
      parsedFilters[key as keyof typeof filterDefaults] = value as any;
      shouldUpdate = true;
    });

    if (shouldUpdate) {
      setFilters(prev => ({
        ...prev,
        [routeTab]: {
          ...prev[routeTab],
          ...parsedFilters,
        },
      }));
    }
  }, [onChange, searchParamsString, selected]);
  // Dummy dropdown data
  const specialtyList = [
    { label: t('specialty1'), value: 'spec1' },
    { label: t('specialty2'), value: 'spec2' },
  ];
  const serviceList = [
    { label: t('service1'), value: 'srv1' },
    { label: t('service2'), value: 'srv2' },
  ];
  // const cityList = [
  //   { label: t('city1'), value: 'tehran' },
  //   { label: t('city2'), value: 'isfahan' },
  // ];
  const areaList = [
    { label: t('area1'), value: 'area1' },
    { label: t('area2'), value: 'area2' },
  ];
  const insuranceList = [
    { label: t('insurance1'), value: 'tamin' },
    { label: t('insurance2'), value: 'salamat' },
  ];

  const updateFilters = <T extends FilterTabKey>(tab: T, updates: Partial<FiltersState[T]>, options?: { syncRoute?: boolean }) => {
    setFilters(prev => {
      // If either fromDate or toDate is present in updates, always set both explicitly
      if ('fromDate' in updates || 'toDate' in updates) {
        return {
          ...prev,
          [tab]: {
            ...prev[tab],
            fromDate: updates.fromDate !== undefined ? updates.fromDate : prev[tab].fromDate,
            toDate: updates.toDate !== undefined ? updates.toDate : prev[tab].toDate,
            ...Object.fromEntries(Object.entries(updates).filter(([k]) => k !== 'fromDate' && k !== 'toDate')),
          },
        };
      }
      return {
        ...prev,
        [tab]: {
          ...prev[tab],
          ...updates,
        },
      };
    });

    if (options?.syncRoute === false) {
      return;
    }

    // Update route params
    const params = new URLSearchParams(searchParams.toString());
    // Always set tab in route
    params.set('category', tab);
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        // Only add boolean if true, remove if false
        if (value) {
          params.set(key, "1");
        } else {
          params.delete(key);
        }
      } else if (value && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push("?" + params.toString());
  };


  // Handle fromDate change
  const handleFromDateChange = (tab: FilterTabKey, value: DateObject | null) => {
    const fromDate = value ? toIsoDateString(value) : '';
    // Whenever fromDate changes, clear toDate so user picks a new toDate
    updateFilters(tab, { fromDate, toDate: '' });
  };

  // Handle toDate change
  const handleToDateChange = (tab: FilterTabKey, value: DateObject | null) => {
    const toDate = value ? toIsoDateString(value) : '';
    updateFilters(tab, { toDate });
  };

  const getFromDateValue = (tab: FilterTabKey): DateObject | null => {
    const tabFilters = filters[tab];
    return tabFilters.fromDate ? convertIsoToDateObject(tabFilters.fromDate, Boolean(isFaLocale)) : null;
  };

  const getToDateValue = (tab: FilterTabKey): DateObject | null => {
    const tabFilters = filters[tab];
    return tabFilters.toDate ? convertIsoToDateObject(tabFilters.toDate, Boolean(isFaLocale)) : null;
  };

  const renderDateSection = (tab: FilterTabKey) => (
    <div className="border-b border-gray-100 pb-4">
      <label className="mb-2 block text-sm font-medium text-gray-900">{t('fromDateLabel')}</label>
      <div className="relative">
        <CalendarDaysIcon className={`w-5 h-5 text-gray-400 absolute top-3 ${isFaLocale ? 'right-3' : 'left-3'} pointer-events-none`} />
        <DatePicker
          value={getFromDateValue(tab)}
          onChange={(value: unknown) => handleFromDateChange(tab, value as DateObject | null)}
          minDate={todayDateObject as any}
          format="YYYY-MM-DD"
          calendar={calendarConfig}
          locale={localeConfig}
          calendarPosition="bottom-center"
          containerClassName="w-full"
          style={{ borderColor: 'var(--border-color-1)' }}
          inputClass={`w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none text-gray-900 pl-10 pr-10`}
          placeholder={t('fromDatePlaceholder')}
        />
        {getFromDateValue(tab) && (
          <button
            type="button"
            aria-label={t('clear')}
            onClick={() => handleFromDateChange(tab, null)}
            className={`absolute top-2 ${isFaLocale ? 'left-3' : 'right-3'} p-1 text-gray-400 hover:text-gray-600`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {filters[tab].fromDate && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-900">{t('toDateLabel')}</label>
          <div className="relative">
            <CalendarDaysIcon className={`w-5 h-5 text-gray-400 absolute top-3 ${isFaLocale ? 'right-3' : 'left-3'} pointer-events-none`} />
            <DatePicker
              value={getToDateValue(tab)}
              onChange={(value: unknown) => handleToDateChange(tab, value as DateObject | null)}
              {...(getFromDateValue(tab) ? {
                minDate: (() => {
                  const from = getFromDateValue(tab);
                  if (!from) return undefined;
                  // Add 1 day to fromDate (create new DateObject to avoid mutation)
                  const plusOne = new DateObject(from).add(1, 'day');
                  return plusOne;
                })() as any
              } : {})}
              format="YYYY-MM-DD"
              calendar={calendarConfig}
              locale={localeConfig}
              calendarPosition="bottom-center"
              containerClassName="w-full"
              style={{ borderColor: 'var(--border-color-1)' }}
              inputClass={`w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none text-gray-900 pl-10 pr-10`}
              placeholder={t('toDatePlaceholder')}
            />
            {getToDateValue(tab) && (
              <button
                type="button"
                aria-label={t('clear')}
                onClick={() => handleToDateChange(tab, null)}
                className={`absolute top-2 ${isFaLocale ? 'left-3' : 'right-3'} p-1 text-gray-400 hover:text-gray-600`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const resetFilters = (tab: FilterTabKey) => {
    setFilters(prev => ({
      ...prev,
      [tab]: cloneTabDefaults(tab),
    }));
    // Remove all params for this tab
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(DEFAULT_FILTERS[tab]).forEach(key => {
      params.delete(key);
    });
    // Always set tab in route
    params.set('category', tab);
    router.push("?" + params.toString());
  };

  const hasActiveFilters = React.useMemo(() => {
    const selectedFilters = filters[selected];
    const defaults = DEFAULT_FILTERS[selected];
    return (Object.keys(selectedFilters) as Array<keyof typeof selectedFilters>).some(key => {
      if (key === 'fromDate' || key === 'toDate') {
        return Boolean(selectedFilters.fromDate && selectedFilters.toDate);
      }
      return selectedFilters[key] !== defaults[key];
    });
  }, [filters, selected]);

  const activeFilters = React.useMemo(() => {
    const selectedFilters = filters[selected];
    const defaults = DEFAULT_FILTERS[selected];
    const activeEntries = Object.entries(selectedFilters)
      .filter(([key, value]) => key !== 'fromDate' && key !== 'toDate' && value !== (defaults as any)[key])
      .map(([key, value]) => ({ key, value }));
    // Show fromDate and toDate if set and valid
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (selectedFilters.fromDate && isoRegex.test(selectedFilters.fromDate)) {
      activeEntries.push({ key: 'fromDate', value: selectedFilters.fromDate });
    }
    if (selectedFilters.fromDate && selectedFilters.toDate && isoRegex.test(selectedFilters.toDate)) {
      activeEntries.push({ key: 'toDate', value: selectedFilters.toDate });
    }
    return activeEntries;
  }, [filters, selected]);

  // Remove a single filter
  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterKey === 'fromDate') {
      updateFilters(selected, { fromDate: '', toDate: '' }, { syncRoute: false });
      params.delete('fromDate');
      params.delete('toDate');
    } else if (filterKey === 'toDate') {
      updateFilters(selected, { toDate: '' }, { syncRoute: false });
      params.delete('toDate');
    } else {
      updateFilters(selected, { [filterKey]: (DEFAULT_FILTERS[selected] as any)[filterKey] }, { syncRoute: false });
      params.delete(filterKey);
    }
    params.set('category', selected);
    router.push("?" + params.toString());
  };

  // Helper to get translated value for filter summary
  const getFilterValueLabel = (key: string, value: any) => {
    if (key === 'fromDate' && value) {
      // Show formatted fromDate
      if (Boolean(isFaLocale)) {
        const m = momentJalaali(value, 'YYYY-MM-DD');
        return m.isValid() ? `از تاریخ ${m.locale('fa').format('jYYYY/jMM/jDD')}` : value;
      }
      const m = moment(value, 'YYYY-MM-DD');
      return m.isValid() ? `From ${m.format('YYYY/MM/DD')}` : value;
    }
    if (key === 'toDate' && value) {
      // Show formatted toDate
      if (Boolean(isFaLocale)) {
        const m = momentJalaali(value, 'YYYY-MM-DD');
        return m.isValid() ? `تا تاریخ ${m.locale('fa').format('jYYYY/jMM/jDD')}` : value;
      }
      const m = moment(value, 'YYYY-MM-DD');
      return m.isValid() ? `To ${m.format('YYYY/MM/DD')}` : value;
    }
    // Dropdowns
    if (key === 'specialty') {
      const item = specialtyList.find(i => i.value === value);
      return item ? item.label : value;
    }
    if (key === 'service') {
      const item = serviceList.find(i => i.value === value);
      return item ? item.label : value;
    }
    // if (key === 'city') {
    //   const item = cityList.find(i => i.value === value);
    //   return item ? item.label : value;
    // }
    if (key === 'area') {
      const item = areaList.find(i => i.value === value);
      return item ? item.label : value;
    }
    if (key === 'insurance') {
      const item = insuranceList.find(i => i.value === value);
      return item ? item.label : value;
    }
    // Enums
    if (key === 'doctorSex') {
      return t('doctorSex' + (value.charAt(0).toUpperCase() + value.slice(1)));
    }
    // Booleans
    if (typeof value === 'boolean') {
      return t(key);
    }
    // Default
    return value;
  };

  return (
    <div ref={rootRef} className="w-full flex flex-col md:rounded-2xl bg-white md:shadow-sm mb-3">
      {/* Filters label and delete button row */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="font-semibold text-gray-700 flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-blue-500" />
          {t('filters')}
        </span>
          {hasActiveFilters && (
          <button
            className="text-red-600 text-xs font-sm py-1 px-2 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-1"
            onClick={() => resetFilters(selected)}
          >
            {t('deleteAllFilters')}
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Tabs at the top - fixed */}
      <div ref={tabsRef} className="flex flex-row border-b border-gray-200 sticky top-0 bg-white z-10">
        {FILTER_TABS.map(tab => (
          <div
            key={tab.key}
            className={`flex-1 text-xs text-center cursor-pointer px-0 py-2 font-sm transition border-b-2 flex items-center justify-center gap-2 ${selected === tab.key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-700 hover:bg-blue-50'}`}
            onClick={() => {
              // If changing to a different tab, clear all filters except category and reset filter state
              if (tab.key !== selected) {
                const params = new URLSearchParams();
                params.set('category', tab.key);
                router.push('?' + params.toString());
                setFilters(prev => ({
                  ...prev,
                  [tab.key]: cloneTabDefaults(tab.key as FilterTabKey),
                }));
                onChange(tab.key);
              }
            }}
            role="tab"
            aria-selected={selected === tab.key}
            tabIndex={0}
          >
            {tab.key === 'office' && <BuildingLibraryIcon className="w-5 h-5" />}
            {tab.key === 'phone' && <PhoneIcon className="w-5 h-5" />}
            {tab.key === 'text' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
            {tab.key === 'ai' && <CloudIcon className="w-5 h-5" />}
            {t(tab.labelKey)}
          </div>
        ))}
      </div>
      {/* Tab content below tabs - scrollable */}
      <div ref={contentRef} className="flex flex-col gap-4 p-4 overflow-y-auto flex-1 scrollbar-hide" style={{ minHeight: 0, maxHeight: maxContentHeight ? `${maxContentHeight}px` : undefined }}>
        {selected === 'office' && (
          <>
            {/* Filter summary bar */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-100 pb-2">
                {activeFilters.map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600">
                    <span>
                      {/* {t(key + 'Label')}: */}
                      {getFilterValueLabel(key, value)}</span>
                    <button
                      className="mx-1 text-gray-400 cursor-pointer focus:outline-none"
                      onClick={() => removeFilter(key)}
                      aria-label={t('removeFilter')}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderDateSection('office')}
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.office.specialty || ''} onChange={val => updateFilters('office', { specialty: String(val) })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('serviceLabel')} dataList={serviceList} value={filters.office.service || ''} onChange={val => updateFilters('office', { service: String(val) })} placeholder={t('servicePlaceholder')} />
            </div>
            <div className="flex gap-4 border-b border-gray-100 pb-4">
              {/* <Dropdown label={t('cityLabel')} dataList={cityList} value={filters.office.city || ''} onChange={val => updateFilters('office', { city: String(val) })} placeholder={t('cityPlaceholder')} /> */}
              <Dropdown label={t('areaLabel')} dataList={areaList} value={filters.office.area || ''} onChange={val => updateFilters('office', { area: String(val) })} placeholder={t('areaPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('insuranceLabel')} dataList={insuranceList} value={filters.office.insurance || ''} onChange={val => updateFilters('office', { insurance: String(val) })} placeholder={t('insurancePlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center mb-2">
                <span className="font-medium">{t('doctorSexLabel')}</span>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexOffice" value="all" checked={filters.office.doctorSex === 'all'} onChange={() => updateFilters('office', { doctorSex: 'all' })} className="accent-blue-600" /> {t('doctorSexAll')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexOffice" value="male" checked={filters.office.doctorSex === 'male'} onChange={() => updateFilters('office', { doctorSex: 'male' })} className="accent-blue-600" /> {t('doctorSexMale')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexOffice" value="female" checked={filters.office.doctorSex === 'female'} onChange={() => updateFilters('office', { doctorSex: 'female' })} className="accent-blue-600" /> {t('doctorSexFemale')}
                </label>
              </div>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t('nearestToLocation')}</span>
                <Toggle
                  size="sm"
                  label={undefined}
                  name="officeNearestToLocation"
                  checked={filters.office.nearestToLocation}
                  onChange={checked => updateFilters('office', { nearestToLocation: checked })}
                />
              </div>
            </div>
            <div className="pb-2 mb-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t('withAvailableAppointment')}</span>
                <Toggle
                  size="sm"
                  label={undefined}
                  name="officeWithAvailableAppointment"
                  checked={filters.office.withAvailableAppointment}
                  onChange={checked => updateFilters('office', { withAvailableAppointment: checked })}
                />
              </div>
            </div>
          </>
        )}
        {selected === 'phone' && (
          <>
            {/* Filter summary bar */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600">
                    <span>
                      {/* {t(key + 'Label')}: */}
                      {getFilterValueLabel(key, value)}</span>
                    <button
                      className="ml-2 text-gray-400 cursor-pointer focus:outline-none"
                      onClick={() => removeFilter(key)}
                      aria-label={t('removeFilter')}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderDateSection('phone')}
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.phone.specialty || ''} onChange={val => updateFilters('phone', { specialty: String(val) })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="pb-2 mb-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t('withAvailableAppointment')}</span>
                <Toggle
                  size="sm"
                  label={undefined}
                  name="phoneWithAvailableAppointment"
                  checked={filters.phone.withAvailableAppointment}
                  onChange={checked => updateFilters('phone', { withAvailableAppointment: checked })}
                />
              </div>
            </div>
          </>
        )}
        {selected === 'text' && (
          <>
            {/* Filter summary bar */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600">
                    <span>
                      {/* {t(key + 'Label')}: */}
                      {getFilterValueLabel(key, value)}</span>
                    <button
                      className="ml-2 text-gray-400 cursor-pointer focus:outline-none"
                      onClick={() => removeFilter(key)}
                      aria-label={t('removeFilter')}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderDateSection('text')}
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.text.specialty || ''} onChange={val => updateFilters('text', { specialty: String(val) })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="pb-2 mb-2">
              <div className="flex items-center mb-2">
                <span className="font-medium">{t('doctorSexLabel')}</span>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexText" value="all" checked={filters.text.doctorSex === 'all'} onChange={() => updateFilters('text', { doctorSex: 'all' })} className="accent-blue-600" /> {t('doctorSexAll')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexText" value="male" checked={filters.text.doctorSex === 'male'} onChange={() => updateFilters('text', { doctorSex: 'male' })} className="accent-blue-600" /> {t('doctorSexMale')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexText" value="female" checked={filters.text.doctorSex === 'female'} onChange={() => updateFilters('text', { doctorSex: 'female' })} className="accent-blue-600" /> {t('doctorSexFemale')}
                </label>
              </div>
            </div>
          </>
        )}
        {selected === 'ai' && (
          <>
            {/* Filter summary bar */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600">
                    <span>
                      {getFilterValueLabel(key, value)}
                    </span>
                    <button
                      className="ml-2 text-gray-400 cursor-pointer focus:outline-none"
                      onClick={() => removeFilter(key)}
                      aria-label={t('removeFilter')}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderDateSection('ai')}
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.ai.specialty || ''} onChange={val => updateFilters('ai', { specialty: String(val) })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="pb-2 mb-2">
              <div className="flex items-center mb-2">
                <span className="font-medium">{t('doctorSexLabel')}</span>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexAi" value="all" checked={filters.ai.doctorSex === 'all'} onChange={() => updateFilters('ai', { doctorSex: 'all' })} className="accent-blue-600" /> {t('doctorSexAll')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexAi" value="male" checked={filters.ai.doctorSex === 'male'} onChange={() => updateFilters('ai', { doctorSex: 'male' })} className="accent-blue-600" /> {t('doctorSexMale')}
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="doctorSexAi" value="female" checked={filters.ai.doctorSex === 'female'} onChange={() => updateFilters('ai', { doctorSex: 'female' })} className="accent-blue-600" /> {t('doctorSexFemale')}
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

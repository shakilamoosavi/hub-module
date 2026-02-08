import React from "react";
import { BuildingLibraryIcon, PhoneIcon, ChatBubbleLeftRightIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Dropdown from "./Dropdown";
import { useRouter, useSearchParams } from "next/navigation";
import Toggle from "./Toggle";

const FILTER_TABS = [
  { key: 'office', labelKey: 'tabOffice' },
  { key: 'phone', labelKey: 'tabPhone' },
  { key: 'text', labelKey: 'tabText' },
] as const;

type FilterTabKey = typeof FILTER_TABS[number]['key'];

type OfficeFilters = {
  specialty: string;
  service: string;
  city: string;
  area: string;
  insurance: string;
  doctorSex: 'all' | 'male' | 'female';
  nearestToLocation: boolean;
  withAvailableAppointment: boolean;
};

type PhoneFilters = {
  specialty: string;
  instantConsultation: boolean;
  withAvailableAppointment: boolean;
};

type TextFilters = {
  specialty: string;
  instantConsultation: boolean;
  doctorSex: 'all' | 'male' | 'female';
};

type FiltersState = {
  office: OfficeFilters;
  phone: PhoneFilters;
  text: TextFilters;
};

const DEFAULT_FILTERS: FiltersState = {
  office: {
    specialty: '',
    service: '',
    city: '',
    area: '',
    insurance: '',
    doctorSex: 'all',
    nearestToLocation: false,
    withAvailableAppointment: false,
  },
  phone: {
    specialty: '',
    instantConsultation: false,
    withAvailableAppointment: false,
  },
  text: {
    specialty: '',
    instantConsultation: false,
    doctorSex: 'all',
  },
};

const cloneTabDefaults = <T extends FilterTabKey>(tab: T): FiltersState[T] => ({
  ...DEFAULT_FILTERS[tab],
});

const createDefaultFilters = (): FiltersState => ({
  office: cloneTabDefaults('office'),
  phone: cloneTabDefaults('phone'),
  text: cloneTabDefaults('text'),
});

type ServicesFilterProps = {
  selected: FilterTabKey;
  onChange: (key: FilterTabKey) => void;
};

export default function ServicesFilter({ selected, onChange }: ServicesFilterProps) {
      const router = useRouter();
      const searchParams = useSearchParams();
      // Sync tab and filters from route params
      React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        // Set tab from route param if exists
        const tabParam = params.get('category');
        if (tabParam && FILTER_TABS.some(tab => tab.key === tabParam) && tabParam !== selected) {
          onChange(tabParam as FilterTabKey);
        }
        // Set filter values only for active tab, ignore keys for other tabs
        const filterDefaults = DEFAULT_FILTERS[selected];
        const newFilters: Partial<typeof filterDefaults> = {};
        let shouldUpdate = false;
        Object.entries(filterDefaults).forEach(([key, defaultValue]) => {
          const value = params.get(key);
          if (value !== null) {
            shouldUpdate = true;
            if (typeof defaultValue === 'boolean') {
              newFilters[key as keyof typeof filterDefaults] = value === '1';
            } else {
              newFilters[key as keyof typeof filterDefaults] = value;
            }
          }
        });
        if (shouldUpdate) {
          setFilters(prev => {
            // Reset all other tabs to default, only update active tab
            const newState: FiltersState = {
              ...prev,
            };
            FILTER_TABS.forEach(tab => {
              if (tab.key !== selected) {
                newState[tab.key] = cloneTabDefaults(tab.key);
              }
            });
            newState[selected] = {
              ...cloneTabDefaults(selected),
              ...newFilters,
            };
            return newState;
          });
        }
      }, [searchParams, selected]);
  const t = useTranslations("services.filters");
  // Dummy dropdown data
  const specialtyList = [
    { label: t('specialty1'), value: 'spec1' },
    { label: t('specialty2'), value: 'spec2' },
  ];
  const serviceList = [
    { label: t('service1'), value: 'srv1' },
    { label: t('service2'), value: 'srv2' },
  ];
  const cityList = [
    { label: t('city1'), value: 'tehran' },
    { label: t('city2'), value: 'isfahan' },
  ];
  const areaList = [
    { label: t('area1'), value: 'area1' },
    { label: t('area2'), value: 'area2' },
  ];
  const insuranceList = [
    { label: t('insurance1'), value: 'tamin' },
    { label: t('insurance2'), value: 'salamat' },
  ];

  const [filters, setFilters] = React.useState<FiltersState>(() => createDefaultFilters());

  const updateFilters = <T extends FilterTabKey>(tab: T, updates: Partial<FiltersState[T]>) => {
    setFilters(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...updates,
      },
    }));

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
    return Object.keys(selectedFilters).some(key => (
      (selectedFilters as Record<string, unknown>)[key] !== (defaults as Record<string, unknown>)[key]
    ));
  }, [filters, selected]);

  // Helper to get active filters for the selected tab
  const getActiveFilters = () => {
    const selectedFilters = filters[selected];
    const defaults = DEFAULT_FILTERS[selected];
    return Object.entries(selectedFilters)
      .filter(([key, value]) => value !== (defaults as any)[key])
      .map(([key, value]) => ({ key, value }));
  };

  // Remove a single filter
  const removeFilter = (filterKey: string) => {
    updateFilters(selected, { [filterKey]: (DEFAULT_FILTERS[selected] as any)[filterKey] });
    // Remove param from route
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterKey);
    router.push("?" + params.toString());
  };

  // Helper to get translated value for filter summary
  const getFilterValueLabel = (key: string, value: any) => {
    // Dropdowns
    if (key === 'specialty') {
      const item = specialtyList.find(i => i.value === value);
      return item ? item.label : value;
    }
    if (key === 'service') {
      const item = serviceList.find(i => i.value === value);
      return item ? item.label : value;
    }
    if (key === 'city') {
      const item = cityList.find(i => i.value === value);
      return item ? item.label : value;
    }
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
    <div className="w-full flex flex-col md:rounded-2xl bg-white md:shadow-sm h-screen max-h-screen">
      {/* Filters label and delete button row */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="font-semibold text-gray-700 flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-blue-500" />
          {t('filters')}
        </span>
          {hasActiveFilters && (
          <button
            className="text-red-600 text-sm font-sm py-1 px-2 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-1"
            onClick={() => resetFilters(selected)}
          >
            {t('deleteAllFilters')}
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Tabs at the top - fixed */}
      <div className="flex flex-row border-b border-gray-200 sticky top-0 bg-white z-10">
        {FILTER_TABS.map(tab => (
          <div
            key={tab.key}
            className={`flex-1 text-sm text-center cursor-pointer px-0 py-2 font-sm transition border-b-2 flex items-center justify-center gap-2 ${selected === tab.key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-700 hover:bg-blue-50'}`}
            onClick={() => {
              // Update tab in route
              const params = new URLSearchParams(searchParams.toString());
              params.set('category', tab.key);
              router.push('?' + params.toString());
              onChange(tab.key);
            }}
            role="tab"
            aria-selected={selected === tab.key}
            tabIndex={0}
          >
            {tab.key === 'office' && <BuildingLibraryIcon className="w-5 h-5" />}
            {tab.key === 'phone' && <PhoneIcon className="w-5 h-5" />}
            {tab.key === 'text' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
            {t(tab.labelKey)}
          </div>
        ))}
      </div>
      {/* Tab content below tabs - scrollable */}
      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
        {selected === 'office' && (
          <>
            {/* Filter summary bar */}
            {getActiveFilters().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-100 pb-2">
                {getActiveFilters().map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-sm font-medium text-gray-600">
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
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.office.specialty} onChange={val => updateFilters('office', { specialty: val })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('serviceLabel')} dataList={serviceList} value={filters.office.service} onChange={val => updateFilters('office', { service: val })} placeholder={t('servicePlaceholder')} />
            </div>
            <div className="flex gap-4 border-b border-gray-100 pb-4">
              <Dropdown label={t('cityLabel')} dataList={cityList} value={filters.office.city} onChange={val => updateFilters('office', { city: val })} placeholder={t('cityPlaceholder')} />
              <Dropdown label={t('areaLabel')} dataList={areaList} value={filters.office.area} onChange={val => updateFilters('office', { area: val })} placeholder={t('areaPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('insuranceLabel')} dataList={insuranceList} value={filters.office.insurance} onChange={val => updateFilters('office', { insurance: val })} placeholder={t('insurancePlaceholder')} />
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
            {getActiveFilters().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {getActiveFilters().map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-sm font-medium text-gray-600">
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
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.phone.specialty} onChange={val => updateFilters('phone', { specialty: val })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t('instantConsultation')}</span>
                <Toggle
                  size="sm"
                  label={undefined}
                  name="phoneInstantConsultation"
                  checked={filters.phone.instantConsultation}
                  onChange={checked => updateFilters('phone', { instantConsultation: checked })}
                />
              </div>
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
            {getActiveFilters().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {getActiveFilters().map(({ key, value }) => (
                  <div key={key} className="flex items-center rounded-2xl px-3 py-1 bg-gray-100 text-sm font-medium text-gray-600">
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
            <div className="border-b border-gray-100 pb-4">
              <Dropdown label={t('specialtyLabel')} dataList={specialtyList} value={filters.text.specialty} onChange={val => updateFilters('text', { specialty: val })} placeholder={t('specialtyPlaceholder')} />
            </div>
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900">{t('instantConsultation')}</span>
                <Toggle
                  size="sm"
                  label={undefined}
                  name="textInstantConsultation"
                  checked={filters.text.instantConsultation}
                  onChange={checked => updateFilters('text', { instantConsultation: checked })}
                />
              </div>
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
      </div>
    </div>
  );
}

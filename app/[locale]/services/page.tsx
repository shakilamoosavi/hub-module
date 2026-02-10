"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ServiceSearchModal } from '../../../components/ServiceSearchModal';
import ServiceAppointment from '../../../components/ServiceAppointment';
import ModalComponent from '../../../components/ModalComponent';
import ServicesFilter from '../../../components/ServicesFilter';
import ServiceSort from '../../../components/ServiceSort';
import { MapPinIcon, ArrowLeftIcon, BuildingLibraryIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { describe } from 'node:test';
import moment from 'moment';
import momentJalaali from 'moment-jalaali';

function BottomSheetModal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full rounded-t-2xl bg-white p-4 max-h-[80vh] overflow-y-auto animate-slideInUp">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">{title}</span>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
      <style jsx global>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 0.25s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
}

// Mock data generator
const mockLangs = ['en', 'fa', 'ar'] as const;
type Lang = typeof mockLangs[number];

// Helper to map full locale to short lang code
function getLangFromLocale(locale: string): Lang {
  if (locale.startsWith('fa')) return 'fa';
  if (locale.startsWith('ar')) return 'ar';
  return 'en';
}
const mockName = {
  en: (n: number) => `Dr. Mehdi Ghazi`,
  fa: (n: number) => `دکتر مهدی قاضی`,
  ar: (n: number) => `د. مهدي قاضي`
};
const mockDescription = {
  en: (n: number) => `Specialist in Urology`,
  fa: (n: number) => `متخصص اورولوژی`,
  ar: (n: number) => `أخصائي في المسالك البولية`
};
const mockAddress = [
  {
    title: {
      en: (n: number) => `Milad Crossroad Clinic`,
      fa: (n: number) => `مطب چهارراه میلاد`,
      ar: (n: number) => `مطب تقاطع ميلاد`
    },
    description: {
      en: (n: number) => `Azadehshahr, between Milad and Esteghlal 4 crossroads, No. 44, First Floor`,
      fa: (n: number) => `آزادشهر، بین چهارراه میلاد و استقلال 4 ،پلاک 44 ، طبقه اول`,
      ar: (n: number) => `آزادشهر، بين تقاطعي ميلاد واستقلال 4، رقم 44، الطابق الأول`
    }
  },
  {
    title: {
      en: (n: number) => `Outpatient Surgery Appointment Booking`,
      fa: (n: number) => `نوبت دهی جراحی سرپایی`,
      ar: (n: number) => `الحجز للجراحة بدون بستری`
    },
    description:   {
      en: (n: number) => `Azadehshahr, Maalem Blvd, opposite Pars Hotel, Yas Specialized Complex, 3rd Floor`,
      fa: (n: number) => `آزادشهر، بلوار معلم، روبروی هتل پارس، مجتمع فوق تخصصی یاس، طبقه 3`,
      ar: (n: number) => `آزادشهر، بلوار معلم، مقابل فندق پارس، مجمع ياس المتخصص، الطابق 3`
    }
  },
];
const mockFirstAvailableAppointment = {
  en: (n: number) => `Saturday, 14 February`,
  fa: (n: number) => `شنبه 25 بهمن`,
  ar: (n: number) => `السبت 14 فبراير`
};
const mockFacilities = [
  {
    en: (n: number) => `Insurance coverage`,
    fa: (n: number) => `پوشش دهی بیمه`,
    ar: (n: number) => `تغطية التأمين`
  },
  {
    en: (n: number) => `Minimum waiting time`,
    fa: (n: number) => `کمترین معطلی`,
    ar: (n: number) => `أقل انتظار`
  }
]

function generateMockServices(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const idx = start + i + 1;
    return {
      id: idx + '',
      name: {
        en: mockName.en(idx),
        fa: mockName.fa(idx),
        ar: mockName.ar(idx),
      },
      description: {
        en: mockDescription.en(idx),
        fa: mockDescription.fa(idx),
        ar: mockDescription.ar(idx),
      },
      address: [
        ...mockAddress.map(addr => ({
          title: {
            en: addr.title.en(idx),
            fa: addr.title.fa(idx),
            ar: addr.title.ar(idx),
          },
          description: {
            en: addr.description.en(idx),
            fa: addr.description.fa(idx),
            ar: addr.description.ar(idx),
          }
        }))
      ],
      firstAvailableAppointment: {
        en: mockFirstAvailableAppointment.en(idx),
        fa: mockFirstAvailableAppointment.fa(idx),
        ar: mockFirstAvailableAppointment.ar(idx),
      },
      facilities: mockFacilities.map(facility => ({
        en: facility.en(idx),
        fa: facility.fa(idx),
        ar: facility.ar(idx),
      })) as Array<LocalizedString>,
      office: true,
      phone: true,
      text: false,
      image: "https://statics.doctoreto.com/resize:fill:180:180:0/gravity:sm/format:webp/plain/s3://drto/avatar/doctor/2022/11/DyBGyti9hAuXCG77VN8tCJIq3p09TanMw6eqXcyT.jpg",
    };
  });
}
// Helper type for localized fields
type LocalizedString = { [key: string]: string; en: string; fa: string; ar: string };

export default function ServicesPage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = params as { locale: string };
  const cat = searchParams.get('cat');
  const [services, setServices] = useState(() => generateMockServices(0, 10));
  const [selectedTab, setSelectedTab] = useState<'office' | 'phone' | 'text'>('office');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');
  const loader = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<ReturnType<typeof generateMockServices>[number] | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const appointmentDates = useMemo(() => {
    // Read from/to from route params (ServicesFilter writes `fromDate` and `toDate`)
    const fromParam = searchParams.get('fromDate');
    const toParam = searchParams.get('toDate');
    const localeIsFa = locale?.startsWith('fa');

    const replacePersianDigits = (s: string) => {
      if (!s) return s;
      // Persian digits \u06F0-\u06F9 and Arabic-Indic \u0660-\u0669
      return s.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (ch) => {
        const code = ch.charCodeAt(0);
        // Persian
        if (code >= 0x06F0 && code <= 0x06F9) return String(code - 0x06F0);
        // Arabic-Indic
        if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
        return ch;
      });
    };

    // Determine start (fromDate) and end (toDate)
    const fromClean = fromParam ? replacePersianDigits(fromParam) : null;
    const toClean = toParam ? replacePersianDigits(toParam) : null;

    let start = fromClean ? moment(fromClean, 'YYYY-MM-DD', true) : moment();
    // If strict parse failed and locale is fa, try jalaali parse
    if (fromClean && !start.isValid() && localeIsFa) {
      try {
        const mj = momentJalaali(fromClean, 'jYYYY-jMM-jDD', true);
        if (mj.isValid()) start = moment(mj.toDate());
      } catch (_) {
        // ignore
      }
    }
    if (!fromClean) start = moment();

    let end: moment.Moment | null = null;
    if (toClean && fromClean) {
      end = moment(toClean, 'YYYY-MM-DD', true);
      if (!end.isValid() && localeIsFa) {
        try {
          const mj = momentJalaali(toClean, 'jYYYY-jMM-jDD', true);
          if (mj.isValid()) end = moment(mj.toDate());
        } catch (_) {
          // ignore
        }
      }
    }
    if (!end) {
      // If toDate missing or invalid, set to 30 days after start
      end = moment(start).add(30, 'days');
    }

    // Validate
    if (!start.isValid()) start = moment();
    if (!end.isValid() || end.isBefore(start)) end = moment(start).add(30, 'days');

    // Cap to reasonable amount to avoid huge arrays
    const maxDays = 365;
    const daysCount = Math.min(end.diff(start, 'days') + 1, maxDays);
    const arr: { date: string; availableAppointments: number }[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = moment(start).add(i, 'days');
      // Deterministic availability: vary by day number so UI looks realistic
      const availableAppointments = (d.date() % 7) === 0 ? 0 : ((d.date() % 5) + 1) * 2;
      // Force English digits in the ISO date string so `new Date(...)` parses it correctly
      arr.push({ date: d.locale('en').format('YYYY-MM-DD'), availableAppointments });
    }
    return arr;
  }, [searchParams.toString()]);

  const initialSearch = {
    date: searchParams.get('date') || undefined,
    country: searchParams.get('country') || undefined,
    province: searchParams.get('province') || undefined,
    city: searchParams.get('city') || undefined,
  };

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      const newServices = generateMockServices(services.length, 10);
      setServices((prev) => [...prev, ...newServices]);
      if (services.length + 10 >= 50) setHasMore(false); // mock end
      setLoading(false);
    }, 800);
  }, [loading, hasMore, services.length]);

  const handleSearch = (data: { date: string, country: string, province: string, city: string }) => {
    const params = new URLSearchParams({
      ...(cat ? { cat } : {}),
      date: data.date,
      country: data.country,
      province: data.province,
      city: data.city,
    });
    window.location.href = `/${locale}/services?${params.toString()}`;
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!loader.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Get category label if cat param exists
  let categoryLabel = null;
  if (cat && t.raw(`services.categories.${cat}`) !== `services.categories.${cat}`) {
    categoryLabel = t(`services.categories.${cat}`);
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4" style={{ borderColor: 'var(--border-color-1)' }}>
      {/* Mobile filter/sort buttons */}
      <div className="flex gap-3 mb-4 md:hidden">
        <button
          className="flex-1 rounded-full bg-blue-600 px-4 py-3 text-base font-bold text-white shadow-md"
          onClick={() => setMobileFilterOpen(true)}
        >
          {t('services.filtersLabel')}
        </button>
        <button
          className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-base font-bold text-blue-700 shadow-md border border-blue-200"
          onClick={() => setMobileSortOpen(true)}
        >
          {t('services.sortLabel')}
        </button>
      </div>
      <BottomSheetModal open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} title={t('services.filtersLabel')}>
        <ServicesFilter selected={selectedTab} onChange={setSelectedTab} />
      </BottomSheetModal>
      <BottomSheetModal open={mobileSortOpen} onClose={() => setMobileSortOpen(false)} title={t('services.sortLabel')}>
        <ServiceSort selected={selectedSort} onChange={setSelectedSort} />
      </BottomSheetModal>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter section (desktop only) */}
        <div className="md:w-1/3 w-full md:sticky md:top-24 self-start hidden md:block">
          <ServicesFilter selected={selectedTab} onChange={setSelectedTab} />
        </div>
        {/* Services list section */}
        <div className="flex-1">
          {/* <button
            className="mb-4 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            onClick={() => setModalOpen(true)}
          >
            {t('services.searchTitle')}
          </button>
          <ServiceSearchModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSearch={handleSearch}
            initial={initialSearch}
          />
          <h1 className="text-2xl font-bold mb-4">{t('services.serviceTitle')}</h1>
          {categoryLabel && (
            <div className="mb-6 p-3 rounded bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-semibold">
              {t('services.relatedCategory', { category: categoryLabel })}
            </div>
          )} */}
          {/* Tab content: only show service list for selected tab (example: office) */}
          <div className="hidden md:block text-sm rounded-2xl bg-white shadow-sm p-4 mb-3">
            {t('services.subtitle')}
          </div>
          <div className="hidden md:block">
            <ServiceSort selected={selectedSort} onChange={setSelectedSort} />
          </div>
          <ul>
            {services.map((service) => (
              <li key={service.id} className="rounded-2xl bg-white shadow-sm p-4 mb-3">
                <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
                  <img
                    src="https://statics.doctoreto.com/resize:fill:180:180:0/gravity:sm/format:webp/plain/s3://drto/avatar/doctor/2022/11/DyBGyti9hAuXCG77VN8tCJIq3p09TanMw6eqXcyT.jpg"
                    alt="doctor avatar"
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{service.name[getLangFromLocale(locale)]}</div>
                    <div className="text-sm text-gray-500 truncate">{service.description[getLangFromLocale(locale)]}</div>
                  </div>
                  <Link
                    href={`/${locale}/services/${service.id}`}
                    className="inline-flex items-center gap-1  px-4 py-2 text-sm font-semibold text-gray-500"
                  >
                    {t('services.detail')}
                    <ArrowLeftIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className='py-2 flex items-center gap-2'>
                  {service.facilities.map((facility, idx) => (
                    <span key={idx} className="text-sm text-green-600 rounded-2xl px-4 py-2 bg-green-100"> {facility[locale]} </span>
                  ))}
                </div>
                <div className="py-2 flex items-center gap-2">
                  <div className="font-semibold flex gap-2">
                    {service.address.length > 0 && (
                      <span className="text-sm text-gray-500 border border-gray-200 rounded-2xl px-4 py-2 flex">
                        <MapPinIcon className="w-5 h-5 text-blue-500 me-2" />
                        {service.address[0].description[getLangFromLocale(locale)]}
                      </span>
                    )}
                    {service.address.length > 1 && (
                      <span className="text-sm text-gray-500 border border-gray-200 rounded-2xl px-4 py-2 flex">
                        {t('services.moreOffices', { count: service.address.length - 1 })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="py-2">
                  <div className="text-sm truncate flex items-center justify-between gap-2 w-full">
                    <span>
                      <span className="text-gray-800">{t('services.firstAvailableAppointment')}: </span>
                      <span className="text-gray-500">{service.firstAvailableAppointment[getLangFromLocale(locale)]}</span>
                    </span>
                    <span className="flex gap-2">
                      {service.phone && (
                        <button className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 text-sm px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition">
                          <PhoneIcon className="w-5 h-5" />
                          {t('services.bookPhoneConsultationBtn')}
                        </button>
                      )}
                      {service.office && (
                        <button
                          className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                          onClick={() => {
                            setActiveService(service);
                            setDateModalOpen(true);
                          }}
                        >
                          <BuildingLibraryIcon className="w-5 h-5" />
                          {t('services.bookOfficeAppointmentBtn')}
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ModalComponent
            open={dateModalOpen && !!activeService}
            onClose={() => {
              setDateModalOpen(false);
              setActiveService(null);
            }}
            size="3xl"
            title={t('services.bookOfficeAppointmentBtn')}
            className="mx-2"
          >
            {activeService && (
              <ServiceAppointment
                dates={appointmentDates}
                addresses={activeService.address}
                lang={locale as Lang}
                serviceName={activeService.name}
                serviceImage={activeService.image}
              />
            )}
          </ModalComponent>
          {hasMore && (
            <div ref={loader} className="text-center py-4 text-gray-400">
              {loading ? t('services.loading') : t('services.loadMore')}
            </div>
          )}
          {/* Add other tab contents here as needed */}
        </div>
      </div>
    </div>
  );
}

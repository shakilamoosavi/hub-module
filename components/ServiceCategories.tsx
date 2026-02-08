import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ServiceSearchModal } from './ServiceSearchModal';

const categories = [
  { key: 'nail', icon: '💅', path: 'nail' },
  { key: 'hair', icon: '💇', path: 'hair' },
  { key: 'dentistry', icon: '🦷', path: 'dentistry' },
  { key: 'physio', icon: '🏃', path: 'physio' }
];

export default function ServiceCategories() {
  const t = useTranslations();
  const { locale } = useParams() as { locale: string };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  const handleCategoryClick = (catKey: string) => {
    setSelectedCat(catKey);
    setModalOpen(true);
  };

  const handleSearch = (data: { date: string, country: string, province: string, city: string }) => {
    if (!selectedCat) return;
    router.replace(`/${locale}/services?cat=${selectedCat}&date=${data.date}&country=${data.country}&province=${data.province}&city=${data.city}`);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {categories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => handleCategoryClick(cat.key)}
            className="flex flex-col items-center p-4 border rounded border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:bg-gray-50 min-w-[120px]"
          >
            <img
              src={`/assets/images/service-categories/${cat.key}.png`}
              alt={cat.key}
              className="w-full rounded"
            />
            <span className="font-semibold block mt-3">{t(`services.categories.${cat.key}`)}</span>
          </button>
        ))}
      </div>
      <ServiceSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSearch={handleSearch}
        initial={selectedCat ? { } : undefined}
      />
    </>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface DropdownProps {
  label?: string;
  dataList?: Array<{ label: string; value: string | number }>;
  apiUrl?: string;
  value?: string | number;
  onChange: (value: string | number, item?: any) => void;
  placeholder?: string;
  disabled?: boolean;
  tNamespace?: string; // optional translation namespace
}


const PAGE_SIZE = 30;

const Dropdown: React.FC<DropdownProps> = ({
  label,
  dataList,
  apiUrl,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  tNamespace = 'dropdown',
}) => {
  const t = useTranslations(tNamespace);
  const [options, setOptions] = useState<Array<{ label: string; value: string | number }>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (apiUrl) {
      fetchOptions('');
    } else if (dataList) {
      setOptions(dataList.slice(0, PAGE_SIZE));
    }
  }, [dataList, apiUrl]);

  const fetchOptions = async (searchTerm: string) => {
    setLoading(true);
    try {
      const url = new URL(apiUrl!);
      if (searchTerm) url.searchParams.append('search', searchTerm);
      url.searchParams.append('limit', PAGE_SIZE.toString());
      const res = await fetch(url.toString());
      const data = await res.json();
      // Expecting data to be array of { label, value }
      setOptions(data);
    } catch (e) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (apiUrl) {
      fetchOptions(val);
    } else if (dataList) {
      const filtered = dataList.filter(item =>
        item.label.toLowerCase().includes(val.toLowerCase())
      );
      setOptions(filtered.slice(0, PAGE_SIZE));
    }
  };

  const handleSelect = (item: { label: string; value: string | number }) => {
    onChange(item.value, item);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
      <div
        className={`border rounded-lg px-3 py-2 bg-white flex items-center cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ borderColor: 'var(--border-color-1)' }}
        onClick={() => setOpen(!open)}
      >
        <span className="flex-1 truncate">
          {options.find(o => o.value === value)?.label || placeholder || t('placeholder', { defaultValue: 'Select...' })}
        </span>
        <span
          className={`ml-2 transition-transform duration-200 text-gray-400 inline-block ${open ? 'rotate-180' : ''}`}>
          <ChevronDownIcon className="h-5 w-5" />
        </span>
      </div>
      {open && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{ borderColor: 'var(--border-color-1)' }}
        >
          <input
            className="w-full px-2 py-1 border-b outline-none"
            style={{ borderBottomColor: 'var(--border-color-1)' }}
            placeholder={t('search', { defaultValue: 'Search...' })}
            value={search}
            onChange={handleSearch}
            autoFocus
          />
          {loading ? (
            <div className="p-2 text-center text-gray-500">{t('loading', { defaultValue: 'Loading...' })}</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-center text-gray-500">{t('noResults', { defaultValue: 'No results' })}</div>
          ) : (
            options.map(item => (
              <div
                key={item.value}
                className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${item.value === value ? 'bg-gray-200' : ''}`}
                style={item.value === value ? { border: '1px solid var(--border-color-1)' } : {}}
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

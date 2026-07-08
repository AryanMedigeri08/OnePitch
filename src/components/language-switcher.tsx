'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher({ isDark = false }: { isDark?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = pathname.split('/')[1] || 'en';
  const currentLang = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isDark
            ? 'text-gray-300 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Switch language"
      >
        <Globe size={15} />
        <span className="hidden sm:inline">{currentLang.flag}</span>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-1 w-40 rounded-xl shadow-lg border overflow-hidden animate-slide-up ${
            isDark
              ? 'bg-brand-navy-light border-brand-navy-mid'
              : 'bg-white border-gray-200'
          }`}
        >
          {LOCALES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                lang.code === currentLocale
                  ? isDark
                    ? 'bg-white/10 text-brand-green'
                    : 'bg-gray-100 text-brand-navy font-medium'
                  : isDark
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

export function Navbar() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';
  const isCommand = pathname.includes('/command');

  const navLinks = [
    { href: `/${locale}`, label: t('appName'), isLogo: true },
    { href: `/${locale}/fan`, label: t('fanApp') },
    { href: `/${locale}/volunteer`, label: t('volunteer') },
    { href: `/${locale}/command`, label: t('commandCenter') },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b ${
        isCommand
          ? 'bg-brand-navy/95 border-brand-navy-mid text-white backdrop-blur-md'
          : 'bg-white/95 border-gray-200 text-gray-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <span className="text-xl">⚽</span>
            <span className="bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
              {t('appName')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(1).map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== `/${locale}` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? isCommand
                        ? 'bg-white/10 text-brand-green'
                        : 'bg-gray-100 text-brand-navy'
                      : isCommand
                        ? 'text-gray-300 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher isDark={isCommand} />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className={`md:hidden border-t animate-slide-up ${
            isCommand ? 'border-brand-navy-mid bg-brand-navy' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.slice(1).map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== `/${locale}` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? isCommand
                        ? 'bg-white/10 text-brand-green'
                        : 'bg-gray-100 text-brand-navy'
                      : isCommand
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

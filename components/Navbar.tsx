'use client';
import {T} from '@/components/LocaleProvider';
import {translateText} from '@/lib/translate';


import {useLocale} from './LocaleProvider';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { translations, Locale } from '@/lib/i18n';
import { Globe, Menu, X, Eye } from 'lucide-react';

interface NavbarProps {
  variant?: 'home' | 'app';
  locale?: Locale;
  onToggleLocale?: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  variant = 'app',
  locale: _locale,
  onToggleLocale: _toggle,
  reducedMotion = false,
  onToggleReducedMotion
}) => {
  const {locale,setLocale}=useLocale();
  const onToggleLocale=()=>setLocale(locale==='en'?'hi':'en');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[locale];

  const isHome = pathname === '/';
  const isStudio = pathname.startsWith('/studio');
  const isLibrary = pathname.startsWith('/library');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t.nav.home, active: isHome },
    { href: '/studio', label: t.nav.studio, active: isStudio },
    { href: '/library', label: t.nav.library, active: isLibrary }
  ];

  if (variant === 'home') {
    return (
      <header className="home-nav-wrap">
        <nav className="home-nav" aria-label={translateText(locale,"Main Navigation")}>
          <Link href="/" className="brand-capsule" style={{ color: '#FFFFFF' }}>
            {/* Original supplied logo with light capsule for contrast */}
            <img
              src="/assets/bharat-samvida-logo.png"
              alt={translateText(locale,"Bharat Samvida logo")}
              className="brand-logo-img"
            />
            <span>{t.brand}</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav-links">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: link.active ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.25)', margin: '0 8px' }} />

            {/* Language switch */}
            {onToggleLocale && (
              <button
                onClick={onToggleLocale}
                className="btn-outline"
                style={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '6px 12px',
                  minHeight: '36px',
                  fontSize: '12px'
                }}
                title={translateText(locale,"Switch language between English and Hindi")}
              >
                <Globe size={14} />
                <span>{locale === 'en' ? 'हिंदी' : <T text={"English"}/>}</span>
              </button>
            )}

            {/* Reduced motion toggle */}
            {onToggleReducedMotion && (
              <button
                onClick={onToggleReducedMotion}
                className="btn-outline"
                style={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '6px 12px',
                  minHeight: '36px',
                  fontSize: '12px'
                }}
                title={translateText(locale,"Toggle motion effects")}
              >
                <Eye size={14} />
                <span>{reducedMotion ? <T text={"Full Motion"}/> : <T text={"Reduced Motion"}/>}</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ color: '#FFFFFF', padding: '8px' }}
            aria-label={translateText(locale,"Toggle navigation menu")}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile menu sheet */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: '100px',
              left: '20px',
              right: '20px',
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-dialog)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 90,
              pointerEvents: 'auto'
            }}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: link.active ? 'var(--forest-tint)' : 'transparent',
                  color: link.active ? 'var(--forest-700)' : 'var(--ink-950)'
                }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {onToggleLocale && (
                <button
                  onClick={onToggleLocale}
                  className="btn btn-outline"
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  <Globe size={16} />
                  <span>{locale === 'en' ? 'हिंदी में देखें' : <T text={"View in English"}/>}</span>
                </button>
              )}
              {onToggleReducedMotion && (
                <button
                  onClick={onToggleReducedMotion}
                  className="btn btn-outline"
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  <Eye size={16} />
                  <span>{reducedMotion ? <T text={"Full Motion"}/> : <T text={"Reduced Motion"}/>}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  // App Navbar (for Studio and Library)
  return (
    <header className="app-nav">
      <Link href="/" className="brand-capsule">
        <img
          src="/assets/bharat-samvida-logo.png"
          alt={translateText(locale,"Bharat Samvida logo")}
          className="brand-logo-img"
        />
        <span>{t.brand}</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-nav-links">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: link.active ? 'var(--forest-700)' : 'var(--ink-700)',
              backgroundColor: link.active ? 'var(--forest-tint)' : 'transparent',
              transition: 'background-color 0.15s'
            }}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'var(--line)', margin: '0 6px' }} />

        {onToggleLocale && (
          <button
            onClick={onToggleLocale}
            className="btn-outline"
            style={{
              padding: '6px 12px',
              minHeight: '36px',
              fontSize: '12px',
              borderRadius: '8px'
            }}
            title={translateText(locale,"Switch language between English and Hindi")}
          >
            <Globe size={14} />
            <span>{locale === 'en' ? 'हिंदी' : <T text={"English"}/>}</span>
          </button>
        )}
      </div>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-menu-btn"
        style={{ padding: '8px' }}
        aria-label={translateText(locale,"Toggle navigation menu")}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '76px',
            left: '16px',
            right: '16px',
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-dialog)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 90
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: link.active ? 'var(--forest-tint)' : 'transparent',
                color: link.active ? 'var(--forest-700)' : 'var(--ink-950)'
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            {onToggleLocale && (
              <button
                onClick={onToggleLocale}
                className="btn btn-outline"
                style={{ width: '100%', minHeight: '44px' }}
              >
                <Globe size={16} />
                <span>{locale === 'en' ? 'हिंदी में देखें' : <T text={"View in English"}/>}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

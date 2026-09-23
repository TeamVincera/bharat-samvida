'use client';
import {T} from '@/components/LocaleProvider';
import {translateText} from '@/lib/translate';

import {useLocale} from './LocaleProvider';
import React from 'react';
import Link from 'next/link';
import { Locale, translations } from '@/lib/i18n';

interface FooterProps {
  locale?: Locale;
}

export const Footer: React.FC<FooterProps> = () => {
  const {locale}=useLocale();
  const t = translations[locale];

  return (
    <footer className="civic-footer">
      <div className="container footer-content">
        <div className="footer-top">
          <div style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <img
                src="/assets/bharat-samvida-logo.png"
                alt={translateText(locale,"Bharat Samvida logo")}
                style={{ width: '32px', height: '36px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink-950)' }}>
                {t.brand}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-500)', lineHeight: 1.5 }}>
              {t.tagline}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '8px', lineHeight: 1.5 }}><T text={" SIH Problem Statement 26108 • Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution. "}/></p>
          </div>

          <nav className="footer-nav" aria-label={translateText(locale,"Footer Navigation")}>
            <Link href="/">{t.nav.home}</Link>
            <Link href="/studio">{t.nav.studio}</Link>
            <Link href="/library">{t.nav.library}</Link>
            <Link href="/privacy">{t.nav.privacy}</Link>
            <Link href="/accessibility">{t.nav.accessibility}</Link>
            <Link href="/sources">{t.nav.sources}</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <p style={{ color: 'var(--saffron-700)', fontWeight: 500 }}>
            {t.sihNotice}
          </p>
          <p style={{ color: 'var(--ink-500)' }}><T text={" © 2026 Bharat Samvida • Open civic research specification "}/></p>
        </div>
      </div>
    </footer>
  );
};

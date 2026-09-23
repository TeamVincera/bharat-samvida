'use client';
import {T} from '@/components/LocaleProvider';

import {useLocale} from '@/components/LocaleProvider';

import React, { useState } from 'react';
import Link from 'next/link';
import { DevelopmentStory } from '@/components/DevelopmentStory';
import { Footer } from '@/components/Footer';
import { Locale, translations } from '@/lib/i18n';
import { Sparkles, Shield, Compass, BookOpen, Layers } from 'lucide-react';

export default function HomePage() {
  const {locale, setLocale} = useLocale();
  const t = translations[locale];
  return (
    <>
      <main id="main-content">
        <DevelopmentStory locale={locale} onToggleLocale={() => setLocale(locale === 'en' ? 'hi' : 'en')} />
        {/* AFTER-STORY UNPINNED EXPLAINER & CAROUSEL */}
        <section style={{ padding: '96px 0', background: 'var(--paper)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
              <div className="eyebrow" style={{ marginBottom: '12px' }}>
                {t.home.howItWorks.eyebrow}
              </div>
              <h2 className="chapter-title" style={{ marginBottom: '16px' }}>
                {t.home.howItWorks.title}
              </h2>
            </div>

            {/* Three Step Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '24px',
                marginBottom: '80px'
              }}
            >
              <article className="card-paper" style={{ padding: '36px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'var(--saffron-tint)',
                    color: 'var(--saffron-700)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <Compass size={22} />
                </div>
                <div className="eyebrow" style={{ color: 'var(--ink-500)', marginBottom: '8px' }}><T text={" STEP 01 "}/></div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '10px' }}>
                  {t.home.howItWorks.step1Title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-700)', lineHeight: 1.6 }}>
                  {t.home.howItWorks.step1Body}
                </p>
              </article>

              <article className="card-paper" style={{ padding: '36px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'var(--forest-tint)',
                    color: 'var(--forest-700)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <Layers size={22} />
                </div>
                <div className="eyebrow" style={{ color: 'var(--ink-500)', marginBottom: '8px' }}><T text={" STEP 02 "}/></div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '10px' }}>
                  {t.home.howItWorks.step2Title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-700)', lineHeight: 1.6 }}>
                  {t.home.howItWorks.step2Body}
                </p>
              </article>

              <article className="card-paper" style={{ padding: '36px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#E6EDF2',
                    color: 'var(--river-700)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <Shield size={22} />
                </div>
                <div className="eyebrow" style={{ color: 'var(--ink-500)', marginBottom: '8px' }}><T text={" STEP 03 "}/></div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '10px' }}>
                  {t.home.howItWorks.step3Title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-700)', lineHeight: 1.6 }}>
                  {t.home.howItWorks.step3Body}
                </p>
              </article>
            </div>

            {/* Final Call to Action */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '64px 48px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              <h2 style={{ fontSize: '38px', fontWeight: 600, color: 'var(--ink-950)', marginBottom: '12px' }}>
                {t.home.finalCTA.title}
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--ink-700)', maxWidth: '520px', margin: '0 auto 32px' }}>
                {t.home.finalCTA.subtitle}
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/studio" className="btn btn-primary" style={{ minHeight: '48px', padding: '12px 28px' }}>
                  <Sparkles size={16} />
                  <span>{t.home.finalCTA.studioBtn}</span>
                </Link>
                <Link href="/library" className="btn btn-outline" style={{ minHeight: '48px', padding: '12px 28px' }}>
                  <BookOpen size={16} />
                  <span>{t.home.finalCTA.libraryBtn}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

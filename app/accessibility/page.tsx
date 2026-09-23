import {T} from '@/components/LocaleProvider';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Eye, Keyboard, Monitor, CheckCircle } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <>
      <Navbar variant="app" />

      <main id="main-content" style={{ flex: 1, padding: '48px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div className="eyebrow" style={{ marginBottom: '8px' }}><T text={" Inclusive Design & Usability "}/></div>
          <h1 className="page-title" style={{ marginBottom: '16px' }}><T text={" Accessibility Statement "}/></h1>
          <p className="body-large" style={{ marginBottom: '40px' }}><T text={" Bharat Samvida is engineered to conform to "}/><strong><T text={"WCAG 2.2 Level AA"}/></strong><T text={" standards, ensuring equitable access for public procurement officers and citizens across all physical abilities and network constraints. "}/></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Eye size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"1. Reduced Motion & Visual Comfort"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" Bharat Samvida follows your operating system’s "}/><strong><T text={"reduced motion preference"}/></strong><T text={". When enabled, the Home stories use static before-and-after views and the Tender Studio displays a still emblem. There is no separate motion toggle on the Home screen. "}/></p>
            </section>

            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Keyboard size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"2. Full Keyboard Navigation"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" All interactive controls—including top navigation, the Tender Studio composer, four-option clarification questions, custom input expansion, and document reading controls—are fully reachable via Tab, Shift+Tab, Enter, Space, and Arrow keys. High-contrast 3px focus rings ("}/><code>#315B70</code><T text={") provide clear orientation. "}/></p>
            </section>

            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Monitor size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"3. Screen Reader & Alternative Text Support"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" Analysis loading stages communicate via ARIA live regions without interrupting the user. The Legal Library offers an "}/><strong><T text={"Accessible Text View"}/></strong><T text={" alongside the visual PDF canvas for seamless screen-reader interpretation. "}/></p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

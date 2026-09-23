import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import {LocaleProvider,T} from '@/components/LocaleProvider';

export const metadata: Metadata = {
  title: 'Bharat Samvida — Clarity in every tender',
  description: 'Evidence-backed Indian Standards technical specification assistant and legal library. Turn procurement requirements into unambiguous, verified specifications.',
  keywords: ['Bharat Samvida', 'Indian Standards', 'BIS', 'Tender Studio', 'Procurement', 'GeM', 'GFR', 'SIH'],
  authors: [{ name: 'Bharat Samvida' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10212B'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = (await cookies()).get('bs_locale')?.value === 'hi' ? 'hi' : 'en';
  return (
    <html lang={locale}>
      <body><LocaleProvider initialLocale={locale}>
        <a href="#main-content" className="skip-link"><T text={" Skip to main content "}/></a>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </LocaleProvider></body>
    </html>
  );
}

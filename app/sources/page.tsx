import {T} from '@/components/LocaleProvider';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getLegalDocuments, getStandardsStarter } from '@/lib/corpus';
import { Database, ExternalLink, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

export default function SourcesPage() {
  const documents = getLegalDocuments();
  const standards = getStandardsStarter();

  const downloadedCount = documents.filter(d => d.availability === 'downloaded').length;

  return (
    <>
      <Navbar variant="app" />

      <main id="main-content" style={{ flex: 1, padding: '48px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="eyebrow" style={{ marginBottom: '8px' }}><T text={" Evidence Register & Corpus Integrity "}/></div>
          <h1 className="page-title" style={{ marginBottom: '16px' }}><T text={" Corpus Coverage & Source Disclosures "}/></h1>
          <p className="body-large" style={{ marginBottom: '40px' }}><T text={" Bharat Samvida grounds recommendations in verified legal texts and official publishing records. This page reports our starter collection coverage, verification timestamps, and explicit operational limits. "}/></p>

          {/* Aggregate Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}
          >
            <div className="card-paper" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'var(--ink-950)' }}>
                {documents.length}
              </div>
              <div className="metadata" style={{ marginTop: '4px' }}><T text={" Curated Legal Documents "}/></div>
            </div>

            <div className="card-paper" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'var(--forest-700)' }}>
                {downloadedCount}
              </div>
              <div className="metadata" style={{ marginTop: '4px' }}><T text={" Downloaded Official PDFs "}/></div>
            </div>

            <div className="card-paper" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'var(--river-700)' }}>
                {standards.length}
              </div>
              <div className="metadata" style={{ marginTop: '4px' }}><T text={" Observed Indian Standards "}/></div>
            </div>

            <div className="card-paper" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 600, color: 'var(--saffron-700)' }}>
                2026-09-20
              </div>
              <div className="metadata" style={{ marginTop: '4px' }}><T text={" Corpus Baseline Date "}/></div>
            </div>
          </div>

          {/* Operational Boundaries & Disclosures */}
          <div className="card-paper" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="var(--saffron-700)" />
              <span><T text={"Corpus Scope & Limitations"}/></span>
            </h2>
            <ul style={{ paddingLeft: '24px', fontSize: '14px', lineHeight: 1.8, color: 'var(--ink-700)' }}>
              <li>
                <strong><T text={"Not an all-India database:"}/></strong><T text={" This release features a curated starter collection focusing on national procurement manuals (Goods, Works, Services), BIS Acts/Rules, and representative Quality Control Orders. "}/></li>
              <li>
                <strong><T text={"No live automated BIS bulk feed:"}/></strong><T text={" The Bureau of Indian Standards does not offer an open real-time API. Standards metadata and product manuals are derived from verified official portal indexes. "}/></li>
              <li>
                <strong><T text={"Evidence-backed version state:"}/></strong><T text={" A standard is marked "}/><code><T text={"latest_verified"}/></code><T text={" only when checked within the active verification window. Unadjudicated standards are transparently tagged as "}/><code><T text={"verification_needed"}/></code>.
              </li>
              <li>
                <strong><T text={"Zero invented standards:"}/></strong><T text={" Bharat Samvida will never fabricate or guess standard numbers, editions, or compulsory certification rules. "}/></li>
            </ul>
          </div>

          {/* Primary Publishing Authorities */}
          <div className="card-paper" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}><T text={" Primary Authoritative Sources "}/></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <a
                href="https://doe.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', display: 'block' }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink-950)' }}><T text={"Department of Expenditure (DoE)"}/></div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '4px' }}><T text={"Ministry of Finance • GFR and Procurement Manuals"}/></div>
              </a>

              <a
                href="https://www.bis.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', display: 'block' }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink-950)' }}><T text={"Bureau of Indian Standards (BIS)"}/></div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '4px' }}><T text={"National Standards Body • Product Manuals & QCOs"}/></div>
              </a>

              <a
                href="https://www.indiacode.nic.in"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', display: 'block' }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink-950)' }}><T text={"India Code Portal"}/></div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '4px' }}><T text={"Legislative Department • Acts and Statutory Rules"}/></div>
              </a>

              <a
                href="https://egazette.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', display: 'block' }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink-950)' }}><T text={"The Gazette of India"}/></div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '4px' }}><T text={"Official Gazette • Notified Orders & Amendments"}/></div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

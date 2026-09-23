'use client';
import {T} from '@/components/LocaleProvider';
import {translateText} from '@/lib/translate';


import React, { useState } from 'react';
import { AnalysisResult, StandardCandidate, SourceCitation } from '@/lib/types';
import { Locale, translations } from '@/lib/i18n';
import { tenderGaps } from '@/lib/tender-completeness';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Download, 
  FileText, 
  Layers, 
  ShieldCheck, 
  X,
  Check,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface RecommendationDossierProps {
  result: AnalysisResult;
  locale?: Locale;
  onNewBrief: () => void;
  onDeleteSession: () => void;
}

export const RecommendationDossier: React.FC<RecommendationDossierProps> = ({
  result,
  locale = 'en',
  onNewBrief,
  onDeleteSession
}) => {
  const [activeTab, setActiveTab] = useState<'standards' | 'related' | 'certification' | 'draft' | 'sources'>('standards');
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string | null>(null);

  const t = translations[locale].studio.dossier;

  // Aggregate candidate standards
  const allCandidates = result.items.flatMap(item => item.candidates);
  const openDetails = tenderGaps(result);

  const handleCopyDraft = async () => {
    const text = result.draftSections.map(s => `${s.heading}\n${s.body}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (e) {
      console.error('Failed to copy draft', e);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'json') => {
    try {
      setDownloading(true);
      setDownloadFormat(format);
      setExportError(null);
      const res = await fetch('/api/v1/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, result: {...result,locale} })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Export failed. Please try again.');
      }

      const blob = await res.blob();
      if (!blob.size || (format === 'pdf' && !blob.type.includes('application/pdf'))) throw new Error('The server did not return a valid PDF. Please retry.');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bharat-samvida-specification-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      // Safari needs the object URL to survive until the download starts.
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      document.body.removeChild(a);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadFormat(null);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
      {/* Demonstration Banner */}
      {result.mode === 'demo' && (
        <div className="demo-banner" style={{ borderRadius: '12px', marginBottom: '20px' }}>
          <span><T text={"ILLUSTRATIVE RESULT • NOT A LIVE STANDARDS VERIFICATION"}/></span>
        </div>
      )}

      {/* Dossier Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: '6px' }}><T text={" Tender Studio / Specification Review "}/></div>
          <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--ink-950)' }}>
            {t.title}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '4px' }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-saffron" style={{ padding: '6px 12px', fontSize: '12px' }}><T text={" Provisional • Review Required "}/></span>
          <button
            onClick={onNewBrief}
            className="btn btn-outline"
            style={{ minHeight: '36px', fontSize: '12px', padding: '6px 12px' }}
            title={translateText(locale,"Start a new tender brief")}
          >
            <RotateCcw size={13} />
            <span>{t.newBriefBtn}</span>
          </button>
          <button
            onClick={onDeleteSession}
            className="btn btn-danger"
            style={{ minHeight: '36px', fontSize: '12px', padding: '6px 12px' }}
            title={translateText(locale,"Delete temporary draft and session")}
          >
            <Trash2 size={13} />
            <span>{t.deleteSessionBtn}</span>
          </button>
        </div>
      </div>

      {openDetails.length > 0 && (
        <details className="card-paper" style={{padding:'16px 20px',marginBottom:24,borderColor:'#D9B68D'}}>
          <summary style={{cursor:'pointer',fontWeight:600,color:'#804719'}}>
            {openDetails.length}<T text={" tender details still need confirmation — preparation draft only "}/></summary>
          <p style={{fontSize:13,margin:'12px 0'}}><T text={"Your skipped or unconfirmed answers remain open in the downloaded document. The issuing authority must resolve these before publication."}/></p>
          <ul style={{paddingLeft:20,fontSize:13,lineHeight:1.8}}>{openDetails.map(detail=><li key={translateText(locale, detail)}>{translateText(locale, detail)}</li>)}</ul>
        </details>
      )}

      {/* 5 Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid var(--line)',
          marginBottom: '28px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
        role="tablist"
      >
        {(['standards', 'related', 'certification', 'draft', 'sources'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            style={{
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 600 : 500,
              color: activeTab === tab ? 'var(--ink-950)' : 'var(--ink-500)',
              borderBottom: activeTab === tab ? '2px solid var(--ink-950)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* Main Grid: Content + Review Checklist Aside */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '28px',
          alignItems: 'start'
        }}
        className="dossier-grid"
      >
        {/* Tab Panels */}
        <div>
          {/* TAB 1: STANDARDS */}
          {activeTab === 'standards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {result.items.map((item, itemIdx) => (
                <div key={item.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span className="eyebrow" style={{ color: 'var(--ink-500)' }}><T text={" ITEM "}/>{itemIdx + 1}
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: 600 }}>{item.name}</h4>
                  </div>

                  {item.candidates.length === 0 ? (
                    <div className="card-paper" style={{ padding: '24px', color: 'var(--ink-500)', fontSize: '14px' }}><T text={" No direct primary standard verified in the initial starter collection. Please review related standards or check the official BIS portal. "}/></div>
                  ) : (
                    item.candidates.map(cand => (
                      <article
                        key={cand.standardId}
                        className="card-paper"
                        style={{ padding: '24px', marginBottom: '16px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div>
                            <span className="badge badge-forest" style={{ marginBottom: '8px' }}><T text={" Primary Product Candidate "}/></span>
                            <h3 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink-950)' }}>
                              {cand.designation}
                            </h3>
                            <h4 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ink-700)', marginTop: '2px' }}>
                              {translateText(locale, cand.title)}
                            </h4>
                          </div>
                        </div>

                        <p style={{ fontSize: '14px', color: 'var(--ink-700)', margin: '14px 0', lineHeight: 1.6 }}>
                          {cand.reason}
                        </p>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                            gap: '16px',
                            borderTop: '1px solid var(--line)',
                            paddingTop: '14px',
                            fontSize: '12px'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--ink-500)', display: 'block', marginBottom: '4px' }}><T text={" VERSION EVIDENCE "}/></strong>
                            <span>{cand.versionState === 'published_observed' ? <T text={"Edition observed in BIS listing"}/> : cand.versionState}</span>
                            <div style={{ marginTop: '4px' }}>
                              <span className="badge badge-saffron"><T text={"Current status needs verification"}/></span>
                            </div>
                          </div>

                          <div>
                            <strong style={{ color: 'var(--ink-500)', display: 'block', marginBottom: '4px' }}><T text={" CERTIFICATION STATUS "}/></strong>
                            <span>{cand.certificationState === 'not_determined' ? <T text={"Not yet determined"}/> : cand.certificationState}</span>
                            <p style={{ color: 'var(--ink-500)', marginTop: '4px' }}><T text={" Check applicable product orders. "}/></p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '18px',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--line)',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ color: 'var(--forest-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /><T text={" Included in draft specification "}/></span>

                          {cand.sourceIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const s = result.sources.find(src => src.id === cand.sourceIds[0]);
                                if (s) setSelectedSource(s);
                              }}
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '11px', minHeight: '30px' }}
                            >
                              <ExternalLink size={12} />
                              <span><T text={"View evidence source"}/></span>
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: RELATED STANDARDS */}
          {activeTab === 'related' && (
            <div className="card-paper" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}><T text={" Allied Standards & Normative Hierarchy "}/></h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginBottom: '20px' }}><T text={" Standards cited normatively within product specifications or sharing technical test methods. "}/></p>
              {result.relatedEdges.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--paper)', borderRadius: '10px', fontSize: '13px', color: 'var(--ink-700)' }}>
                  <p><strong><T text={"Evidence invariant:"}/></strong><T text={" Zero similarity-only edges are represented as verified normative references."}/></p>
                  <p style={{ marginTop: '6px', color: 'var(--ink-500)' }}><T text={" No normative relationships have been formally adjudicated for this development fixture. Authoritative test method and raw material edges will populate from verified standard texts. "}/></p>
                </div>
              ) : (
                <div>
                  {result.relatedEdges.map((edge, idx) => (
                    <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                      <strong>{edge.citedDesignation}</strong> — <span className="badge">{edge.relation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GAPS & CERTIFICATION */}
          {activeTab === 'certification' && (
            <div className="card-paper" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}><T text={" Certification Applicability & Open Gaps "}/></h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginBottom: '20px' }}><T text={" Regulatory Quality Control Orders (QCOs) and mandatory certification conditions. "}/></p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {result.items.map(item => (
                  <div key={item.id} style={{ padding: '16px', background: 'var(--paper)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{item.name}</h4>
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      <strong style={{ color: 'var(--saffron-700)' }}><T text={"Unresolved Gaps:"}/></strong>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px', color: 'var(--ink-700)' }}>
                        {item.unresolvedFields.map((field, fIdx) => (
                          <li key={fIdx}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DRAFT SPECIFICATION */}
          {activeTab === 'draft' && (
            <div className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}><T text={" Draft Technical Specification Clauses "}/></h3>
                <span className="badge badge-saffron"><T text={"Provisional Draft"}/></span>
              </div>

              {result.draftSections.map((sec, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--forest-700)', marginBottom: '6px' }}>
                    {translateText(locale, sec.heading)}
                  </h4>
                  <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--ink-700)' }}>
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SOURCES */}
          {activeTab === 'sources' && (
            <div className="card-paper" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}><T text={" Evidence Register "}/></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.sources.map(src => (
                  <div
                    key={src.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      background: 'var(--surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>[{src.id}] {translateText(locale, src.title)}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '2px' }}><T text={" Evidence type: "}/>{src.evidenceType}<T text={" • Last checked: "}/>{src.checkedAt}
                        </div>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '11px', minHeight: '30px' }}
                      >
                        <span><T text={"Open source"}/></span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Review Checklist & Export Actions */}
        <aside
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            {t.reviewChecklistTitle}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {result.items.flatMap(i => i.confirmedAttributes).map((attr, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', color: 'var(--forest-700)' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{attr.name}: {attr.value}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px' }} />

            <div style={{ display: 'flex', gap: '8px', color: 'var(--saffron-700)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><T text={"Confirm required performance with engineer"}/></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', color: 'var(--saffron-700)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><T text={"Verify latest editions & amendments"}/></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', color: 'var(--saffron-700)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><T text={"Check applicable QCO orders"}/></span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: '20px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleCopyDraft}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '13px' }}
            >
              {copySuccess ? <Check size={16} color="green" /> : <Copy size={16} />}
              <span>{copySuccess ? <T text={"Copied to clipboard!"}/> : t.actions.copy}</span>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={downloading}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '13px' }}
            >
              <Download size={16} />
              <span>{downloadFormat === 'pdf' ? <T text={"Preparing PDF…"}/> : t.actions.downloadPdf}</span>
            </button>

            <button
              onClick={() => handleExport('docx')}
              disabled={downloading}
              className="btn btn-surface"
              style={{ width: '100%', fontSize: '13px' }}
            >
              <FileText size={16} />
              <span>{downloadFormat === 'docx' ? <T text={"Preparing Word document…"}/> : t.actions.downloadDocx}</span>
            </button>

            <button
              onClick={() => handleExport('json')}
              disabled={downloading}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '13px' }}
            >
              <span>{t.actions.downloadJson}</span>
            </button>
            {exportError && <p role="alert" style={{color:'var(--danger-700)',fontSize:13}}>{translateText(locale, exportError)}</p>}
          </div>
        </aside>
      </div>

      {/* Evidence Source Drawer / Modal */}
      {selectedSource && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 33, 43, 0.45)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 100
          }}
          onClick={() => setSelectedSource(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              overflowY: 'auto',
              overflowWrap: 'anywhere',
              height: '100%',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-dialog)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"Evidence Citation"}/></h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="btn-outline"
                style={{ padding: '6px', minHeight: '36px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span className="badge badge-forest">{selectedSource.evidenceType}</span>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>
                {translateText(locale, selectedSource.title)}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '4px' }}><T text={" Checked on: "}/>{selectedSource.checkedAt}
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--paper)', borderRadius: '10px', fontSize: '13px' }}>
              <div><strong><T text={"Source URL:"}/></strong></div>
              <a
                href={selectedSource.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--river-700)', wordBreak: 'break-all' }}
              >
                {selectedSource.url}
              </a>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <a
                href={selectedSource.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <span><T text={"Open original official record"}/></span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

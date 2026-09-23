'use client';
import {T} from '@/components/LocaleProvider';
import {translateText} from '@/lib/translate';

import {useLocale} from '@/components/LocaleProvider';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThinkingSphere } from '@/components/ThinkingSphere';
import { ClarificationCard } from '@/components/ClarificationCard';
import { RecommendationDossier } from '@/components/RecommendationDossier';
import { Locale, translations } from '@/lib/i18n';
import { scanAndRedactText, ScanResult } from '@/lib/privacy';
import { AnalysisResult, UserAnswerSubmission } from '@/lib/types';
import { 
  Paperclip, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  X,
  Sparkles
} from 'lucide-react';

function StudioContent() {
  const searchParams = useSearchParams();
  const {locale, setLocale} = useLocale();
  const t = translations[locale].studio;

  // Studio Flow Stages: 'describe' | 'privacy_review' | 'analyzing' | 'clarify' | 'dossier'
  const [stage, setStage] = useState<'describe' | 'privacy_review' | 'analyzing' | 'clarify' | 'dossier'>('describe');
  useEffect(() => { window.scrollTo({top:0,behavior:'instant'}); }, [stage]);

  // Input Composer State
  const [brief, setBrief] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [procurementType, setProcurementType] = useState('goods');
  const [entityType, setEntityType] = useState('');
  const [stateUT, setStateUT] = useState('');
  const [intendedDate, setIntendedDate] = useState('');

  // Attached Files
  const [attachments, setAttachments] = useState<Array<{ name: string; size: number; text: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Privacy Review State
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Loading & Thinking Sphere State
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [takingLonger, setTakingLonger] = useState(false);

  const requestRef = useRef<AbortController | null>(null);
  const [reviewReady, setReviewReady] = useState(false);
  useEffect(() => () => requestRef.current?.abort(), []);

  // Analysis and Clarification State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [draftId, setDraftId] = useState<string>('draft-1');
  const [revision, setRevision] = useState<number>(1);

  // Handle URL query presets (e.g. /studio?prompt=school)
  useEffect(() => {
    const promptPreset = searchParams.get('prompt');
    if (promptPreset === 'school') {
      setBrief('Refresh classrooms with wall paint, desks and teaching boards.');
    } else if (promptPreset === 'housing') {
      setBrief('Prepare a housing brief for water pipes and internal wiring.');
    } else if (promptPreset === 'bridge') {
      setBrief('Find standards relevant to concrete and reinforcement for a bridge.');
    }
  }, [searchParams]);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 3) {
      setUploadError('Maximum 3 documents allowed.');
      return;
    }

    if ([...attachments, ...Array.from(files)].reduce((sum,file)=>sum+file.size,0)>20*1024*1024) {
      setUploadError('Keep the combined attachments below 20 MB.'); return;
    }
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 10 MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/v1/uploads', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error || 'Upload failed');
        } else {
          setAttachments(prev => [...prev, { name: file.name, size: file.size, text: data.extractedText }]);
        }
      } catch (err: any) {
        setUploadError('Upload failed: ' + err.message);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Step 1: Proceed to Privacy Review
  const handleReviewBrief = () => {
    if (uploading) return;
    if ((brief + attachments.map(a=>a.text).join(' ')).trim().length < 15) {
      setUploadError('Please provide at least 15 characters describing your procurement requirement.');
      return;
    }

    setUploadError(null);
    let fullText = brief;
    if (attachments.length > 0) {
      fullText += '\n\n' + attachments.map(a => a.text).join('\n\n');
    }

    const optional = [procurementType && `Procurement type: ${procurementType}`, entityType && `Procuring entity type: ${entityType}`, stateUT && `State or union territory: ${stateUT}`, intendedDate && `Intended publication date: ${intendedDate}`].filter(Boolean);
    fullText += '\n\n' + optional.join('\n');
    if (fullText.length>60000) {setUploadError('Keep your brief and attachments within 60,000 characters.');return;}
    const dlp = scanAndRedactText(fullText);
    setScanResult(dlp);
    setStage('privacy_review');
  };

  // Keep network cancellation and the presentation transition independent.
  const runAnalysis = async (url: string, payload: unknown, fallback: 'privacy_review' | 'clarify') => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const started = performance.now();
    setStage('analyzing'); setReviewReady(false); setTakingLonger(false); setUploadError(null);
    setLoadingStageIndex(fallback === 'clarify' ? 3 : 0);
    const longer = setTimeout(() => setTakingLonger(true), 12000);
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 90000);
    try {
      const res = await fetch(url, { method: 'POST', signal: controller.signal,
        headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed. Please retry.');
      if (!Array.isArray(data.items) || !Array.isArray(data.questions) || !Array.isArray(data.draftSections)) throw new Error('The response was incomplete. Please retry.');
      if (controller.signal.aborted) return;
      setReviewReady(true);
      // Allow the requested emblem-to-orb transition to finish, with an honest ready label.
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : fallback === 'clarify' && data.status === 'needs_clarification' ? 0 : 10000;
      await new Promise<void>((resolve, reject) => {
        const aborted = () => { clearTimeout(timer); reject(new DOMException('Cancelled','AbortError')); };
        const timer = setTimeout(() => { controller.signal.removeEventListener('abort', aborted); resolve(); }, Math.max(0,duration-(performance.now()-started)));
        controller.signal.addEventListener('abort', aborted, {once:true});
        if (controller.signal.aborted) aborted();
      });
      if (requestRef.current !== controller || controller.signal.aborted) return;
      setAnalysisResult(data); setDraftId(data.draftId); setRevision(data.revision);
      if (fallback === 'privacy_review') setQuestionTotal(data.questions.length);
      setCurrentQuestionIndex(0);
      setStage(data.status === 'needs_clarification' && data.questions.length ? 'clarify' : 'dossier');
    } catch (error) {
      if (requestRef.current !== controller) return;
      if (controller.signal.aborted && !timedOut) return;
      setUploadError(timedOut ? 'Analysis timed out. Your brief is still here; please retry.' : error instanceof Error ? error.message : 'Analysis failed. Please retry.');
      setStage(fallback);
    } finally {
      clearTimeout(longer); clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const handleStartAnalysis = () => {
    if (!scanResult) return;
    return runAnalysis('/api/v1/analyses', {brief:scanResult.redactedText,locale,draftId,revision}, 'privacy_review');
  };

  const handleSubmitAnswer = (submission: UserAnswerSubmission) => {
    if (!analysisResult) return;
    return runAnalysis(`/api/v1/analyses/${analysisResult.analysisId}/answers`, {
      ...submission, draftId:analysisResult.draftId
    }, 'clarify');
  };

  const handleSkipQuestion = (answerType: 'skip' | 'unknown' = 'skip') => {
    const question=analysisResult?.questions[currentQuestionIndex];
    if (question) void handleSubmitAnswer({questionId:question.id,answerType});
  };

  const handleCancel = () => {
    requestRef.current?.abort(); requestRef.current=null;
    setReviewReady(false); setTakingLonger(false);
    setStage(analysisResult?.questions.length ? 'clarify' : 'privacy_review');
  };

  // Reset / New Brief
  const handleNewBrief = () => {
    requestRef.current?.abort(); requestRef.current=null;
    setBrief('');
    setAttachments([]);
    setScanResult(null);
    setAnalysisResult(null);
    setQuestionTotal(0);
    setUploadError(null);
    setDraftId(`draft-${Date.now()}`);
    setRevision(1);
    setStage('describe');
  };

  // Delete Session
  const handleDeleteSession = async () => {
    try {
      const response = await fetch('/api/v1/sessions', { method: 'DELETE' });
      if (!response.ok) throw new Error('Session deletion failed');
    } catch (e) {
      setUploadError('The temporary session could not be deleted. Please retry.');
      return;
    }
    handleNewBrief();
  };

  return (
    <>
      <Navbar
        variant="app"
        locale={locale}
        onToggleLocale={() => setLocale(locale === 'en' ? 'hi' : 'en')}
      />

      <main id="main-content" className="studio-page" style={{ flex: 1, padding: '40px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '1180px' }}>

          {uploadError && stage !== 'describe' && <div role="alert" className="studio-flow-error" style={{padding:16,marginBottom:20,borderRadius:12,background:'var(--danger-tint)',color:'var(--danger-700)'}}>{<T text={uploadError}/>}</div>}
          {/* ========================================================================= */}
          {/* STAGE 1: COMPOSER & DESCRIBE */}
          {/* ========================================================================= */}
          {stage === 'describe' && (
            <div>
              {/* Stepper Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: '4px' }}>
                    {t.breadcrumbNew}
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--ink-950)' }}>
                    {t.heading}
                  </h2>
                  <p style={{ fontSize: '15px', color: 'var(--ink-700)', marginTop: '4px' }}>
                    {t.subheading}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--ink-950)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--ink-950)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '11px' }}>1</span><T text={" Describe "}/></span>
                  <span style={{ color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E2E8DF', color: 'var(--ink-950)', display: 'grid', placeItems: 'center', fontSize: '11px' }}>2</span><T text={" Clarify "}/></span>
                  <span style={{ color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E2E8DF', color: 'var(--ink-950)', display: 'grid', placeItems: 'center', fontSize: '11px' }}>3</span><T text={" Review "}/></span>
                </div>
              </div>

              {/* Main Composer Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }} className="studio-composer-grid">
                <div>
                  <div className="card-paper" style={{ padding: '28px' }}>
                    <textarea
                      value={brief}
                      onChange={e => setBrief(e.target.value)}
                      placeholder={t.composerPlaceholder}
                      rows={7}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '18px',
                        lineHeight: 1.6,
                        color: 'var(--ink-950)',
                        resize: 'vertical'
                      }}
                      maxLength={20000}
                    />

                    {/* Composer Footer: Attachments & Character count */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--line)',
                        paddingTop: '16px',
                        marginTop: '16px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <label
                        className="btn-outline"
                        style={{
                          fontSize: '12px',
                          minHeight: '36px',
                          padding: '6px 14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Paperclip size={14} />
                        <span>{t.addDocument}</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <div style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                        {brief.length} / 20,000 {t.charCount}
  
                    <button
                      type="button"
                      onClick={handleReviewBrief}
                      disabled={uploading}
                      className="btn btn-primary"
                      style={{ minHeight: '48px', padding: '12px 28px', fontSize: '15px' }}
                    >
                      <span>{uploading ? <T text={"Reading attachment…"}/> : t.reviewBriefBtn}</span>
                      <ArrowRight size={16} />
                    </button>
                    </div>
                    </div>

                    {/* Attached files list */}
                    {attachments.length > 0 && (
                      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {attachments.map((att, aIdx) => (
                          <div
                            key={aIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'var(--paper)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              border: '1px solid var(--line)'
                            }}
                          >
                            <FileText size={13} color="var(--forest-700)" />
                            <span>{att.name}</span>
                            <span style={{ color: 'var(--ink-500)' }}>({Math.round(att.size / 1024)}<T text={" KB)"}/></span>
                            <button
                              onClick={() => removeAttachment(aIdx)}
                              style={{ padding: '2px', color: 'var(--ink-500)' }}
                              aria-label={translateText(locale,"Remove attachment")}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'var(--danger-tint)',
                        color: 'var(--danger-700)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertTriangle size={16} />
                      <span>{<T text={uploadError}/>}</span>
                    </div>
                  )}

                  {/* Example chips */}
                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-500)', fontWeight: 600 }}><T text={"Try examples:"}/></span>
                    {t.exampleChips.map((chipText, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setBrief(chipText)}
                        className="btn-outline"
                        style={{ fontSize: '12px', minHeight: '32px', padding: '4px 12px', borderRadius: '30px' }}
                      >
                        {chipText}
                      </button>
                    ))}
                  </div>

                  {/* Expandable Optional Details Panel */}
                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setOptionalOpen(!optionalOpen)}
                      className="btn-outline"
                      style={{ fontSize: '13px', minHeight: '36px', padding: '6px 14px' }}
                    >
                      <span>{t.optionalDetailsTitle}</span>
                      {optionalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {optionalOpen && (
                      <div
                        className="card-paper"
                        style={{
                          marginTop: '12px',
                          padding: '20px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                          gap: '16px'
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                            {t.procurementType}
                          </label>
                          <select
                            value={procurementType}
                            onChange={e => setProcurementType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)' }}
                          >
                            <option value="goods"><T text={"Goods"}/></option>
                            <option value="works"><T text={"Works"}/></option>
                            <option value="services"><T text={"Non-Consultancy Services"}/></option>
                            <option value="consultancy"><T text={"Consultancy Services"}/></option>
                            <option value="mixed"><T text={"Mixed Procurement"}/></option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                            {t.stateUT}
                          </label>
                          <input
                            type="text"
                            value={stateUT}
                            onChange={e => setStateUT(e.target.value)}
                            placeholder={translateText(locale,"e.g. Maharashtra, Delhi...")}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Privacy Notice Banner */}
                  <div
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '16px',
                      background: 'var(--forest-tint)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: 'var(--forest-700)'
                    }}
                  >
                    <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong><T text={"Privacy protection:"}/></strong> {t.privacyNote}
                    </div>
                  </div>


                </div>

                {/* Right Aside: Helpful Guidance */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card-paper" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}><T text={" A clearer brief, together. "}/></h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <strong><T text={"01 Describe the need"}/></strong>
                        <p style={{ color: 'var(--ink-500)', marginTop: '2px' }}><T text={" No standards terminology required. "}/></p>
                      </div>
                      <div>
                        <strong><T text={"02 Resolve the gaps"}/></strong>
                        <p style={{ color: 'var(--ink-500)', marginTop: '2px' }}><T text={" Answer a few focused questions. "}/></p>
                      </div>
                      <div>
                        <strong><T text={"03 Review the evidence"}/></strong>
                        <p style={{ color: 'var(--ink-500)', marginTop: '2px' }}><T text={" Check sources before using the draft. "}/></p>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--line)', marginTop: '16px', paddingTop: '16px', fontSize: '12px', color: 'var(--ink-500)' }}>
                      {t.sessionNotice}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: PRIVACY REVIEW & CONFIRMATION */}
          {/* ========================================================================= */}
          {stage === 'privacy_review' && scanResult && (
            <div style={{ maxWidth: '840px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <div className="eyebrow" style={{ marginBottom: '4px' }}><T text={" Step 1.5 / Local Privacy Inspection "}/></div>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink-950)' }}>
                  {t.privacyReviewTitle}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-700)', marginTop: '4px' }}>
                  {t.privacyReviewDesc}
                </p>
              </div>

              {/* Blocked credentials warning if any */}
              {scanResult.hasBlockedCredentials && (
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--danger-tint)',
                    color: 'var(--danger-700)',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <AlertTriangle size={18} />
                    <span><T text={"Sensitive credentials detected and blocked:"}/></span>
                  </div>
                  <ul style={{ paddingLeft: '24px', marginTop: '6px' }}>
                    {scanResult.blockedDetails.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Redacted Text Preview Card */}
              <div className="card-paper" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--ink-950)' }}><T text={" Payload to be shared for analysis "}/></strong>
                  <span className="badge badge-forest">
                    {scanResult.spans.length}<T text={" Sensitive entities protected "}/></span>
                </div>

                <div
                  style={{
                    padding: '18px',
                    background: 'var(--paper)',
                    borderRadius: '10px',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--ink-950)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {scanResult.redactedText}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={scanResult.hasBlockedCredentials}
                  className="btn btn-primary"
                  style={{ minHeight: '46px', padding: '12px 26px', opacity: scanResult.hasBlockedCredentials ? 0.45 : 1 }}
                >
                  <Sparkles size={16} />
                  <span>{t.proceedToAnalyzeBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStage('describe')}
                  className="btn btn-outline"
                  style={{ minHeight: '46px', padding: '12px 20px' }}
                >
                  {t.backToEditBtn}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: THINKING SPHERE LOADER */}
          {/* ========================================================================= */}
          {stage === 'analyzing' && (
            <div className="studio-loader" style={{ maxWidth: '640px', margin: '40px auto' }}>
              <div className="card-paper" style={{ padding: '40px' }}>
                <ThinkingSphere
                  currentStageIndex={loadingStageIndex}
                  stageLabels={t.loadingStages}
                  onCancel={handleCancel}
                  ready={reviewReady}
                />
                {takingLonger && (
                  <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--saffron-700)', marginTop: '16px' }}>
                    {t.takingLonger}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: CLARIFYING GAPS */}
          {/* ========================================================================= */}
          {stage === 'clarify' && analysisResult && analysisResult.questions.length > 0 && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <ClarificationCard
                key={analysisResult.questions[currentQuestionIndex].id}
                question={analysisResult.questions[currentQuestionIndex]}
                questionIndex={Math.max(0,questionTotal-analysisResult.questions.length)}
                totalQuestions={Math.max(questionTotal,analysisResult.questions.length)}
                locale={locale}
                onSubmitAnswer={handleSubmitAnswer}
                onSkip={() => handleSkipQuestion('skip')}
                onUncertain={() => handleSkipQuestion('unknown')}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: RECOMMENDATION DOSSIER */}
          {/* ========================================================================= */}
          {stage === 'dossier' && analysisResult && (
            <RecommendationDossier
              result={analysisResult}
              locale={locale}
              onNewBrief={handleNewBrief}
              onDeleteSession={handleDeleteSession}
            />
          )}

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}

export default function StudioPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-700)' }}><T text={"Loading Tender Studio..."}/></div>}>
      <StudioContent />
    </React.Suspense>
  );
}

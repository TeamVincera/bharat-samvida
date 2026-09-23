'use client';
import {T,useLocale} from '@/components/LocaleProvider';
import {translateText} from '@/lib/translate';

import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { LegalDocument } from '@/lib/types';
import { ChevronLeft,ChevronRight,Download,ExternalLink,ZoomIn,ZoomOut,Maximize2 } from 'lucide-react';

export function PdfReader({document:record,pdfUrl}:{document:LegalDocument;pdfUrl?:string|null}) {
  const {locale}=useLocale();
  const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null);
  const [page,setPage]=useState(1);
  const [zoom,setZoom]=useState(1);
  const [width,setWidth]=useState(600);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [text,setText]=useState('');
  const [textView,setTextView]=useState(false);
  const [showOriginal,setShowOriginal]=useState(false);
  const [hindiText,setHindiText]=useState('');
  const [hindiError,setHindiError]=useState<string|null>(null);
  const [hindiLoading,setHindiLoading]=useState(false);
  const [retry,setRetry]=useState(0);
  const officialHindi=record.hindi_pages?.includes(page)||false;
  const hindiView=locale==='hi'&&!showOriginal&&!officialHindi;
  const canvas=useRef<HTMLCanvasElement>(null);
  const viewport=useRef<HTMLDivElement>(null);
  const available=record.availability==='downloaded'&&!!record.local_path;
  const url=pdfUrl||`/pdfs/${encodeURIComponent(record.local_path?.split('/').pop()||'')}`;
  useEffect(()=>{setShowOriginal(false);},[locale,record.id]);
  useEffect(()=>{
    if(!hindiView||!available)return;
    const controller=new AbortController();setHindiText('');setHindiError(null);setHindiLoading(true);
    fetch(`/api/v1/documents/${record.id}/hindi?page=${page}`,{signal:controller.signal})
      .then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error);return body;})
      .then(body=>{if(!controller.signal.aborted)setHindiText(body.text);})
      .catch(error=>{if(!controller.signal.aborted)setHindiError(error.message||'हिंदी अनुवाद उपलब्ध नहीं है।');})
      .finally(()=>{if(!controller.signal.aborted)setHindiLoading(false);});
    return()=>controller.abort();
  },[hindiView,available,record.id,page,retry]);

  useEffect(()=>{
    const el=viewport.current;if(!el)return;
    const observer=new ResizeObserver(([entry])=>setWidth(Math.max(240,entry.contentRect.width-32)));
    observer.observe(el);return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    let disposed=false;
    let task:ReturnType<typeof import('pdfjs-dist')['getDocument']>|undefined;
    setPdf(null);setPage(1);setZoom(1);setError(null);setText('');setLoading(available);
    if(!available)return;
    (async()=>{
      try {
        const engine=await import('pdfjs-dist');
        if(disposed)return;
        engine.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
        task=engine.getDocument({url,isEvalSupported:false,standardFontDataUrl:'/pdf-fonts/',cMapUrl:'/pdf-cmaps/',cMapPacked:true});
        const loaded=await task.promise;
        if(!disposed)setPdf(loaded);
      }catch {if(!disposed){setError('This PDF could not be opened. Retry or use the original file below.');setLoading(false);}}
    })();
    return ()=>{disposed=true;if(task)void task.destroy();};
  },[url,available]);
  useEffect(()=>{
    if(!pdf)return;
    let disposed=false;
    let renderTask:ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>|undefined;
    setLoading(true);setError(null);
    (async()=>{
      try {
        const sheet=await pdf.getPage(page);
        if(disposed)return;
        const contents=await sheet.getTextContent();
        if(disposed)return;
        setText(contents.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join(''));
        const target=canvas.current;
        if(target&&!textView&&!hindiView){
          const natural=sheet.getViewport({scale:1});
          const fit=sheet.getViewport({scale:width/natural.width*zoom});
          const dpr=Math.min(window.devicePixelRatio||1,1.5);
          target.width=Math.floor(fit.width*dpr);target.height=Math.floor(fit.height*dpr);
          target.style.width=`${fit.width}px`;target.style.height=`${fit.height}px`;
          renderTask=sheet.render({canvasContext:target.getContext('2d')!,viewport:fit,transform:[dpr,0,0,dpr,0,0]});
          await renderTask.promise;
        }
        if(!disposed)setLoading(false);
      }catch(e){if(!disposed&&!(e instanceof Error&&e.name==='RenderingCancelledException')){setError('This page could not be rendered. Try another page or download the file.');setLoading(false);}}
    })();
    return ()=>{disposed=true;renderTask?.cancel();};
  },[pdf,page,zoom,width,textView,hindiView]);

  return <section className="pdf-reader" aria-label={translateText(locale,"Document reader")}>
    <header className="pdf-reader-heading">
      <span className="badge badge-forest"><T text={record.legal_type.replaceAll('_',' ')}/></span>
      <h3><T text={record.title}/></h3>
      <p><T text={record.issuer}/> · {pdf?.numPages||record.page_count||''} <T text="pages"/></p>
      <div className="pdf-reader-links">
        {available&&<a className="btn btn-outline" href={url} download><Download size={14}/><T text={locale==='hi'?'Original PDF':'Download PDF'}/></a>}
        <a className="btn btn-outline" href={record.source_url} target="_blank" rel="noreferrer"><T text={"Official source"}/><ExternalLink size={14}/></a>
      </div>
    </header>
    <p className="pdf-currency"><T text={"Check later amendments with the issuing authority before tender use."}/></p>
    {locale==='hi'&&<div className="pdf-language-note">
      <strong>{hindiView?'हिंदी पठन अनुवाद':officialHindi&&!showOriginal?'आधिकारिक हिंदी पाठ':'मूल दस्तावेज़'}</strong>
      {hindiView&&<p>यह AI-सहायता प्राप्त पठन अनुवाद है, आधिकारिक कानूनी पाठ नहीं। कानूनी उपयोग के लिए मूल देखें।</p>}
      <button className="btn btn-outline" onClick={()=>setShowOriginal(value=>!value)}>{showOriginal?'हिंदी में पढ़ें':'मूल PDF देखें'}</button>
      {hindiView&&hindiText&&<a className="btn btn-outline" href={`/api/v1/documents/${record.id}/hindi?page=${page}&format=pdf`} download>इस पृष्ठ की हिंदी PDF</a>}
    </div>}
    {available&&<div className="pdf-toolbar">
      <div><button aria-label={translateText(locale,"Previous page")} disabled={!pdf||page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={18}/></button>
        <label><T text={"Page "}/><input aria-label={translateText(locale,"Page number")} type="number" min={1} max={pdf?.numPages||1} value={page} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=(pdf?.numPages||1))setPage(n);}}/> / {pdf?.numPages||'—'}</label>
        <button aria-label={translateText(locale,"Next page")} disabled={!pdf||page>=pdf.numPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={18}/></button></div>
      <div><button aria-label={translateText(locale,"Zoom out")} onClick={()=>setZoom(z=>Math.max(.6,z-.2))}><ZoomOut size={16}/></button><span>{Math.round(zoom*100)}%</span><button aria-label={translateText(locale,"Zoom in")} onClick={()=>setZoom(z=>Math.min(2.4,z+.2))}><ZoomIn size={16}/></button><button aria-label={translateText(locale,"Fit width")} onClick={()=>setZoom(1)}><Maximize2 size={16}/></button></div>
      {!hindiView&&<button onClick={()=>setTextView(v=>!v)}>{textView?<T text={"Show PDF"}/>:<T text={"Read page text"}/>}</button>}
    </div>}
    <div ref={viewport} className="pdf-page-viewport" aria-busy={loading}>
      {!available?<div className="pdf-reader-message"><h4><T text={"Original PDF not available locally"}/></h4><p><T text={"This record is a source link, not an available PDF. Use the official portal to check the document."}/></p></div>:<>
        {loading&&!hindiView&&<p className="pdf-loading" role="status"><T text={"Loading page…"}/></p>}
        {error&&!hindiView&&<p role="alert" className="pdf-reader-message"><T text={error}/></p>}
        {hindiView?<div className="pdf-readable-text" lang="hi" aria-busy={hindiLoading}>
          {hindiLoading&&<p role="status">इस पृष्ठ का हिंदी अनुवाद तैयार हो रहा है…</p>}
          {hindiError&&<div role="alert"><p>{hindiError}</p><button className="btn btn-outline" onClick={()=>setRetry(n=>n+1)}>पुनः प्रयास करें</button></div>}
          {hindiText&&<><p className="hindi-page-label">पृष्ठ {page} / {pdf?.numPages||record.page_count}</p>{hindiText}</>}
        </div>:textView?<div className="pdf-readable-text">{text.trim()||translateText(locale,'This page has no embedded text. It may be a scanned page; read the rendered PDF.')}</div>:<canvas ref={canvas} aria-label={`${translateText(locale,'Page')} ${page}: ${translateText(locale,record.title)}`} role="img"/>}
      </>}
    </div>
  </section>;
}

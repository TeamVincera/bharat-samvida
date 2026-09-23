'use client';
import {T} from '@/components/LocaleProvider';


import React, { useEffect, useRef, useState } from 'react';
import { MODE_FRAMES, resolvePreset } from 'thinking-orbs/engine';

interface ThinkingSphereProps {
  currentStageIndex: number;
  stageLabels: string[];
  onCancel?: () => void;
  reducedMotion?: boolean;
  ready?: boolean;
}

export const ThinkingSphere: React.FC<ThinkingSphereProps> = ({currentStageIndex,stageLabels,onCancel,reducedMotion=false,ready=false}) => {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [systemReduced,setSystemReduced]=useState(false);
  const [phase,setPhase]=useState('emblem');
  const [imageError,setImageError]=useState(false);
  const still=reducedMotion||systemReduced;

  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>setSystemReduced(media.matches);
    change(); media.addEventListener('change',change);
    return ()=>media.removeEventListener('change',change);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext('2d');
    if(!canvas||!ctx||still) return;
    let disposed=false,raf=0,start=0,previousPhase='emblem';
    const size=320;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=size*dpr; canvas.height=size*dpr;
    ctx.scale(dpr,dpr);
    const image=new Image();
    image.src='/assets/loader/emblem-of-india.svg';
    image.onload=()=>{
      if(disposed) return;
      // Sample the actual Lion Capital artwork, including the motto. No guessed silhouette.
      const sample=document.createElement('canvas'); sample.width=size;sample.height=size;
      const sampleCtx=sample.getContext('2d',{willReadFrequently:true});
      if(!sampleCtx) return;
      sampleCtx.drawImage(image,79,25,162,258);
      const pixels=sampleCtx.getImageData(0,0,size,size).data;
      const points:{x:number;y:number}[]=[];
      for(let y=25;y<285;y+=2) for(let x=79;x<243;x+=2) {
        const offset=(y*size+x)*4;
        if(pixels[offset+3]>90&&pixels[offset]<180) points.push({x,y});
      }
      if(!points.length) {setImageError(true);return;}
      const preset=resolvePreset('searching',64);
      const options={...preset.opts,latRings:30,lonDensity:85,rBase:.22,rDepth:.5,rMin:.14};
      const first=MODE_FRAMES[preset.mode](64,0,options).dots;
      // Each emblem dot keeps its own target during the morph. The library's
      // depth-sorted searching globe takes over only once the morph has settled.
      const targets=first.map((dot,index)=>({dot,source:points[Math.floor(index*points.length/first.length)]}));
      const render=(now:number)=>{
        if(disposed) return;
        if(!start) start=now;
        const elapsed=now-start;
        const amount=Math.max(0,Math.min(1,(elapsed-1500)/1900));
        const eased=amount*amount*amount*(amount*(amount*6-15)+10);
        const orbStates=['searching','weaving','working'] as const;
        const orbIndex=Math.floor(Math.max(0,elapsed-3400)/2200)%3;
        const nextPhase=amount===0?'emblem':amount<1?'morph':`orb-${orbStates[orbIndex]}`;
        if(nextPhase!==previousPhase) {setPhase(nextPhase);previousPhase=nextPhase;}
        ctx.clearRect(0,0,size,size);
        if(amount<1) {
          targets.forEach(({dot,source},i)=>{
            const swirl=Math.sin(Math.PI*eased)*Math.sin(i*2.399)*15;
            const x=source.x+(dot.x*5-source.x)*eased+swirl;
            const y=source.y+(dot.y*5-source.y)*eased;
            ctx.beginPath();ctx.arc(x,y,.8+(dot.r*4-.8)*eased,0,Math.PI*2);
            ctx.fillStyle=`rgba(19,48,53,${.85-(dot.white*.6)*eased})`;ctx.fill();
          });
        } else {
          const orbTime=(elapsed-3400)/1000;
          const paint=(state: typeof orbStates[number], alpha:number)=>{
            const resolved=resolvePreset(state,64);
            const opts=state==='searching'?options:resolved.opts;
            const frame=MODE_FRAMES[resolved.mode](64,orbTime*.45,opts);
            frame.dots.forEach(dot=>{
              ctx.beginPath();ctx.arc(dot.x*5,dot.y*5,dot.r*4,0,Math.PI*2);
              ctx.fillStyle=`rgba(19,48,53,${Math.max(.16,1-dot.white)*alpha})`;ctx.fill();
            });
          };
          const blend=Math.min(1,((elapsed-3400)%2200)/400);
          if(orbTime>2.2&&blend<1) paint(orbStates[(orbIndex+2)%3],1-blend);
          paint(orbStates[orbIndex],orbTime>2.2?blend:1);
        }
        if(!document.hidden) raf=requestAnimationFrame(render);
      };
      const resume=()=>{ if(!document.hidden&&!disposed){cancelAnimationFrame(raf);raf=requestAnimationFrame(render);} };
      document.addEventListener('visibilitychange',resume);
      cleanupVisibility=()=>document.removeEventListener('visibilitychange',resume);
      raf=requestAnimationFrame(render);
    };
    image.onerror=()=>{if(!disposed)setImageError(true);};
    let cleanupVisibility=()=>{};
    return ()=>{disposed=true;cancelAnimationFrame(raf);cleanupVisibility();image.onload=null;image.onerror=null;};
  },[still]);

  return <div className="tender-thinking" aria-busy={!ready}>
    <div className="thinking-art" data-phase={still?'still':phase}>
      {still||imageError?<img src="/assets/loader/emblem-of-india.svg" alt="Indian national emblem" className="thinking-still"/>:
        <canvas ref={canvasRef} width={320} height={320} aria-label="Dotted Indian national emblem transforming into a searching orb" role="img"/>}
    </div>
    <div className="thinking-caption" role="status" aria-live="polite">
      <p className="eyebrow"><T text={"BHARAT SAMVIDA / TENDER STUDIO"}/></p>
      <h3>{ready?<T text={"Your review is ready"}/>:stageLabels[currentStageIndex]||'Analysing your brief'}</h3>
      <p>{ready?<T text={"Finishing the visual transition…"}/>:<T text={"Working with the technical details you approved."}/>}</p>
    </div>
    {onCancel&&<button onClick={onCancel} className="btn btn-outline thinking-cancel"><T text={"Cancel analysis"}/></button>}
  </div>;
};

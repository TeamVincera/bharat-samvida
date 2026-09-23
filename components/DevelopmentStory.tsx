'use client';
import {T} from '@/components/LocaleProvider';

import React,{useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowDown,ArrowRight,MoveUpRight} from 'lucide-react';
import {Navbar} from './Navbar';
import {ScrollStoryCanvas,StoryChapter} from './ScrollStoryCanvas';
import {Locale,translations} from '@/lib/i18n';
import {journeyAt,clamp} from '@/lib/journey';

export function DevelopmentStory({locale,onToggleLocale}:{locale:Locale;onToggleLocale:()=>void}) {
  const journey=useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  const [reduced,setReduced]=useState(false);
  const [inStory,setInStory]=useState(true);
  const chapters=translations[locale].home.chapters;
  const state=journeyAt(progress);
  const names=locale==='hi'?['ज़रूरत','निर्माण','संभावना']:['The need','The work','The possibility'];
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;const el=journey.current;if(!el)return;const rect=el.getBoundingClientRect();const pin=el.querySelector<HTMLElement>('.story-viewport');setProgress(clamp(-rect.top/Math.max(1,el.offsetHeight-(pin?.offsetHeight||innerHeight))));setInStory(rect.bottom>innerHeight*.55);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
    return()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
  },[reduced]);
  const jump=(index:number,part=0)=>{const el=journey.current;if(!el)return;const travel=el.offsetHeight-(el.querySelector<HTMLElement>('.story-viewport')?.offsetHeight||innerHeight);window.scrollTo({top:scrollY+el.getBoundingClientRect().top+travel*(index+part)/3,behavior:reduced?'instant':'smooth'});};
  const overlay=(index:number,renovation:number,stage:number,flying=0)=>{
    const chapter=chapters[index],text=chapter.stages[stage];
    return <>
      <div className="story-shade"/>
      <div className="story-topline"><span>{locale==='hi'?'बेहतर कल की एक कल्पना':<T text={"A VISION FOR A BETTER EVERYDAY"}/>}</span><span>{locale==='hi'?'भारत संविदा':<T text={"BHARAT SAMVIDA"}/>} / {chapter.number}</span></div>
      <div className="flight-copy-wrap" style={{opacity:1-clamp(flying*4),transform:`translateY(${-flying*24}px)`}}>
        <div className="story-copy" key={`${locale}-${index}-${stage}`}>
          <p className="story-eyebrow"><span/>{chapter.eyebrow}</p>
          {index===0?<h1>{text.title}</h1>:<h2>{text.title}</h2>}
          <p className="story-description">{text.body}</p>
          <div className="story-actions"><Link className="story-primary" href={`/studio?prompt=${index===1?'housing':chapter.id}`}>{chapter.cta}<ArrowRight size={17}/></Link>
          {index===0&&<button className="story-explore" onClick={()=>jump(0,.78)}>{locale==='hi'?'बदलाव देखें':<T text={"See the change"}/>}<ArrowDown size={16}/></button>}</div>
        </div>
        <aside className="story-insight" key={`aside-${locale}-${index}-${stage}`}><div className="story-insight-top"><span>{chapter.number} / 03</span><MoveUpRight size={19}/></div><p>{chapter.title}</p><span className="story-insight-note">{locale==='hi'?'स्पष्ट आवश्यकताएँ। स्थायी बदलाव।':<T text={"Good specifications. Lasting impact."}/>}</span></aside>
      </div>
      {flying>.25&&<div className="flight-destination" style={{opacity:Math.sin(clamp((flying-.25)/.75)*Math.PI)}}><span>{locale==='hi'?'अगला पड़ाव':<T text={"NEXT DESTINATION"}/>}</span><p>{chapters[Math.min(2,index+1)].title}</p><ArrowRight size={24}/></div>}
      <div className="story-bottom"><div className="story-scroll-cue"><ArrowDown size={15}/><span>{translations[locale].home.scrollCue}</span></div><div className="story-timeline" aria-label={locale==='hi'?'विकास के चरण':'Development stages'}>{names.map((name,i)=><button key={name} disabled={reduced} onClick={()=>jump(index,[.12,.45,.79][i])} aria-current={stage===i?'step':undefined}><span className="story-timeline-track"><i style={{transform:`scaleX(${clamp(renovation*3-i)})`}}/></span>{name}</button>)}</div><span className="story-disclaimer">{locale==='hi'?'चित्रों से बना अस्थायी उड़ान पूर्वावलोकन':<T text={"Flight preview · still artwork"}/>}</span></div>
    </>;
  };
  return <><Navbar variant="home" locale={locale} onToggleLocale={onToggleLocale}/>
    <div ref={journey} className={`development-story flight-journey ${reduced?'flight-journey--still':''}`}>
      {inStory&&!reduced&&<nav className="story-chapter-nav" aria-label={locale==='hi'?'यात्रा के पड़ाव':'Story chapters'}>{chapters.map((c,i)=><button key={c.id} onClick={()=>jump(i)} aria-label={c.title} aria-current={state.chapter===i?'step':undefined}><span>{c.number}</span><i/></button>)}</nav>}
      {reduced?chapters.map((c,i)=><section key={c.id} className="story-viewport flight-still-scene" aria-label={c.title}><ScrollStoryCanvas chapter={c.id as StoryChapter} progress={1} reducedMotion/>{overlay(i,1,2)}</section>):
      <section className="story-viewport flight-viewport" aria-label={chapters[state.chapter].title} data-chapter={chapters[state.chapter].id} data-flight={state.flight>0?'travelling':'orbiting'}>
        {chapters.map((c,i)=>{
          const outgoing=i===state.chapter,incoming=i===state.chapter+1;
          if(!outgoing&&!incoming)return null;
          const f=state.flight;
          return <div key={c.id} className="flight-location" aria-hidden={!outgoing} style={{opacity:outgoing?1: f,transform:outgoing?`translate3d(${-f*88}%,${-f*20}%,0) scale(${1-f*.2}) rotate(${-f*5}deg)`:`translate3d(${(1-f)*92}%,${(1-f)*24}%,0) scale(${1.18-f*.18}) rotate(${(1-f)*6}deg)`,zIndex:incoming?1:0}}><ScrollStoryCanvas chapter={c.id as StoryChapter} progress={outgoing?state.renovation:0} cameraProgress={outgoing?Math.min(1,state.local/.82):0}/></div>;
        })}
        <div className="flight-atmosphere" style={{opacity:Math.sin(state.flight*Math.PI)*.65}}/>
        {overlay(state.chapter,state.renovation,state.stage,state.flight)}
      </section>}
    </div></>;
}

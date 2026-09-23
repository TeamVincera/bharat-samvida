'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import type {Locale} from '@/lib/i18n';
import {translateText} from '@/lib/translate';
const Context=createContext<{locale:Locale;setLocale:(locale:Locale)=>void}>({locale:'en',setLocale:()=>{}});
export function LocaleProvider({children,initialLocale='en'}:{children:React.ReactNode;initialLocale?:Locale}) {
  const [locale,setValue]=useState<Locale>(initialLocale);
  const setLocale=(next:Locale)=>{setValue(next);document.cookie=`bs_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;};
  useEffect(()=>{document.documentElement.lang=locale;},[locale]);
  return <Context.Provider value={{locale,setLocale}}>{children}</Context.Provider>;
}
export function useLocale(){return useContext(Context);}
/** Emits text, not an extra DOM wrapper, including inside server-rendered pages. */
export function T({text}:{text:string}){const {locale}=useLocale();return <>{translateText(locale,text)}</>;}

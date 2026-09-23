import crypto from 'crypto';
import {getStore} from '@netlify/blobs';
import {sealSession,openSession} from './session-codec';
import { AnalysisResult } from './types';

export interface EphemeralSession {
  sessionId: string;
  createdAt: number;
  lastActiveAt: number;
  drafts: Record<string, {
    draftId: string;
    brief: string;
    redactedBrief: string;
    revision: number;
    answers: Record<string, any>;
    analysisResult?: AnalysisResult;
  }>;
}

// Local development uses memory; Netlify uses an encrypted, private shared store.
const processGlobal=globalThis as typeof globalThis & {bharatSessions?:Map<string,EphemeralSession>};
const sessionStore=processGlobal.bharatSessions??=new Map<string,EphemeralSession>();
const IDLE_EXPIRY_MS=30*60*1000,HARD_EXPIRY_MS=2*60*60*1000;
const remote=()=>process.env.SESSION_STORAGE==='netlify';
const store=()=>getStore({name:'bharat-sessions-v1',consistency:'strong'});
const idFor=(token:string)=>crypto.createHash('sha256').update(token).digest('hex');
const expiry=(session:EphemeralSession)=>Math.min(session.createdAt+HARD_EXPIRY_MS,session.lastActiveAt+IDLE_EXPIRY_MS);
export async function saveSession(session:EphemeralSession,token:string) {
  if(idFor(token)!==session.sessionId)throw new Error('Session ownership mismatch');
  if(remote())await store().set(session.sessionId,sealSession(session,token),{metadata:{expiresAt:session.createdAt+HARD_EXPIRY_MS}});
  else sessionStore.set(session.sessionId,session);
}
export async function createSession():Promise<{sessionId:string;token:string}> {
  const now=Date.now();
  for(const [id,session] of sessionStore)if(expiry(session)<=now)sessionStore.delete(id);
  const token=crypto.randomBytes(32).toString('hex'),sessionId=idFor(token);
  await saveSession({sessionId,createdAt:now,lastActiveAt:now,drafts:{}},token);
  return {sessionId,token};
}
export async function validateSessionToken(token:string):Promise<EphemeralSession|null> {
  if(!/^[a-f0-9]{64}$/.test(token))return null;
  const id=idFor(token);
  let session:EphemeralSession|undefined;
  if(remote()) {
    const encrypted=await store().get(id,{type:'text'});
    if(!encrypted)return null;
    try {session=openSession(encrypted,token);}catch{return null;}
  }else session=sessionStore.get(id);
  if(!session||session.sessionId!==id)return null;
  if(expiry(session)<=Date.now()){await deleteSession(token);return null;}
  session.lastActiveAt=Date.now();
  // Reads must not rewrite the whole record and overwrite a simultaneous answer.
  return session;
}
export async function deleteSession(token:string):Promise<boolean> {
  if(!/^[a-f0-9]{64}$/.test(token))return false;
  if(remote()){await store().delete(idFor(token));return true;}
  return sessionStore.delete(idFor(token));
}

export function getOrCreateDraft(session: EphemeralSession, draftId?: string) {
  const id = draftId && /^draft-[a-zA-Z0-9-]{1,80}$/.test(draftId) ? draftId : `draft-${crypto.randomBytes(8).toString('hex')}`;
  if (!session.drafts[id]) {
    session.drafts[id] = {
      draftId: id,
      brief: '',
      redactedBrief: '',
      revision: 1,
      answers: {}
    };
  }
  return session.drafts[id];
}

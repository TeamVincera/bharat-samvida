import crypto from 'crypto';
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

// In-memory ephemeral session storage
// Share the ephemeral store across route bundles and development hot reloads.
const processGlobal = globalThis as typeof globalThis & { bharatSessions?: Map<string, EphemeralSession> };
const sessionStore = processGlobal.bharatSessions ??= new Map<string, EphemeralSession>();

const IDLE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const HARD_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export function createSession(): { sessionId: string; token: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = crypto.createHash('sha256').update(token).digest('hex');

  const now = Date.now();
  sessionStore.set(sessionId, {
    sessionId,
    createdAt: now,
    lastActiveAt: now,
    drafts: {}
  });

  return { sessionId, token };
}

export function validateSessionToken(token: string): EphemeralSession | null {
  if (!token) return null;
  const sessionId = crypto.createHash('sha256').update(token).digest('hex');
  const session = sessionStore.get(sessionId);

  if (!session) return null;

  const now = Date.now();
  // Check hard expiry
  if (now - session.createdAt > HARD_EXPIRY_MS) {
    sessionStore.delete(sessionId);
    return null;
  }

  // Check idle expiry
  if (now - session.lastActiveAt > IDLE_EXPIRY_MS) {
    sessionStore.delete(sessionId);
    return null;
  }

  // Update activity timestamp
  session.lastActiveAt = now;
  return session;
}

export function deleteSession(token: string): boolean {
  if (!token) return false;
  const sessionId = crypto.createHash('sha256').update(token).digest('hex');
  return sessionStore.delete(sessionId);
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

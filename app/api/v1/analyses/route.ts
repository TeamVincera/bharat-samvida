import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationAdapter } from '@/lib/adapters/recommendationAdapter';
import { validateSessionToken, createSession, getOrCreateDraft } from '@/lib/sessions';
import { addTenderQuestions } from '@/lib/tender-completeness';
import { scanAndRedactText } from '@/lib/privacy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief, locale = 'en', draftId: requestedDraftId, revision = 1 } = body;

    if (!brief || typeof brief !== 'string' || brief.trim().length === 0 || brief.length > 60000 || !['en','hi'].includes(locale)) {
      return NextResponse.json({ error: 'Procurement brief is required' }, { status: 400 });
    }

    // Server-side DLP validation
    const dlpResult = scanAndRedactText(brief);
    if (dlpResult.hasBlockedCredentials) {
      return NextResponse.json({
        error: 'Credentials detected in brief. Please remove API keys, secrets, or passwords before submitting.',
        details: dlpResult.blockedDetails
      }, { status: 400 });
    }

    // Retrieve or create session
    let token = req.cookies.get('bs_session')?.value;
    let session = token ? validateSessionToken(token) : null;
    let newCookieToken: string | null = null;

    if (!session) {
      const created = createSession();
      token = created.token;
      newCookieToken = token;
      session = validateSessionToken(token);
    }

    const draft = getOrCreateDraft(session!, requestedDraftId);
    draft.brief = dlpResult.redactedText;
    draft.redactedBrief = dlpResult.redactedText;
    draft.revision = Number.isInteger(revision) && revision > 0 ? revision : 1;

    const adapter = getRecommendationAdapter();
    const result = addTenderQuestions(await adapter.analyzeBrief(dlpResult.redactedText, locale as 'en' | 'hi', draft.draftId, draft.revision, req.signal));

    draft.analysisResult = result;

    const response = NextResponse.json(result, {headers:{'Cache-Control':'private, no-store'}});
    if (newCookieToken) {
      response.cookies.set('bs_session', newCookieToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7200
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Analysis could not be completed. Please retry or check the server configuration.' }, { status: 502 });
  }
}

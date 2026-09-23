import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationAdapter } from '@/lib/adapters/recommendationAdapter';
import { validateSessionToken } from '@/lib/sessions';
import { UserAnswerSubmission } from '@/lib/types';
import { scanAndRedactText } from '@/lib/privacy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const analysisId = (await params).analysisId;
    const body = await req.json();
    const { questionId, answerType, optionId, customText, draftId } = body;

    const token = req.cookies.get('bs_session')?.value;
    const session = token ? validateSessionToken(token) : null;
    if (!session) return NextResponse.json({error:'Your temporary session expired. Please analyse your brief again.'},{status:401});
    if (typeof draftId !== 'string' || !/^draft-[a-zA-Z0-9-]{1,80}$/.test(draftId) || typeof questionId !== 'string' || !['option','custom','unknown','skip'].includes(answerType) || (customText !== undefined && (typeof customText !== 'string' || customText.length > 1000))) return NextResponse.json({error:'Invalid clarification answer.'},{status:400});

    // Redact custom text if provided
    let cleanCustomText = customText;
    if (customText) {
      const dlp = scanAndRedactText(customText);
      if (dlp.hasBlockedCredentials) {
        return NextResponse.json({
          error: 'Credentials detected in custom answer.',
          details: dlp.blockedDetails
        }, { status: 400 });
      }
      cleanCustomText = dlp.redactedText;
    }

    const answerSubmission: UserAnswerSubmission = {
      questionId,
      answerType,
      optionId,
      customText: cleanCustomText
    };

    const draft = session?.drafts[draftId];
    const baseResult = draft?.analysisResult;

    if (!baseResult || baseResult.analysisId !== analysisId) {
      return NextResponse.json({ error: 'Prior analysis result not found' }, { status: 404 });
    }
    const question=baseResult.questions.find(q=>q.id===questionId);
    if(!question || (answerType==='option' && !question.options.some(o=>o.id===optionId)) || (answerType==='custom' && (!question.customAllowed || !cleanCustomText?.trim()))) return NextResponse.json({error:'Choose a valid answer to the current question.'},{status:400});

    const adapter = getRecommendationAdapter();
    const updatedResult = await adapter.submitAnswer(analysisId, answerSubmission, baseResult, req.signal);

    if (draft) {
      draft.analysisResult = updatedResult;
      draft.answers[questionId] = answerSubmission;
    }

    return NextResponse.json(updatedResult, {headers:{'Cache-Control':'private, no-store'}});
  } catch (err: any) {
    return NextResponse.json({ error: 'The answer could not be processed. Your previous result is preserved; please retry.' }, { status: 502 });
  }
}

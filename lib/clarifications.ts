import { isConfirmedTenderAnswer } from './tender-completeness';
import { AnalysisResult, UserAnswerSubmission } from './types';

export function applyClarification(prior: AnalysisResult, answer: UserAnswerSubmission): AnalysisResult {
  const question=prior.questions.find(q=>q.id===answer.questionId);
  if(!question) throw new Error('That question is no longer available. Please retry the analysis.');
  if(!['option','custom','unknown','skip'].includes(answer.answerType)) throw new Error('Choose an answer type.');
  const value=answer.answerType==='option'?question.options.find(o=>o.id===answer.optionId)?.label:
    answer.answerType==='custom'?answer.customText?.trim():undefined;
  if((answer.answerType==='option'||answer.answerType==='custom')&&!value) throw new Error('Choose one of the answers or enter your own.');
  const questions=prior.questions.filter(q=>q.id!==question.id);
  const tenderDetails = {...prior.tenderDetails};
  if(question.itemId==='TENDER') tenderDetails[question.field]={value:value||'Not confirmed',confirmed:isConfirmedTenderAnswer(question.field,value||'',answer.answerType)};
  return {...prior,tenderDetails,revision:prior.revision+1,generatedAt:new Date().toISOString(),questions,
    status:questions.length?'needs_clarification':'completed',
    items:prior.items.map(item=>item.id!==question.itemId?item:{...item,
      confirmedAttributes:value?[...item.confirmedAttributes.filter(a=>a.name!==question.field),{name:question.field,value,origin:'user_answer'}]:item.confirmedAttributes,
      unresolvedFields:value?item.unresolvedFields.filter(f=>f!==question.field):Array.from(new Set([...item.unresolvedFields,question.field]))
    })};
}

import { AnalysisResult, ClarificationQuestion } from './types';

export const tenderFields = [
  {key:'authority',label:'Purchaser and tender reference',prompt:'Who is issuing this tender, and what is its reference?',reason:'The document needs an issuing authority and an identifiable tender reference.',options:['Government department — details pending','Public sector enterprise — details pending','Local authority — details pending','Private organisation — details pending'],customOnly:true},
  {key:'delivery_location',label:'Delivery or work location',prompt:'Where exactly will the goods be delivered or the work carried out?',reason:'Location determines transport, access, site conditions and delivery obligations.',options:['Single site — address pending','Multiple sites — addresses pending','Collection by purchaser — point pending','Location is still being confirmed'],customOnly:true},
  {key:'delivery_schedule',label:'Delivery and completion schedule',prompt:'What delivery or completion period should bidders plan for?',reason:'Dates or a period measured from a defined trigger are needed for a comparable offer.',options:['Within 30 days of purchase order','Within 60 days of purchase order','Within 90 days of purchase order','Phased delivery — schedule pending']},
  {key:'bid_schedule',label:'Submission and opening arrangements',prompt:'What are the tender submission and opening arrangements?',reason:'The notice needs an authorised portal, closing date and time, and opening arrangements.',options:['GeM — dates pending','CPPP / eProcure — dates pending','Department portal — dates pending','Procurement route not yet approved'],customOnly:true},
  {key:'acceptance',label:'Inspection and acceptance plan',prompt:'How should delivery quality be inspected and accepted?',reason:'Name the checks, acceptance limits, evidence, responsible inspector and rejection procedure.',options:['Purchaser inspection — criteria pending','Independent laboratory — tests pending','Site trials — acceptance limits pending','Inspection plan to be approved'],customOnly:true},
  {key:'warranty',label:'Warranty and after-sales support',prompt:'What warranty or defect-remedy period is required?',reason:'Define the support period and confirm service response and remedy terms before issue.',options:['12 months from acceptance','24 months from acceptance','36 months from acceptance','Not applicable — authority must confirm']},
  {key:'payment',label:'Payment and commercial terms',prompt:'What payment arrangement should the draft record?',reason:'Payment milestones, documents, taxes and payment period need explicit approval.',options:['After acceptance — payment period pending','Milestone payments — schedule pending','Approved departmental terms — reference pending','Commercial terms not yet approved'],customOnly:true},
  {key:'qualification',label:'Bidder qualification and evaluation',prompt:'Which approved eligibility and evaluation requirements apply?',reason:'Criteria must be proportionate, stated in advance and objectively reviewable.',options:['Approved departmental criteria — reference pending','Technical compliance and evaluated price — details pending','Experience and capacity criteria — thresholds pending','Criteria require procurement review'],customOnly:true},
  {key:'contract_terms',label:'Contract conditions and securities',prompt:'Which contract conditions and security provisions have been approved?',reason:'Confirm bid/performance security, exemptions, delay remedies, termination and dispute clauses.',options:['Department GCC/SCC — version pending','GeM terms — applicability pending','Project-specific conditions — review pending','No approved contract conditions yet'],customOnly:true}
] as const;

export function addTenderQuestions(result:AnalysisResult):AnalysisResult {
  // Quantity is always asked with an exact schedule, rather than broad ranges
  // from the model followed by a second, conflicting quantity question.
  const questions=result.questions.filter(q=>q.itemId==='TENDER'||!(/^(quantity|qty|quantity_required|required_quantity)$/i.test(q.field)));
  const details=result.tenderDetails||{};
  const add=(key:string,prompt:string,reason:string,options:readonly string[])=>{
    if(details[key]?.confirmed||questions.some(q=>q.id===`tender:${key}`))return;
    questions.push({id:`tender:${key}`,itemId:'TENDER',field:key,prompt,reason,severity:'applicability',options:options.map((label,i)=>({id:['A','B','C','D'][i] as 'A'|'B'|'C'|'D',label})),customAllowed:true,unknownAllowed:true});
  };
  // Per-item questions prevent a single quantity/specification being applied to a mixed tender.
  for(const item of result.items) {
    add(`quantity:${item.id}`,`How much of “${item.name}” is required?`,'State an exact quantity and unit, or measured work quantity. Use Something else for your actual schedule.',['1 unit','10 units','50 units','Quantity or measurement not finalised']);
    add(`performance:${item.id}`,`What measurable technical requirements apply to “${item.name}”?`,'Enter material, dimensions, operating conditions, performance limits and any approved drawing reference. Do not guess values.',['Engineer will provide specifications','Approved drawing reference is pending','Site survey is still required','Only the intended use is known']);
  }
  for(const field of tenderFields)add(field.key,field.prompt,field.reason,field.options);
  return {...result,tenderDetails:details,questions,status:questions.length?'needs_clarification':result.status};
}

export function isConfirmedTenderAnswer(key:string,value:string,type:string) {
  if(type==='skip'||type==='unknown'||value.trim().length<5||/pending|not finalised|not yet|not applicable|not approved|not.*confirmed|to be confirmed|don't know|not sure|\bTBD\b/i.test(value))return false;
  if(key.startsWith('quantity:')&&!/[1-9][0-9]*(?:\.[0-9]+)?\s*\S+/.test(value))return false;
  if(key.startsWith('performance:')||tenderFields.some(f=>f.key===key&&'customOnly' in f&&f.customOnly))return type==='custom';
  return true;
}

export function tenderGaps(result:Pick<AnalysisResult,'items'|'tenderDetails'>) {
  const fields=[...tenderFields.map(f=>({key:f.key,label:f.label})),...result.items.flatMap(i=>[
    {key:`quantity:${i.id}`,label:`${i.name}: quantity and unit`},
    {key:`performance:${i.id}`,label:`${i.name}: measurable technical requirements`}
  ])];
  return fields.filter(f=>!result.tenderDetails?.[f.key]?.confirmed).map(f=>f.label);
}

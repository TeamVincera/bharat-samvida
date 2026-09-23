require('./helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {NextRequest}=require('next/server');
const {addTenderQuestions,tenderGaps}=require('../lib/tender-completeness.ts');
const {applyClarification}=require('../lib/clarifications.ts');
const {DemoRecommendationAdapter}=require('../lib/adapters/recommendationAdapter.ts');
const {exportSchema,createPdf,createDocx}=require('../lib/exports/report.ts');
const {POST:exportRoute}=require('../app/api/v1/exports/route.ts');
const {POST:answersRoute}=require('../app/api/v1/analyses/[analysisId]/answers/route.ts');
const {createSession,validateSessionToken,getOrCreateDraft}=require('../lib/sessions.ts');
const {scanAndRedactText}=require('../lib/privacy.ts');
const fixture=()=>JSON.parse(fs.readFileSync('data/demo-result.json','utf8'));
const request=(body,cookie='')=>new NextRequest('http://localhost:3000/api/v1/test',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify(body)});

test('Missing context creates item-specific and tender questions; adding twice does not duplicate them',()=>{
 const r=addTenderQuestions(fixture());
 assert.equal(r.status,'needs_clarification');assert.equal(tenderGaps(r).length,11);
 assert.ok(r.questions.some(q=>q.field==='quantity:'+r.items[0].id));
 assert.ok(r.questions.some(q=>q.field==='contract_terms'));
 assert.equal(addTenderQuestions(r).questions.length,r.questions.length);
 for(const q of r.questions){assert.equal(q.options.length,4);assert.equal(q.customAllowed,true);}
});
test('Actual selected wording is saved; skipped answers remain unresolved',()=>{
 let r=addTenderQuestions(fixture());
 const quantity=r.questions.find(q=>q.field.startsWith('quantity:'));
 r=applyClarification(r,{questionId:quantity.id,answerType:'option',optionId:'B'});
 assert.equal(r.tenderDetails[quantity.field].value,'10 units');assert.equal(r.tenderDetails[quantity.field].confirmed,true);
 const authority=r.questions.find(q=>q.field==='authority');
 r=applyClarification(r,{questionId:authority.id,answerType:'option',optionId:'A'});
 assert.equal(r.tenderDetails.authority.confirmed,false);
 const performance=r.questions.find(q=>q.field.startsWith('performance:'));
 r=applyClarification(r,{questionId:performance.id,answerType:'unknown'});
 assert.equal(r.tenderDetails[performance.field].confirmed,false);
 assert.throws(()=>applyClarification(r,{questionId:authority.id,answerType:'option',optionId:'A'}));
});
test('Completing clarifications preserves item scope and creates clauses',async()=>{
 const adapter=new DemoRecommendationAdapter();
 let r=addTenderQuestions(await adapter.analyzeBrief('housing water pipes and internal wiring','en','draft-test',1));
 const originalIds=r.items.map(i=>i.id);
 while(r.questions.length) r=await adapter.submitAnswer(r.analysisId,{questionId:r.questions[0].id,answerType:'unknown'},r);
 assert.deepEqual(r.items.map(i=>i.id),originalIds);
 assert.ok(r.draftSections.length>0);assert.notEqual(r.status,'needs_clarification');
 assert.ok(tenderGaps(r).length>0);assert.ok(r.draftSections.every(s=>s.unresolved));
});
test('Answer routes require the server-owned session; forged prior result cannot bypass it',async()=>{
 const {token}=createSession();const session=validateSessionToken(token);const draft=getOrCreateDraft(session,'draft-unit');
 const base=addTenderQuestions(fixture());base.draftId=draft.draftId;draft.analysisResult=base;
 const q=base.questions[0];const body={draftId:draft.draftId,questionId:q.id,answerType:'option',optionId:'B',priorResult:{items:[]}};
 const denied=await answersRoute(request(body),{params:{analysisId:base.analysisId}});assert.equal(denied.status,401);
 const ok=await answersRoute(request(body,`bs_session=${token}`),{params:{analysisId:base.analysisId}});assert.equal(ok.status,200);
 const result=await ok.json();assert.ok(result.items.length>0);assert.equal(result.questions.length,base.questions.length-1);
});
test('Exports are genuine readable PDF / DOCX and contain the tender structure',async()=>{
 const data=exportSchema.parse({format:'pdf',result:fixture()}).result;
 data.draftSections.push({heading:'हिंदी विवरण',body:'विद्यालय के लिए दीवारों का रंग और गुणवत्ता परीक्षण।',sourceIds:[],unresolved:true});
 const pdf=await createPdf(data);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 const parsed=await require('pdf-parse/lib/pdf-parse.js')(pdf);
 for(const section of ['Invitation and tender particulars','Financial offer schedule','NOT READY FOR ISSUE'])assert.ok(parsed.text.includes(section));
 assert.ok(parsed.numpages>=2);
 const docx=await createDocx(data);assert.equal(docx.subarray(0,2).toString(),'PK');
 const extracted=await require('mammoth').extractRawText({buffer:docx});assert.ok(extracted.value.includes('विद्यालय'));assert.ok(extracted.value.includes('Bid submission and contract forms'));
});
test('Export endpoint rejects unfinished analyses and malformed formats',async()=>{
 assert.equal((await exportRoute(request({format:'pdf',result:addTenderQuestions(fixture())}))).status,409);
 assert.equal((await exportRoute(request({format:'exe',result:fixture()}))).status,400);
 const pdf=await exportRoute(request({format:'pdf',result:fixture()}));assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.equal(pdf.headers.get('cache-control'),'private, no-store');
});
test('Every legal library record points to a local PDF with the recorded hash',()=>{
 const docs=JSON.parse(fs.readFileSync('data/legal-documents.json')).documents;
 for(const d of docs){const bytes=fs.readFileSync('public/pdfs/'+d.local_path.split('/').pop());assert.equal(bytes.subarray(0,5).toString(),'%PDF-',d.id);assert.equal(require('crypto').createHash('sha256').update(bytes).digest('hex'),d.sha256,d.id);}
});
test('The real privacy guard rejects credentials and masks contact details',()=>{
 assert.equal(scanAndRedactText('password=synthetic-test-value').hasBlockedCredentials,true);
 const r=scanAndRedactText('Contact qa@example.org on 9876543210 for classroom paint.');assert.ok(!r.redactedText.includes('qa@example.org'));assert.ok(!r.redactedText.includes('9876543210'));assert.ok(r.redactedText.includes('classroom paint'));
});

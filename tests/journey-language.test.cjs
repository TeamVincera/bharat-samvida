require('./helpers/register-typescript.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs');
const {journeyAt}=require('../lib/journey.ts');
const {translateText,translateDocumentText}=require('../lib/translate.ts');
const {readDocumentPage,hindiDocumentPage,hindiPagePdf}=require('../lib/document-language.ts');
const {GET:search}=require('../app/api/v1/documents/route.ts');
const {NextRequest}=require('next/server');
test('Flight follows one bounded reversible timeline through all three locations',()=>{
 assert.equal(journeyAt(0).chapter,0);assert.equal(journeyAt(1/3).chapter,1);assert.equal(journeyAt(2/3).chapter,2);assert.equal(journeyAt(1).renovation,1);
 assert.ok(journeyAt(.3).flight>0);assert.equal(journeyAt(.3).renovation,1);
 for(const p of [0,.15,.3,.333333,.5,.62,.66667,.9,1]){const first=journeyAt(p);journeyAt(1);assert.deepEqual(journeyAt(p),first);assert.ok(first.flight>=0&&first.flight<=1);assert.ok(first.renovation>=0&&first.renovation<=1)}
});
test('Every legal title and issuer has a Hindi interface translation',()=>{
 for(const doc of JSON.parse(fs.readFileSync('data/legal-documents.json')).documents){assert.match(translateText('hi',doc.title),/[\u0900-\u097f]/,doc.id);assert.match(translateText('hi',doc.issuer),/[\u0900-\u097f]/,doc.id)}
 const {reportBlocks,exportSchema}=require('../lib/exports/report.ts');
 const report=reportBlocks(exportSchema.parse({format:'pdf',result:{...JSON.parse(fs.readFileSync('data/demo-result.json')),locale:'hi'}}).result);
 for(const block of report.filter(b=>b.type==='heading'))assert.match(block.text,/[\u0900-\u097f]/);
 assert.ok(!report.some(b=>b.text.includes('Prepare separately identifiable')));
 assert.equal(translateText('en','Download PDF'),'Download PDF');assert.match(translateText('hi','How much of “paint” is required?'),/कितनी/);
 assert.ok(translateDocumentText('hi','TO BE CONFIRMED: IS 269:2015').includes('IS 269:2015'));
});
test('Hindi title search returns the same official document',async()=>{
 const response=await search(new NextRequest('http://localhost:3000/api/v1/documents?q='+encodeURIComponent('31 जुलाई 2025')));const body=await response.json();assert.ok(body.documents.some(d=>d.id==='DOC-025'));
});
test('Document page access checks identity, bounds and official Hindi provenance',async()=>{
 assert.throws(()=>readDocumentPage('../secrets',1));assert.throws(()=>readDocumentPage('DOC-001',9999));
 const page=await hindiDocumentPage('DOC-025',1);assert.equal(page.kind,'official_hindi');assert.match(page.text,/[\u0900-\u097f]/);
 for(const doc of JSON.parse(fs.readFileSync('data/legal-documents.json')).documents){const pages=JSON.parse(fs.readFileSync('data/document-text/'+doc.id+'.json'));assert.equal(pages.pages.length,doc.page_count)}
});
test('A Hindi reading-page download is a genuine PDF with an explicit translation label',async()=>{
 const bytes=await hindiPagePdf({text:'यह परीक्षण पाठ है। मूल संदर्भ IS 269:2015 है।',kind:'translation',page:1,totalPages:18,documentId:'DOC-001'});assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const result=await require('pdf-parse/lib/pdf-parse.js')(bytes);assert.ok(result.text.includes('IS 269:2015'));assert.ok(result.text.includes('AI'));assert.equal(result.numpages,1);
});

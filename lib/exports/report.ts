import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import path from 'path';
import { z } from 'zod';
import { tenderGaps } from '../tender-completeness';
import {translateDocumentText} from '../translate';

const text = z.string().max(12000);
const strings = z.array(text).max(200).default([]);
const candidate = z.object({
  standardId: text, designation: text, title: text, role: text,
  reason: text, sourceIds: strings, versionState: text, certificationState: text,
  openConditions: strings, includedInDraft: z.boolean().default(true)
}).passthrough();
export const exportSchema = z.object({
  format: z.enum(['pdf', 'docx', 'json']),
  result: z.object({
    tenderDetails: z.record(z.string(),z.object({value:text,confirmed:z.boolean()})).default({}),
    analysisId: text, draftId: text, revision: z.number(),
    mode: z.enum(['demo','live']), locale: z.enum(['en','hi']),
    corpusRelease: text, generatedAt: text, status: text,
    items: z.array(z.object({
      id: text, name: text,
      confirmedAttributes: z.array(z.object({name: text, value: text, origin: text})).max(100).default([]),
      unresolvedFields: strings, candidates: z.array(candidate).max(100).default([])
    })).max(100),
    draftSections: z.array(z.object({heading: text, body: text, unresolved: z.boolean(), sourceIds: strings})).max(100),
    relatedEdges: z.array(z.object({fromStandardId: text, citedDesignation: text, relation: text, verificationState: text})).max(200).default([]),
    sources: z.array(z.object({id: text, title: text, url: text, evidenceType: text, checkedAt: text})).max(200),
    warnings: strings
  }).passthrough()
});
type ExportResult = z.infer<typeof exportSchema>['result'];
type Block = {type: 'heading' | 'label' | 'body' | 'table'; text: string; rows?:string[][]};

export function reportBlocks(data: ExportResult): Block[] {
  const blocks: Block[] = [];
  const add = (type: Block['type'], text: string) => blocks.push({type, text});
  add('body', `Reference: ${data.analysisId} | Revision: ${data.revision}\nGenerated: ${data.generatedAt}\nCorpus: ${data.corpusRelease}`);
  add('label', data.mode === 'demo' ? 'DEMONSTRATION DRAFT - NOT LIVE STANDARDS VERIFICATION' : 'PROVISIONAL DRAFT - TECHNICAL REVIEW REQUIRED');
  add('body', 'An independent SIH project concept. Recommendations require review by the procuring authority. Verify editions, amendments and certification applicability before tender publication.');
  const detail=(key:string)=>data.tenderDetails[key]?.confirmed?data.tenderDetails[key].value:`TO BE CONFIRMED${data.tenderDetails[key]?.value?': '+data.tenderDetails[key].value:''}`;
  const table=(rows:string[][])=>blocks.push({type:'table',text:'',rows});
  add('heading','01 / Invitation and tender particulars');
  table([['Particular','Recorded requirement'],['Purchaser / reference',detail('authority')],['Procurement subject',data.items.map(i=>i.name).join('; ')],['Submission and opening',detail('bid_schedule')],['Delivery / work site',detail('delivery_location')],['Completion period',detail('delivery_schedule')]]);
  add('body','This is a preparation draft, not an issued invitation. The authorised purchaser must approve the procurement route, dates, tender reference and all conditions before publication.');
  add('heading','02 / Bid preparation and submission');
  add('body',`Submission arrangements: ${detail('bid_schedule')}. Prepare separately identifiable technical and price submissions in the format prescribed by the selected portal. State compliance or deviations against each requirement. Bid validity, clarifications deadline, pre-bid arrangements and submission documents: TO BE CONFIRMED by the issuing authority.`);
  add('heading','03 / Item and delivery schedule');
  table([['Item / description','Quantity and unit','Delivery period','Destination'],...data.items.map(item=>[item.name,detail('quantity:'+item.id),detail('delivery_schedule'),detail('delivery_location')])]);
  add('body','Confirm the scope of packing, transport, insurance, unloading, installation, commissioning, training and incidental works where relevant. Items or services not expressly included require clarification.');
  add('heading','04 / Technical requirements');
  data.items.forEach(item=>{
    add('label',item.name);
    add('body',detail('performance:'+item.id));
    if(item.confirmedAttributes.length)add('body',item.confirmedAttributes.map(a=>`${a.name}: ${a.value}`).join('\n'));
    if(item.unresolvedFields.length)add('body',`Outstanding item details: ${item.unresolvedFields.join('; ')}`);
  });
  add('heading', '05 / Standards and supporting evidence');
  const candidates = data.items.flatMap(i => i.candidates);
  if(!candidates.length) add('body', 'No supported standard candidates are available for this scope in the current collection.');
  candidates.forEach(c => {
    add('label', `${c.designation} - ${c.title}`);
    add('body', `${c.reason}\nRole: ${c.role.replaceAll('_',' ')}\nVersion evidence: ${c.versionState.replaceAll('_',' ')}\nCertification: ${c.certificationState.replaceAll('_',' ')}\nDraft inclusion: ${c.includedInDraft ? 'Included for review' : 'Excluded'}\nEvidence: ${c.sourceIds.join(', ') || 'Not supplied'}`);
    if(c.openConditions.length) add('body', `Conditions: ${c.openConditions.join('; ')}`);
  });
  add('heading','06 / Item-specific draft clauses');
  if(!data.draftSections.length) add('body','No technical clauses have been prepared. Resolve outstanding questions before using this document.');
  data.draftSections.forEach(s=>{
    add('label', s.heading);
    add('body', s.body);
    if(s.unresolved) add('body','PROVISIONAL: unresolved technical requirements remain.');
    if(s.sourceIds.length) add('body',`Evidence: ${s.sourceIds.join(', ')}`);
  });
  add('heading', '07 / Related standards');
  if(!data.relatedEdges.length) add('body','No normative relationships have been verified in the current collection.');
  data.relatedEdges.forEach(e=>add('body',`${e.fromStandardId} -> ${e.citedDesignation}: ${e.relation.replaceAll('_',' ')} (${e.verificationState})`));
  add('heading','08 / Quality checks and acceptance');
  add('body',detail('acceptance'));
  add('body','Before issue, specify the inspection authority, applicable test methods, sampling, acceptance limits, delivery records and how non-conforming supplies will be corrected or rejected. Manufacturer statements alone must not be treated as independent verification.');
  add('heading','09 / Bidder eligibility and evaluation');
  add('body',detail('qualification'));
  add('body','Record the approved evidence for eligibility and capacity, the technical compliance checks and the price-comparison method. Any preference, exemption, certification condition or disqualification rule requires a verified applicable source and authority approval.');
  add('heading','10 / Commercial and contract conditions');
  table([['Subject','Recorded terms'],['Payment',detail('payment')],['Warranty / defect remedy',detail('warranty')],['Approved contract conditions',detail('contract_terms')]]);
  add('body','Do not issue without approved provisions for taxes and duties, payment period and supporting documents, security amounts or exemptions, changes in scope, delay remedies, termination, liability, grievance handling, applicable law and dispute resolution. No amount, penalty rate or legal jurisdiction has been inferred by this application.');
  add('heading','11 / Financial offer schedule');
  table([['Item','Quantity / unit','Unit rate / taxes','Total offered price'],...data.items.map(item=>[item.name,detail('quantity:'+item.id),'BIDDER TO FILL','BIDDER TO FILL'])]);
  add('body','The purchaser must publish the approved financial bid format on the chosen portal. State whether prices include packing, freight, installation and duties; identify tax rates and any optional items separately. This PDF is not a portal BOQ spreadsheet.');
  add('heading','12 / Bid submission and contract forms');
  add('body','Prepare purchaser-approved forms for the signed bid covering letter, bidder identity and authority, item compliance, technical deviations, qualification evidence, declarations and price schedule. Add security or guarantee formats only where approved and applicable. Include the final acceptance/contract form and signatory blocks before issue.');
  add('label','Purchaser approval record');
  add('body','Technical reviewer: ____________________    Date: __________\nProcurement / finance reviewer: ____________________    Date: __________\nAuthorised issuing officer: ____________________    Date: __________');
  add('heading','13 / Evidence register');
  data.sources.forEach(s=>{
    add('label',`[${s.id}] ${s.title}`);
    add('body',`${s.evidenceType.replaceAll('_',' ')} | Checked: ${s.checkedAt}\n${s.url}`);
  });
  if(!data.sources.length) add('body','No authoritative sources were attached to this result.');
  add('heading','14 / Unresolved matters and issue approval');
  const gaps=tenderGaps(data as unknown as import('../types').AnalysisResult);
  if(gaps.length)add('body', 'NOT READY FOR ISSUE. Missing or unconfirmed particulars:\n'+gaps.map(g=>'[OPEN] '+g).join('\n'));
  add('body','Structure reference: Department of Expenditure model tender for goods (2021), read alongside the Goods Procurement Manual (2024), section 5.1.3. Use category-specific approved documents for works or services. This application does not reproduce or approve a complete legal contract.');
  add('body','https://democppp.nic.in/cppp8/sites/default/files/standard_biddingdocs/MTD%20Goods%20NIC.pdf');
  data.warnings.forEach(w=>add('body',w));
  return data.locale==='hi'?blocks.map(block=>({...block,text:translateDocumentText('hi',block.text),rows:block.rows?.map(row=>row.map(value=>translateDocumentText('hi',value)))})):blocks;
}

export async function createPdf(data: ExportResult): Promise<Buffer> {
  const fonts = path.join(process.cwd(), 'public', 'fonts');
  const doc = new PDFDocument({ size:'A4', margins:{top:64,bottom:58,left:52,right:52}, bufferPages:true,
    font:path.join(fonts,'NotoSans-Regular.ttf'), info:{Title:'Bharat Samvida - Draft technical specification',Author:'Bharat Samvida'} });
  doc.registerFont('Latin',path.join(fonts,'NotoSans-Regular.ttf'));
  doc.registerFont('Hindi',path.join(fonts,'Mukta-Regular.ttf'));
  const result = new Promise<Buffer>((resolve,reject)=>{
    const chunks: Buffer[]=[];
    doc.on('data', chunk=>chunks.push(chunk));
    doc.on('end',()=>resolve(Buffer.concat(chunks)));
    doc.on('error',reject);
  });
  doc.font(data.locale==='hi'?'Hindi':'Latin').fillColor('#10212B').fontSize(22).text(data.locale==='hi'?'भारत संविदा':'BHARAT SAMVIDA');
  doc.fillColor('#A64306').fontSize(11).text(data.locale==='hi'?'निविदा तकनीकी विनिर्देश का मसौदा':'DRAFT TECHNICAL SPECIFICATION', {characterSpacing:data.locale==='hi'?0:1});
  doc.moveDown(1.4);
  for (const block of reportBlocks(data)) {
    if(block.type==='table'&&block.rows) {
      const rows=block.rows, columns=rows[0].length, cellWidth=491/columns;
      // Bound each physical row so unusually long user requirements can continue
      // across pages without covering the footer or dropping table borders.
      const segments = (value:string) => {
        const chunks:string[]=[];
        let remaining=value;
        while(remaining.length>340) {
          const space=remaining.lastIndexOf(' ',340);
          const end=space>170?space:340;
          chunks.push(remaining.slice(0,end));remaining=remaining.slice(end).trimStart();
        }
        chunks.push(remaining);return chunks;
      };
      const physicalRows=rows.flatMap((row,index)=>{
        if(index===0)return [row];
        const parts=row.map(segments);
        return Array.from({length:Math.max(...parts.map(p=>p.length))},(_,i)=>parts.map(p=>p[i]||''));
      });
      const rowHeight=(row:string[])=>{
        doc.fontSize(8);
        return Math.max(32,...row.map(value=>{
          doc.font(/[\u0900-\u097f]/.test(value)?'Hindi':'Latin');
          return doc.heightOfString(value,{width:cellWidth-14,lineGap:2})+16;
        }));
      };
      if(doc.y+rowHeight(rows[0])+rowHeight(physicalRows[1]||[])>760)doc.addPage();
      const drawRow=(row:string[],header:boolean)=>{
        const height=rowHeight(row);
        if(doc.y+height>760){doc.addPage();if(!header)drawRow(rows[0],true);}
        const y=doc.y;
        row.forEach((value,index)=>{
          const x=52+index*cellWidth;
          doc.rect(x,y,cellWidth,height).fillAndStroke(header?'#EAF2EB':'#FFFEFA','#DBE0D9');
          doc.font(/[\u0900-\u097f]/.test(value)?'Hindi':'Latin').fontSize(8).fillColor('#10212B').text(value,x+7,y+8,{width:cellWidth-14,lineGap:2});
        });
        doc.y=y+height;doc.x=52;
      };
      for(let i=0;i<physicalRows.length;i++) drawRow(physicalRows[i],i===0);
      doc.moveDown(.8);continue;
    }
    const size=block.type==='heading'?14:block.type==='label'?10.5:9.5;
    const font=/[\u0900-\u097f]/.test(block.text)?'Hindi':'Latin';
    doc.font(font).fontSize(size);
    const options={width:491,lineGap:4};
    // Keep headings with the first lines of their content, without pinning long paragraphs.
    const needed=Math.min(doc.heightOfString(block.text, options),100)+(block.type==='heading'?120:block.type==='label'?42:0);
    if(doc.y+needed>760) doc.addPage();
    if(block.type==='heading') doc.moveDown(.65);
    doc.fillColor(block.type==='heading'?'#24594A':block.type==='label'?'#10212B':'#3E525B').text(block.text,52,doc.y,options);
    doc.moveDown(block.type==='heading'?.7:.6);
  }
  const pages=doc.bufferedPageRange();
  for(let i=pages.start;i<pages.start+pages.count;i++) {
    doc.switchToPage(i);
    doc.save().strokeColor('#DBE0D9').moveTo(52,36).lineTo(543,36).stroke().restore();
    doc.font(data.locale==='hi'?'Hindi':'Latin').fillColor('#66777B').fontSize(8).text(data.locale==='hi'?'भारत संविदा / समीक्षा प्रति':'BHARAT SAMVIDA / REVIEW COPY',52,23,{lineBreak:false});
    doc.text(`${data.locale==='hi'?'प्रारंभिक मसौदा':'Provisional draft'}  |  ${i+1} / ${pages.count}`,52,806,{lineBreak:false});
  }
  doc.end();
  return result;
}

export async function createDocx(data: ExportResult): Promise<Buffer> {
  const hindi = data.locale === 'hi';
  const doc = new Document({creator:'Bharat Samvida',title:hindi?'तकनीकी विनिर्देश का मसौदा':'Draft technical specification',
    styles:{default:{document:{run:{font:hindi?'Mukta':'Noto Sans'}}}},
    sections:[{children:[
      new Paragraph({text:hindi?'भारत संविदा':'BHARAT SAMVIDA',heading:HeadingLevel.TITLE}),
      new Paragraph({text:hindi?'तकनीकी विनिर्देश का मसौदा':'Draft technical specification',spacing:{after:240}}),
      ...reportBlocks(data).map(b=>b.type==='table'&&b.rows?new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:b.rows.map((row,index)=>new TableRow({tableHeader:index===0,children:row.map(value=>new TableCell({children:[new Paragraph({children:[new TextRun({text:value,bold:index===0,size:18})]})]}))}))}):new Paragraph({
        heading:b.type==='heading'?HeadingLevel.HEADING_1:undefined,
        spacing:{after:140},keepNext:b.type!=='body',
        children:b.text.split('\n').map((line,i)=>new TextRun({text:line,break:i?1:0,bold:b.type==='label',font:hindi?'Mukta':'Noto Sans',size:b.type==='heading'?28:21}))
      }))
    ]}]});
  return Packer.toBuffer(doc);
}

import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export const runtime='nodejs';
const MAX_FILE_SIZE=10*1024*1024;
export async function POST(req:NextRequest) {
  try {
    const form=await req.formData();
    const file=form.get('file');
    if(!file||typeof file==='string')return NextResponse.json({error:'No file provided.'},{status:400});
    if(file.size>MAX_FILE_SIZE)return NextResponse.json({error:'Files must be smaller than 10 MB.'},{status:413});
    const name=file.name.toLowerCase();
    const buffer=Buffer.from(await file.arrayBuffer());
    let extractedText='';
    if(name.endsWith('.txt')) extractedText=buffer.toString('utf8');
    else if(name.endsWith('.pdf')) {
      if(!buffer.subarray(0,5).equals(Buffer.from('%PDF-')))return NextResponse.json({error:'This file is not a valid PDF.'},{status:415});
      const parsed=await pdf(buffer,{max:100});
      if(parsed.numpages>100)return NextResponse.json({error:'Use a PDF with 100 pages or fewer.'},{status:422});
      extractedText=parsed.text;
    } else if(name.endsWith('.docx')) {
      extractedText=(await mammoth.extractRawText({buffer})).value;
    } else return NextResponse.json({error:'Upload a PDF, DOCX or TXT file.'},{status:415});
    if(extractedText.trim().length<15)return NextResponse.json({error:'No readable text found. For scanned PDFs, paste the text or upload a searchable PDF.'},{status:422});
    if(extractedText.length>60000)return NextResponse.json({error:'This document contains too much text. Upload the relevant tender sections (up to 60,000 characters).'}, {status:422});
    return NextResponse.json({success:true,filename:file.name,size:file.size,characterCount:extractedText.length,extractedText},{headers:{'Cache-Control':'private, no-store'}});
  } catch {
    return NextResponse.json({error:'This document could not be read. Check that it is valid and not password protected.'},{status:422});
  }
}

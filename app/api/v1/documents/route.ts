import { NextRequest, NextResponse } from 'next/server';
import { getLegalDocuments, getCategoryTaxonomy } from '@/lib/corpus';
import {translateText} from '@/lib/translate';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const type = searchParams.get('type');
  const availability = searchParams.get('availability');

  let docs = getLegalDocuments();

  if (category && category !== 'All') {
    docs = docs.filter(d => d.category && d.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (subcategory && subcategory !== 'All') docs = docs.filter(d => d.category.split('/')[1]?.trim() === subcategory);

  if (type && type !== 'All') {
    docs = docs.filter(d => d.legal_type && d.legal_type.toLowerCase() === type.toLowerCase());
  }

  if (availability && availability !== 'All') {
    docs = docs.filter(d => d.availability === availability);
  }

  if (q && q.trim()) {
    const term = q.trim();
    docs = docs.filter(d => 
      (d.title && d.title.toLowerCase().includes(term)) ||
      (d.id && d.id.toLowerCase().includes(term)) ||
      (d.issuer && d.issuer.toLowerCase().includes(term)) ||
      (d.category && d.category.toLowerCase().includes(term)) ||
      [d.title,d.issuer,...d.category.split('/').map(s=>s.trim())].some(value=>translateText('hi',value).includes(term))
    );
  }

  const taxonomy = getCategoryTaxonomy();

  return NextResponse.json({
    total: docs.length,
    documents: docs,
    taxonomy
  });
}

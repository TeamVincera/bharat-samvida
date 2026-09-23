import fs from 'fs';
import path from 'path';
import { LegalDocument } from './types';

let cachedDocuments: LegalDocument[] | null = null;
let documentsModifiedAt = 0;
let cachedStandards: any[] | null = null;

export function getLegalDocuments(): LegalDocument[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'legal-documents.json');
    if (fs.existsSync(filePath)) {
      const modifiedAt = fs.statSync(filePath).mtimeMs;
      if (cachedDocuments && documentsModifiedAt === modifiedAt) return cachedDocuments;
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      cachedDocuments = parsed.documents || [];
      documentsModifiedAt = modifiedAt;
      return cachedDocuments!;
    }
  } catch (err) {
    console.error('Failed to load legal-documents.json:', err);
  }

  return [];
}

export function getLegalDocumentById(id: string): LegalDocument | null {
  const docs = getLegalDocuments();
  return docs.find(d => d.id === id) || null;
}

export interface CategoryHierarchy {
  category: string;
  count: number;
  subcategories: {
    name: string;
    count: number;
  }[];
}

export function getCategoryTaxonomy(): CategoryHierarchy[] {
  const docs = getLegalDocuments();
  const catMap = new Map<string, Map<string, number>>();

  for (const doc of docs) {
    const rawCat = doc.category || 'General';
    const parts = rawCat.split('/').map(s => s.trim());
    const topCat = parts[0] || 'General';
    const subCat = parts[1] || 'General';

    if (!catMap.has(topCat)) {
      catMap.set(topCat, new Map<string, number>());
    }
    const subMap = catMap.get(topCat)!;
    subMap.set(subCat, (subMap.get(subCat) || 0) + 1);
  }

  const result: CategoryHierarchy[] = [];
  for (const [category, subMap] of catMap.entries()) {
    let totalCount = 0;
    const subcategories: { name: string; count: number }[] = [];
    for (const [name, count] of subMap.entries()) {
      totalCount += count;
      subcategories.push({ name, count });
    }
    result.push({ category, count: totalCount, subcategories });
  }

  return result;
}

export function getStandardsStarter(): any[] {
  if (cachedStandards) {
    return cachedStandards;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'standards-starter.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      cachedStandards = parsed.standards || [];
      return cachedStandards!;
    }
  } catch (err) {
    console.error('Failed to load standards-starter.json:', err);
  }

  return [];
}

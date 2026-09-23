import { RedactedSpan } from './types';

// Regular expressions for sensitive and private data patterns in Indian procurement contexts
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(?:\+91[\-\s]?)?[6789]\d{9}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
const GSTIN_REGEX = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;
const AADHAAR_REGEX = /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g;
const BANK_IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
const BANK_ACC_REGEX = /\b(?:A\/C|Account|Acc|AC|a\/c)[\s#:]*([0-9]{9,18})\b/gi;
const TENDER_REF_REGEX = /\b(?:NIT|Tender|Ref|RFP|RFQ)[\s\/:#\-]+([A-Za-z0-9\/\-_]{5,30})\b/gi;
const API_KEY_REGEX = /\b(?:gsk_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9\.\-_]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[A-Za-z0-9]{36})\b/g;
const CREDENTIAL_REGEX = /(?:password|secret|api[_-]?key|auth[_-]?token)[\s:=]+([^\s,;]+)/gi;

export interface ScanResult {
  hasBlockedCredentials: boolean;
  blockedDetails: string[];
  spans: RedactedSpan[];
  redactedText: string;
  replacementMap: Record<string, string>;
}

export function scanAndRedactText(text: string): ScanResult {
  if (!text) {
    return {
      hasBlockedCredentials: false,
      blockedDetails: [],
      spans: [],
      redactedText: '',
      replacementMap: {}
    };
  }

  const spans: RedactedSpan[] = [];
  const blockedDetails: string[] = [];

  // Check for credentials first (these are hard-blocked from being transmitted)
  let credMatch;
  while ((credMatch = API_KEY_REGEX.exec(text)) !== null) {
    blockedDetails.push('API key / Token detected');
  }
  while ((credMatch = CREDENTIAL_REGEX.exec(text)) !== null) {
    blockedDetails.push('Password / Secret credentials detected');
  }

  const hasBlockedCredentials = blockedDetails.length > 0;

  // Helper to add a span
  const addMatch = (regex: RegExp, category: RedactedSpan['category'], prefix: string) => {
    let match;
    let index = 1;
    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;
      
      // Avoid overlapping spans
      const overlaps = spans.some(s => (start >= s.start && start < s.end) || (end > s.start && end <= s.end));
      if (!overlaps) {
        spans.push({
          id: `span-${category}-${index}`,
          text: matchText,
          category,
          placeholder: `[${prefix}_${index}]`,
          start,
          end,
          active: true
        });
        index++;
      }
    }
  };

  addMatch(EMAIL_REGEX, 'contact', 'EMAIL');
  addMatch(PHONE_REGEX, 'contact', 'PHONE');
  addMatch(PAN_REGEX, 'tender_id', 'PAN');
  addMatch(GSTIN_REGEX, 'tender_id', 'GSTIN');
  addMatch(AADHAAR_REGEX, 'tender_id', 'AADHAAR');
  addMatch(BANK_IFSC_REGEX, 'bank', 'IFSC');
  addMatch(BANK_ACC_REGEX, 'bank', 'BANK_ACC');
  addMatch(TENDER_REF_REGEX, 'tender_id', 'TENDER_REF');

  // Sort spans by start index
  spans.sort((a, b) => a.start - b.start);

  // Build redacted text and map
  let redactedText = '';
  let lastIndex = 0;
  const replacementMap: Record<string, string> = {};

  for (const span of spans) {
    redactedText += text.substring(lastIndex, span.start);
    redactedText += span.placeholder;
    replacementMap[span.placeholder] = span.text;
    lastIndex = span.end;
  }
  redactedText += text.substring(lastIndex);

  return {
    hasBlockedCredentials,
    blockedDetails,
    spans,
    redactedText,
    replacementMap
  };
}

export function restoreEntities(redactedContent: string, replacementMap: Record<string, string>): string {
  let restored = redactedContent;
  for (const [placeholder, original] of Object.entries(replacementMap)) {
    restored = restored.replaceAll(placeholder, original);
  }
  return restored;
}

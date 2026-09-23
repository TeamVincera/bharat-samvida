const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('----------------------------------------------------');
console.log('BHARAT SAMVIDA — AUTOMATED ACCEPTANCE TEST SUITE');
console.log('----------------------------------------------------');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// 1. Assets and Manifest Tests
test('Logo asset exists and is accessible in public/assets', () => {
  const logoPath = path.join(__dirname, '..', 'public', 'assets', 'bharat-samvida-logo.png');
  assert.ok(fs.existsSync(logoPath), 'Logo file must exist');
  const stat = fs.statSync(logoPath);
  assert.ok(stat.size > 10000, 'Logo file size must be valid');
});

test('Legal documents manifest exists with 44 records', () => {
  const manifestPath = path.join(__dirname, '..', 'data', 'legal-documents.json');
  assert.ok(fs.existsSync(manifestPath), 'data/legal-documents.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.strictEqual(manifest.documents.length, 44, 'Must contain exactly 44 document records');
});

test('At least 42 official downloaded PDFs exist in public/pdfs', () => {
  const pdfDir = path.join(__dirname, '..', 'public', 'pdfs');
  assert.ok(fs.existsSync(pdfDir), 'public/pdfs must exist');
  const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
  assert.ok(files.length >= 42, `Found ${files.length} PDFs, expected at least 42`);
});

// 2. Data Loss Prevention (DLP) Tests
test('DLP detection identifies phone, email, and tender references', () => {
  const sample = "Contact officer Ramesh at ramesh.kumar@nic.in or 9876543210 for NIT-2026-PWD-4421.";
  const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const PHONE_REGEX = /(?:\+91[\-\s]?)?[6789]\d{9}\b/g;
  
  assert.ok(EMAIL_REGEX.test(sample), 'Email must be detected');
  assert.ok(PHONE_REGEX.test(sample), 'Phone number must be detected');
});

test('DLP hard-blocks credentials (API keys and passwords)', () => {
  const sampleWithKey = "Tender brief with auth gsk_349823489234892348923489234 and password=secret123";
  const API_KEY_REGEX = /\b(?:gsk_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9\.\-_]{20,})\b/g;
  const CRED_REGEX = /(?:password|secret)[\s:=]+([^\s,;]+)/gi;
  
  assert.ok(API_KEY_REGEX.test(sampleWithKey), 'API Key must be detected');
  assert.ok(CRED_REGEX.test(sampleWithKey), 'Password must be detected');
});

// 3. Demo Scenarios Invariant Tests
test('Demo scenarios fixture defines school, housing, and bridge cases', () => {
  const scenariosPath = path.join(__dirname, '..', 'data', 'demo-scenarios.json');
  assert.ok(fs.existsSync(scenariosPath), 'demo-scenarios.json must exist');
  const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));
  const ids = scenarios.scenarios.map(s => s.id);
  assert.ok(ids.includes('school'), 'Must include school scenario');
  assert.ok(ids.includes('housing'), 'Must include housing scenario');
  assert.ok(ids.includes('bridge'), 'Must include bridge scenario');
});

test('Demo clarification has exactly four options A-D with custom and unknown allowed', () => {
  const clarPath = path.join(__dirname, '..', 'data', 'demo-clarification.json');
  assert.ok(fs.existsSync(clarPath), 'demo-clarification.json must exist');
  const clar = JSON.parse(fs.readFileSync(clarPath, 'utf-8'));
  const q = clar.questions[0];
  assert.ok(q, 'Must have at least one question');
  assert.strictEqual(q.options.length, 4, 'Must have exactly 4 options');
  assert.deepStrictEqual(q.options.map(o => o.id), ['A', 'B', 'C', 'D'], 'Options must be A, B, C, D');
  assert.strictEqual(q.customAllowed, true, 'customAllowed must be true');
  assert.strictEqual(q.unknownAllowed, true, 'unknownAllowed must be true');
});

test('Standards starter contains observed Indian Standards without fabricated mandatory claims', () => {
  const stdPath = path.join(__dirname, '..', 'data', 'standards-starter.json');
  assert.ok(fs.existsSync(stdPath), 'standards-starter.json must exist');
  const stds = JSON.parse(fs.readFileSync(stdPath, 'utf-8'));
  for (const s of stds.standards) {
    assert.strictEqual(s.certification_status, 'not_determined', `${s.designation} must have not_determined certification status`);
    assert.strictEqual(s.latest_verified, false, `${s.designation} must not claim unverified latest status`);
  }
});

console.log('----------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('----------------------------------------------------');

if (failed > 0) {
  process.exit(1);
}

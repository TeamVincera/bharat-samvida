export type AppMode = 'demo' | 'live';

export type AnalysisStatus = 'needs_clarification' | 'completed' | 'insufficient_evidence';

export type QuestionSeverity = 'identity' | 'applicability' | 'helpful';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
}

export interface ClarificationQuestion {
  id: string;
  itemId: string;
  field: string;
  prompt: string;
  reason: string;
  severity: QuestionSeverity;
  options: QuestionOption[];
  customAllowed: boolean;
  unknownAllowed: boolean;
}

export interface ConfirmedAttribute {
  name: string;
  value: string;
  origin: 'user_brief' | 'user_answer' | 'model_inferred';
}

export type VersionState = 
  | 'published_observed' 
  | 'latest_verified' 
  | 'superseded' 
  | 'withdrawn' 
  | 'verification_needed';

export type CertificationState = 
  | 'required' 
  | 'conditional' 
  | 'not_required_for_reviewed_scope' 
  | 'not_determined';

export interface StandardCandidate {
  standardId: string;
  designation: string;
  title: string;
  role: 'primary_product' | 'test_method' | 'terminology' | 'safety' | 'installation' | 'allied_product' | 'design_guidance';
  reason: string;
  sourceIds: string[];
  versionState: VersionState;
  amendmentCount: number | null;
  certificationState: CertificationState;
  certificationSourceIds: string[];
  openConditions: string[];
  includedInDraft: boolean;
}

export interface ProcurementItem {
  id: string;
  name: string;
  confirmedAttributes: ConfirmedAttribute[];
  unresolvedFields: string[];
  candidates: StandardCandidate[];
}

export interface RelatedEdge {
  fromStandardId: string;
  citedDesignation: string;
  resolvedStandardId: string | null;
  relation: 'normative_reference' | 'test_method' | 'allied_candidate' | 'safety' | 'installation';
  dated: boolean;
  clause: string | null;
  sourceId: string | null;
  verificationState: 'verified' | 'unresolved' | 'demo';
}

export interface DraftSection {
  heading: string;
  body: string;
  sourceIds: string[];
  unresolved: boolean;
}

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  evidenceType: 'laboratory_listing' | 'official_product_manual' | 'order' | 'act' | 'manual' | 'gazette';
  page: number | null;
  clause: string | null;
  checkedAt: string;
  contentHash: string | null;
}

export interface AnalysisResult {
  tenderDetails?: Record<string, { value: string; confirmed: boolean }>;
  schemaVersion: '1.0';
  mode: AppMode;
  analysisId: string;
  draftId: string;
  revision: number;
  status: AnalysisStatus;
  locale: 'en' | 'hi';
  corpusRelease: string;
  generatedAt: string;
  questions: ClarificationQuestion[];
  items: ProcurementItem[];
  relatedEdges: RelatedEdge[];
  draftSections: DraftSection[];
  sources: SourceCitation[];
  warnings: string[];
}

export interface LegalDocument {
  hindi_pages?: number[];
  id: string;
  title: string;
  category: string;
  source_url: string;
  pdf_url?: string;
  checked_on: string;
  legal_currency: 'current' | 'superseded' | 'amended' | 'not_adjudicated';
  public_rehosting: string;
  amendment_chain_complete: boolean;
  mime: string;
  availability: 'downloaded' | 'source_only';
  local_path?: string;
  bytes?: number;
  sha256?: string;
  page_count?: number;
  issuer: string;
  legal_type: 'act' | 'rules' | 'regulation' | 'manual' | 'qco' | 'order' | 'guideline' | 'corrigendum';
  effective_date?: string | null;
  amendments?: Array<{ id: string; title: string; date?: string; url?: string }>;
}

export interface RedactedSpan {
  id: string;
  text: string;
  category: 'name' | 'contact' | 'tender_id' | 'address' | 'bank' | 'credential' | 'commercial';
  placeholder: string;
  start: number;
  end: number;
  active: boolean;
}

export interface UserAnswerSubmission {
  questionId: string;
  answerType: 'option' | 'custom' | 'unknown' | 'skip';
  optionId?: 'A' | 'B' | 'C' | 'D';
  customText?: string;
}

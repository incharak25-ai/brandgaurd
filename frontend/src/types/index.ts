export interface KnowledgeBaseSource {
  id: number;
  title: string;
  description?: string;
  source_type: string;
  file_path?: string;
  extracted_text: string;
  version: number;
  status: 'draft' | 'pending_review' | 'approved' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: number;
  claim_text: string;
  category: string;
  substantiation: string;
  source_reference?: string;
  status: 'approved' | 'prohibited' | 'pending_review' | 'deprecated';
  confidence_requirement: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface Terminology {
  id: number;
  term: string;
  term_type: 'prohibited' | 'preferred' | 'sensitive' | 'competitor';
  preferred_alternative?: string;
  context_rule?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: number;
  document_revision_id: number;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  matched_text: string;
  start_index: number;
  end_index: number;
  message: string;
  suggestion?: string;
  evidence?: string;
  status: 'open' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface DocumentRevision {
  id: number;
  document_id: number;
  version: number;
  content: string;
  created_by: string;
  notes?: string;
  compliance_score: number;
  created_at: string;
  findings: Finding[];
}

export interface ReviewDecision {
  id: number;
  document_id: number;
  document_revision_id?: number;
  reviewer_name: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  rationale: string;
  created_at: string;
}

export interface Comment {
  id: number;
  document_id: number;
  author: string;
  content: string;
  created_at: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  document_type: string;
  status: 'draft' | 'analyzed' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';
  current_version: number;
  compliance_score: number;
  critical_findings_count: number;
  total_findings_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail extends DocumentItem {
  revisions: DocumentRevision[];
  decisions: ReviewDecision[];
  comments: Comment[];
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  details?: string;
  timestamp: string;
}

export interface DashboardMetrics {
  total_documents: number;
  approved_documents: number;
  in_review_documents: number;
  changes_requested_documents: number;
  draft_documents: number;
  average_compliance_score: number;
  findings_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  claims_stats: {
    total: number;
    approved: number;
    prohibited: number;
  };
  terminology_stats: {
    prohibited: number;
    preferred: number;
  };
  top_flagged_violations: Array<{
    matched_text: string;
    category: string;
    count: number;
  }>;
  recent_decisions: Array<{
    id: number;
    document_id: number;
    reviewer_name: string;
    decision: string;
    rationale: string;
    created_at: string;
  }>;
  recent_audits: Array<{
    id: number;
    action: string;
    entity_type: string;
    entity_id: string;
    performed_by: string;
    details?: string;
    timestamp: string;
  }>;
}

export interface AnalysisResult {
  compliance_score: number;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    matched_text: string;
    start_index: number;
    end_index: number;
    message: string;
    suggestion?: string;
    evidence?: string;
    status: string;
  }>;
}

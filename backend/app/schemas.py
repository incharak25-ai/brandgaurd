import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

# Knowledge Base Schemas
class KnowledgeBaseSourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_type: str = "brand_guidelines"
    version: int = 1
    status: str = "approved"

class KnowledgeBaseSourceCreate(KnowledgeBaseSourceBase):
    extracted_text: str

class KnowledgeBaseSourceResponse(KnowledgeBaseSourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    extracted_text: str
    file_path: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# Claims Register Schemas
class ClaimBase(BaseModel):
    claim_text: str
    category: str = "performance"
    substantiation: str
    source_reference: Optional[str] = None
    status: str = "approved"
    confidence_requirement: str = "high"

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

# Terminology Schemas
class TerminologyBase(BaseModel):
    term: str
    term_type: str = "prohibited" # prohibited, preferred, sensitive, competitor
    preferred_alternative: Optional[str] = None
    context_rule: Optional[str] = None
    severity: str = "high" # critical, high, medium, low

class TerminologyCreate(TerminologyBase):
    pass

class TerminologyResponse(TerminologyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

# Findings Schemas
class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_revision_id: int
    category: str
    severity: str
    matched_text: str
    start_index: int
    end_index: int
    message: str
    suggestion: Optional[str] = None
    evidence: Optional[str] = None
    status: str
    created_at: datetime.datetime

# Document Revision Schemas
class DocumentRevisionCreate(BaseModel):
    content: str
    created_by: str = "Copywriter"
    notes: Optional[str] = None

class DocumentRevisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    version: int
    content: str
    created_by: str
    notes: Optional[str] = None
    compliance_score: float
    created_at: datetime.datetime
    findings: List[FindingResponse] = []

# Comments & Review Decisions
class CommentCreate(BaseModel):
    author: str
    content: str

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    author: str
    content: str
    created_at: datetime.datetime

class ReviewDecisionCreate(BaseModel):
    reviewer_name: str
    decision: str # approved, rejected, changes_requested
    rationale: str
    document_revision_id: Optional[int] = None

class ReviewDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    document_revision_id: Optional[int] = None
    reviewer_name: str
    decision: str
    rationale: str
    created_at: datetime.datetime

# Document Schemas
class DocumentCreate(BaseModel):
    title: str
    document_type: str = "marketing_copy"
    content: str
    created_by: str = "Copywriter"
    notes: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    status: Optional[str] = None

class DocumentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    document_type: str
    status: str
    current_version: int
    compliance_score: Optional[float] = 100.0
    critical_findings_count: int = 0
    total_findings_count: int = 0
    created_at: datetime.datetime
    updated_at: datetime.datetime

class DocumentDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    document_type: str
    status: str
    current_version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    revisions: List[DocumentRevisionResponse] = []
    decisions: List[ReviewDecisionResponse] = []
    comments: List[CommentResponse] = []

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    action: str
    entity_type: str
    entity_id: str
    performed_by: str
    details: Optional[str] = None
    timestamp: datetime.datetime

# Analysis Request / Response
class AnalyzeContentRequest(BaseModel):
    content: str
    title: Optional[str] = "Untitled"

class AnalysisResultSchema(BaseModel):
    compliance_score: float
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    findings: List[dict]

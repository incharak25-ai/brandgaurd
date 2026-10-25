import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

class KnowledgeBaseSource(Base):
    __tablename__ = "knowledge_base_sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    source_type = Column(String(100), default="brand_guidelines") # brand_guidelines, compliance_policy, regulatory, product_spec
    file_path = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=False, default="")
    version = Column(Integer, default=1)
    status = Column(String(50), default="approved") # draft, pending_review, approved, archived
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_text = Column(String(500), nullable=False, index=True)
    category = Column(String(100), default="performance") # performance, sustainability, safety, security, financial
    substantiation = Column(Text, nullable=False) # Approved proof/study/evidence
    source_reference = Column(String(255), nullable=True) # KB Document / section reference
    status = Column(String(50), default="approved") # approved, prohibited, pending_review, deprecated
    confidence_requirement = Column(String(50), default="high") # high, medium, low
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Terminology(Base):
    __tablename__ = "terminology"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(200), nullable=False, index=True)
    term_type = Column(String(50), default="prohibited") # prohibited, preferred, sensitive, competitor
    preferred_alternative = Column(String(200), nullable=True)
    context_rule = Column(Text, nullable=True)
    severity = Column(String(50), default="high") # critical, high, medium, low
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    document_type = Column(String(100), default="marketing_copy") # marketing_copy, press_release, landing_page, social_post, whitepaper
    status = Column(String(50), default="draft") # draft, analyzed, in_review, approved, rejected, changes_requested
    current_version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    revisions = relationship("DocumentRevision", back_populates="document", cascade="all, delete-orphan", order_by="desc(DocumentRevision.version)")
    decisions = relationship("ReviewDecision", back_populates="document", cascade="all, delete-orphan", order_by="desc(ReviewDecision.created_at)")
    comments = relationship("Comment", back_populates="document", cascade="all, delete-orphan", order_by="asc(Comment.created_at)")


class DocumentRevision(Base):
    __tablename__ = "document_revisions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_by = Column(String(100), default="Anonymous")
    notes = Column(String(500), nullable=True)
    compliance_score = Column(Float, default=100.0) # 0 to 100
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="revisions")
    findings = relationship("Finding", back_populates="revision", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    document_revision_id = Column(Integer, ForeignKey("document_revisions.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), default="prohibited_term") # prohibited_term, preferred_term_violation, unsubstantiated_claim, prohibited_claim, absolute_claim
    severity = Column(String(50), default="high") # critical, high, medium, low, info
    matched_text = Column(String(255), nullable=False)
    start_index = Column(Integer, nullable=False, default=0)
    end_index = Column(Integer, nullable=False, default=0)
    message = Column(Text, nullable=False)
    suggestion = Column(String(500), nullable=True)
    evidence = Column(Text, nullable=True) # Guidance or citation from approved KB / Claims
    status = Column(String(50), default="open") # open, accepted, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    revision = relationship("DocumentRevision", back_populates="findings")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    document_revision_id = Column(Integer, ForeignKey("document_revisions.id", ondelete="SET NULL"), nullable=True)
    reviewer_name = Column(String(100), nullable=False)
    decision = Column(String(50), nullable=False) # approved, rejected, changes_requested
    rationale = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="decisions")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    author = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="comments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True) # e.g. DOCUMENT_CREATED, ANALYSIS_RUN, DECISION_RECORDED
    entity_type = Column(String(50), nullable=False, index=True) # document, knowledge_base, claim, terminology, review
    entity_id = Column(String(100), nullable=False, index=True)
    performed_by = Column(String(100), default="System")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

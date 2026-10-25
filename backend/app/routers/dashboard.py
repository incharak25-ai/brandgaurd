from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models import (
    Document, DocumentRevision, Finding, Claim, Terminology, ReviewDecision, AuditLog
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    # 1. Document Counts
    total_docs = db.query(Document).count()
    approved_docs = db.query(Document).filter(Document.status == "approved").count()
    in_review_docs = db.query(Document).filter(Document.status == "in_review").count()
    changes_requested_docs = db.query(Document).filter(Document.status == "changes_requested").count()
    draft_docs = db.query(Document).filter(Document.status == "draft").count()

    # 2. Average Compliance Score of latest revisions
    avg_score_res = db.query(func.avg(DocumentRevision.compliance_score)).scalar()
    avg_compliance_score = round(float(avg_score_res), 1) if avg_score_res is not None else 100.0

    # 3. Findings Breakdown by Severity
    critical_findings = db.query(Finding).filter(Finding.severity == "critical").count()
    high_findings = db.query(Finding).filter(Finding.severity == "high").count()
    medium_findings = db.query(Finding).filter(Finding.severity == "medium").count()
    low_findings = db.query(Finding).filter(Finding.severity == "low").count()

    # 4. Claims Stats
    total_claims = db.query(Claim).count()
    approved_claims = db.query(Claim).filter(Claim.status == "approved").count()
    prohibited_claims = db.query(Claim).filter(Claim.status == "prohibited").count()

    # 5. Terminology Count
    prohibited_terms_count = db.query(Terminology).filter(Terminology.term_type == "prohibited").count()
    preferred_terms_count = db.query(Terminology).filter(Terminology.term_type == "preferred").count()

    # 6. Top Flagged Violations
    top_flagged = (
        db.query(Finding.matched_text, Finding.category, func.count(Finding.id).label("count"))
        .group_by(Finding.matched_text, Finding.category)
        .order_by(func.count(Finding.id).desc())
        .limit(5)
        .all()
    )
    top_flagged_list = [
        {"matched_text": item[0], "category": item[1], "count": item[2]}
        for item in top_flagged
    ]

    # 7. Recent Decisions
    recent_decisions = (
        db.query(ReviewDecision)
        .order_by(ReviewDecision.created_at.desc())
        .limit(5)
        .all()
    )
    recent_decisions_list = [
        {
            "id": d.id,
            "document_id": d.document_id,
            "reviewer_name": d.reviewer_name,
            "decision": d.decision,
            "rationale": d.rationale,
            "created_at": d.created_at.isoformat()
        }
        for d in recent_decisions
    ]

    # 8. Recent Audit Logs
    recent_audits = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(6)
        .all()
    )
    recent_audits_list = [
        {
            "id": a.id,
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "performed_by": a.performed_by,
            "details": a.details,
            "timestamp": a.timestamp.isoformat()
        }
        for a in recent_audits
    ]

    return {
        "total_documents": total_docs,
        "approved_documents": approved_docs,
        "in_review_documents": in_review_docs,
        "changes_requested_documents": changes_requested_docs,
        "draft_documents": draft_docs,
        "average_compliance_score": avg_compliance_score,
        "findings_by_severity": {
            "critical": critical_findings,
            "high": high_findings,
            "medium": medium_findings,
            "low": low_findings
        },
        "claims_stats": {
            "total": total_claims,
            "approved": approved_claims,
            "prohibited": prohibited_claims
        },
        "terminology_stats": {
            "prohibited": prohibited_terms_count,
            "preferred": preferred_terms_count
        },
        "top_flagged_violations": top_flagged_list,
        "recent_decisions": recent_decisions_list,
        "recent_audits": recent_audits_list
    }

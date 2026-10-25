import datetime
from sqlalchemy.orm import Session
from backend.app.models import (
    KnowledgeBaseSource, Claim, Terminology, Document, DocumentRevision, Finding,
    ReviewDecision, Comment, AuditLog
)
from backend.app.engine.analyzer import analyze_content
from backend.app.engine.audit_service import log_audit

def seed_database(db: Session, force: bool = False):
    """
    Populates database with rich fictional demo data for ApexCore Technologies.
    """
    if not force and db.query(Document).count() > 0:
        return {"message": "Database already contains data"}

    # Clear existing if force
    if force:
        db.query(Finding).delete()
        db.query(ReviewDecision).delete()
        db.query(Comment).delete()
        db.query(DocumentRevision).delete()
        db.query(Document).delete()
        db.query(Terminology).delete()
        db.query(Claim).delete()
        db.query(KnowledgeBaseSource).delete()
        db.query(AuditLog).delete()
        db.commit()

    # 1. Knowledge Base Sources
    kb1 = KnowledgeBaseSource(
        title="ApexCore Brand Identity & Voice Guide 2026",
        description="Official tone, voice, and positioning guidelines for external communications.",
        source_type="brand_guidelines",
        version=2,
        status="approved",
        extracted_text="""# ApexCore Voice & Messaging Principles
1. Confident, Empirical, and Grounded: We speak with technical authority backed by reproducible benchmarks.
2. Value-Centric: Describe cost advantages as 'cost-effective' or 'capital-efficient', never describe our solutions as 'cheap'.
3. Trust & Security: Never promise absolute immunity. Use 'hardened architecture', 'defense-in-depth', and 'continuous monitoring'. Avoid words like 'unhackable', 'bulletproof', or '100% bug-free'.
4. Approved Product Names: ApexCore Cloud, ApexMesh, ApexVault."""
    )
    kb2 = KnowledgeBaseSource(
        title="Infrastructure Security & Compliance Policy §9",
        description="Mandatory compliance rules for security representations and SLA claims.",
        source_type="compliance_policy",
        version=1,
        status="approved",
        extracted_text="""# Security & SLA Claims Policy
All claims regarding system resilience must reference published SLA documentation.
- The standard SLA is 99.99% availability for enterprise tier.
- Claims of 100% uptime are strictly prohibited.
- Never assert that client data cannot be compromised under any scenario."""
    )
    kb3 = KnowledgeBaseSource(
        title="Environmental Sustainability & ESG Verification Report",
        description="Approved empirical data for green and energy conservation marketing.",
        source_type="product_spec",
        version=1,
        status="approved",
        extracted_text="""# Sustainability Metrics
- Facility PUE (Power Usage Effectiveness) benchmarked at 1.18.
- Server cooling energy reduction validated at 40% via intelligent airflow control.
- Broad claims such as '100% eco-friendly' or 'zero emissions' are prohibited under FTC Green Guides without specific renewable offsets."""
    )
    db.add_all([kb1, kb2, kb3])
    db.commit()

    # 2. Terminology Rules
    terms = [
        Terminology(
            term="unhackable",
            term_type="prohibited",
            preferred_alternative="defense-in-depth security architecture",
            context_rule="Absolute security claims violate FTC and ISO guidelines.",
            severity="critical"
        ),
        Terminology(
            term="100% bug-free",
            term_type="prohibited",
            preferred_alternative="rigorously tested and validated",
            context_rule="No commercial software is mathematically guaranteed bug-free.",
            severity="critical"
        ),
        Terminology(
            term="hack-proof",
            term_type="prohibited",
            preferred_alternative="hardened against modern exploit vectors",
            context_rule="Misleading security representation.",
            severity="critical"
        ),
        Terminology(
            term="cheap",
            term_type="prohibited",
            preferred_alternative="cost-effective",
            context_rule="Devalues premium brand equity and implies substandard engineering.",
            severity="high"
        ),
        Terminology(
            term="miracle solution",
            term_type="prohibited",
            preferred_alternative="engineered platform",
            context_rule="Hyperbolic marketing hype.",
            severity="high"
        ),
        Terminology(
            term="foolproof",
            term_type="prohibited",
            preferred_alternative="intuitive and error-resilient",
            context_rule="Unprofessional and misleading.",
            severity="medium"
        ),
        Terminology(
            term="cost-effective",
            term_type="preferred",
            preferred_alternative=None,
            context_rule="Recommended descriptor for pricing and TCO value propositions.",
            severity="low"
        ),
        Terminology(
            term="enterprise-grade",
            term_type="preferred",
            preferred_alternative=None,
            context_rule="Standard approved terminology for high-scale reliability.",
            severity="low"
        ),
        Terminology(
            term="CloudTitan",
            term_type="competitor",
            preferred_alternative="leading legacy cloud providers",
            context_rule="Direct competitor naming requires legal disclaimer and verified benchmark.",
            severity="medium"
        ),
        Terminology(
            term="OmniStack",
            term_type="competitor",
            preferred_alternative="alternative marketplace stacks",
            context_rule="Requires comparative advertising clearance.",
            severity="medium"
        )
    ]
    db.add_all(terms)
    db.commit()

    # 3. Claims Register
    claims = [
        Claim(
            claim_text="ApexCore Cloud reduces infrastructure latency by 35% across multi-region deployments",
            category="performance",
            substantiation="Q3 2026 independent third-party benchmark report #BENCH-4481 conducted by CloudMetrics Lab.",
            source_reference="KB #1 §3.2",
            status="approved",
            confidence_requirement="high"
        ),
        Claim(
            claim_text="Guarantees 99.99% enterprise service availability SLA with automated failover",
            category="performance",
            substantiation="Enterprise Master Services Agreement §7.1 and SOC2 Type II audit report.",
            source_reference="KB #2 §1.1",
            status="approved",
            confidence_requirement="high"
        ),
        Claim(
            claim_text="ApexCore reduces server cooling energy by 40% through intelligent airflow optimization",
            category="sustainability",
            substantiation="Certified Green Data Center Audit report #GDC-2025-09.",
            source_reference="KB #3 §2.1",
            status="approved",
            confidence_requirement="high"
        ),
        Claim(
            claim_text="100% bug-free and completely unhackable software",
            category="security",
            substantiation="Prohibited under FTC and legal compliance regulations. Absolute security claims cannot be substantiated.",
            source_reference="KB #2 §1.3",
            status="prohibited",
            confidence_requirement="high"
        ),
        Claim(
            claim_text="ApexCore is 10 times cheaper than all competitor platforms",
            category="financial",
            substantiation="Prohibited: Pricing comparisons depend on consumption tier and configurations.",
            source_reference="Brand Guide 2026 §2",
            status="prohibited",
            confidence_requirement="high"
        )
    ]
    db.add_all(claims)
    db.commit()

    # 4. Seed Documents with Revisions, Findings, and Reviews

    # Document 1: Q4 Hybrid Cloud Campaign (Status: in_review)
    doc1 = Document(
        title="Q4 Hybrid Cloud Enterprise Campaign",
        document_type="marketing_copy",
        status="in_review",
        current_version=1
    )
    db.add(doc1)
    db.commit()

    content1 = (
        "Discover why ApexCore Cloud is the #1 platform in the world for hybrid compute. "
        "Unlike CloudTitan, our cheap pricing model delivers 50% faster database queries with zero risk. "
        "Our engineers guarantee 100% uptime with completely unhackable container isolation."
    )
    analysis1 = analyze_content(content1, db)
    rev1 = DocumentRevision(
        document_id=doc1.id,
        version=1,
        content=content1,
        created_by="Sarah Chen (Copywriter)",
        notes="Initial campaign pitch for enterprise review",
        compliance_score=analysis1["compliance_score"]
    )
    db.add(rev1)
    db.commit()
    for f in analysis1["findings"]:
        db.add(Finding(
            document_revision_id=rev1.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            start_index=f["start_index"],
            end_index=f["end_index"],
            message=f["message"],
            suggestion=f.get("suggestion"),
            evidence=f.get("evidence"),
            status="open"
        ))
    db.commit()

    # Document 2: Data Center Sustainability Press Release (Status: approved, 2 revisions)
    doc2 = Document(
        title="Data Center Sustainability Press Release",
        document_type="press_release",
        status="approved",
        current_version=2
    )
    db.add(doc2)
    db.commit()

    # Rev 1 (bad)
    content2_v1 = "ApexCore announces a 100% eco-friendly cloud with zero emissions across all worldwide operations."
    analysis2_v1 = analyze_content(content2_v1, db)
    rev2_v1 = DocumentRevision(
        document_id=doc2.id,
        version=1,
        content=content2_v1,
        created_by="David Ross (PR Specialist)",
        notes="Draft v1 submitted to legal",
        compliance_score=analysis2_v1["compliance_score"],
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add(rev2_v1)
    db.commit()
    for f in analysis2_v1["findings"]:
        db.add(Finding(
            document_revision_id=rev2_v1.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            start_index=f["start_index"],
            end_index=f["end_index"],
            message=f["message"],
            suggestion=f.get("suggestion"),
            evidence=f.get("evidence"),
            status="dismissed"
        ))
    db.commit()

    # Rev 2 (approved)
    content2_v2 = (
        "ApexCore Technologies today published its Q3 environmental audit, demonstrating that "
        "ApexCore reduces server cooling energy by 40% through intelligent airflow optimization. "
        "Our cost-effective green facilities deliver enterprise-grade sustainability."
    )
    analysis2_v2 = analyze_content(content2_v2, db)
    rev2_v2 = DocumentRevision(
        document_id=doc2.id,
        version=2,
        content=content2_v2,
        created_by="David Ross (PR Specialist)",
        notes="Corrected greenwashing claims and linked to approved claims register entry #3",
        compliance_score=analysis2_v2["compliance_score"],
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(rev2_v2)
    db.commit()

    # Review Decision for Doc 2
    dec2 = ReviewDecision(
        document_id=doc2.id,
        document_revision_id=rev2_v2.id,
        reviewer_name="Elena Vance (Chief Compliance Officer)",
        decision="approved",
        rationale="All environmental metrics now accurately reflect certified audit GDC-2025-09 and comply with FTC Green Guides.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    )
    db.add(dec2)

    # Comment on Doc 2
    com2 = Comment(
        document_id=doc2.id,
        author="Elena Vance",
        content="Great job swapping out the broad 'zero emissions' phrase for our verified 40% airflow optimization metric.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
    )
    db.add(com2)
    db.commit()

    # Document 3: NextGen Security Architecture Whitepaper (Status: changes_requested)
    doc3 = Document(
        title="NextGen Security Architecture Whitepaper",
        document_type="whitepaper",
        status="changes_requested",
        current_version=1
    )
    db.add(doc3)
    db.commit()

    content3 = (
        "ApexVault implements an unhackable hardware root of trust with 100% bug-free firmware. "
        "Clients experience zero risk during cryptographic key rollover."
    )
    analysis3 = analyze_content(content3, db)
    rev3 = DocumentRevision(
        document_id=doc3.id,
        version=1,
        content=content3,
        created_by="Marcus Vance (Solutions Architect)",
        notes="Submitted for security marketing review",
        compliance_score=analysis3["compliance_score"]
    )
    db.add(rev3)
    db.commit()
    for f in analysis3["findings"]:
        db.add(Finding(
            document_revision_id=rev3.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            start_index=f["start_index"],
            end_index=f["end_index"],
            message=f["message"],
            suggestion=f.get("suggestion"),
            evidence=f.get("evidence"),
            status="open"
        ))
    db.commit()

    dec3 = ReviewDecision(
        document_id=doc3.id,
        document_revision_id=rev3.id,
        reviewer_name="Alicia Gomez (Head of Legal)",
        decision="changes_requested",
        rationale="Critical violations: Must remove 'unhackable', '100% bug-free', and 'zero risk'. Please rewrite using defense-in-depth principles.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
    )
    db.add(dec3)
    db.commit()

    # Document 4: Product Launch Landing Page (Status: draft)
    doc4 = Document(
        title="ApexMesh Product Launch Landing Page",
        document_type="landing_page",
        status="draft",
        current_version=1
    )
    db.add(doc4)
    db.commit()
    content4 = (
        "Experience the next evolution in distributed systems with ApexMesh. "
        "Our cost-effective network mesh delivers enterprise-grade reliability and low latency."
    )
    analysis4 = analyze_content(content4, db)
    rev4 = DocumentRevision(
        document_id=doc4.id,
        version=1,
        content=content4,
        created_by="Alex Taylor (Growth Marketing)",
        notes="Initial draft preview",
        compliance_score=analysis4["compliance_score"]
    )
    db.add(rev4)
    db.commit()

    # Audit Logs
    log_audit(db, "SYSTEM_INITIALIZED", "system", "1", "SetupService", {"message": "BrandGuard knowledge system loaded"})
    log_audit(db, "KB_SOURCE_CREATED", "knowledge_base", str(kb1.id), "ComplianceLead", {"title": kb1.title})
    log_audit(db, "CLAIM_CREATED", "claim", str(claims[0].id), "ComplianceLead", {"claim": claims[0].claim_text})
    log_audit(db, "DOCUMENT_CREATED", "document", str(doc1.id), "Sarah Chen", {"title": doc1.title})
    log_audit(db, "REVIEW_DECISION_CHANGES_REQUESTED", "review", str(dec3.id), "Alicia Gomez", {"document_title": doc3.title})
    log_audit(db, "REVIEW_DECISION_APPROVED", "review", str(dec2.id), "Elena Vance", {"document_title": doc2.title})

    return {"message": "Demo data populated successfully!"}

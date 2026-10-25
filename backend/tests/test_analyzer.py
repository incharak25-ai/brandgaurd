import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models import Terminology, Claim, KnowledgeBaseSource
from backend.app.engine.analyzer import analyze_content

@pytest.fixture
def db_session():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()

    # Add mock terminology
    t1 = Terminology(
        term="unhackable",
        term_type="prohibited",
        preferred_alternative="defense-in-depth architecture",
        context_rule="Absolute security claims prohibited.",
        severity="critical"
    )
    t2 = Terminology(
        term="cheap",
        term_type="prohibited",
        preferred_alternative="cost-effective",
        context_rule="Devalues brand equity.",
        severity="high"
    )
    t3 = Terminology(
        term="CompetitorX",
        term_type="competitor",
        preferred_alternative="industry alternatives",
        context_rule="Competitor mention requires clearance.",
        severity="medium"
    )
    session.add_all([t1, t2, t3])

    # Add mock claims
    c1 = Claim(
        claim_text="ApexCloud reduces compute latency by 35%",
        category="performance",
        substantiation="Benchmark study 2026",
        status="approved"
    )
    c2 = Claim(
        claim_text="100% bug-free guarantee",
        category="security",
        substantiation="Prohibited by compliance",
        status="prohibited"
    )
    session.add_all([c1, c2])
    session.commit()

    yield session
    session.close()

def test_prohibited_terms_detection(db_session):
    text = "Our cheap servers are completely unhackable."
    result = analyze_content(text, db_session)
    
    assert result["total_findings"] >= 2
    matched_terms = [f["matched_text"].lower() for f in result["findings"]]
    assert "cheap" in matched_terms
    assert "unhackable" in matched_terms
    assert result["compliance_score"] < 100.0

def test_prohibited_claims_detection(db_session):
    text = "We offer a 100% bug-free guarantee to all enterprise customers."
    result = analyze_content(text, db_session)
    
    prohibited_claims = [f for f in result["findings"] if f["category"] == "prohibited_claim"]
    assert len(prohibited_claims) > 0
    assert prohibited_claims[0]["severity"] == "critical"

def test_unsubstantiated_metric_detection(db_session):
    # This metric is NOT in the claims register
    text = "Our new database achieves 80% faster query execution without configuration."
    result = analyze_content(text, db_session)
    
    unsubstantiated = [f for f in result["findings"] if f["category"] == "unsubstantiated_metric"]
    assert len(unsubstantiated) > 0
    assert "80% faster" in unsubstantiated[0]["matched_text"].lower()

def test_clean_compliant_text(db_session):
    text = "ApexCore provides cost-effective enterprise infrastructure designed for reliable performance."
    result = analyze_content(text, db_session)
    
    assert result["compliance_score"] == 100.0
    assert result["total_findings"] == 0

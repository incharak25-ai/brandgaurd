import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.seed_data import seed_database

# Use in-memory SQLite database with StaticPool for API integration tests
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as db:
        seed_database(db, force=True)
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    # Checks either HTML from static frontend or JSON from health endpoint
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    data = health_res.json()
    assert data["app"] == "BrandGuard"
    assert data["status"] == "operational"

def test_dashboard_metrics():
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "total_documents" in metrics
    assert "findings_by_severity" in metrics
    assert "claims_stats" in metrics
    assert metrics["total_documents"] >= 4

def test_claims_crud():
    # 1. List claims
    list_res = client.get("/api/claims/")
    assert list_res.status_code == 200
    assert len(list_res.json()) > 0

    # 2. Create claim
    new_claim = {
        "claim_text": "Reduces network latency by 20ms",
        "category": "performance",
        "substantiation": "Tested on edge nodes Q4 2026",
        "status": "approved",
        "confidence_requirement": "high"
    }
    create_res = client.post("/api/claims/", json=new_claim)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["claim_text"] == new_claim["claim_text"]

def test_terminology_crud():
    new_term = {
        "term": "unbreakable",
        "term_type": "prohibited",
        "preferred_alternative": "high fault tolerance",
        "context_rule": "Absolute claims are barred",
        "severity": "critical"
    }
    res = client.post("/api/terminology/", json=new_term)
    assert res.status_code == 200
    assert res.json()["term"] == "unbreakable"

def test_document_creation_and_analysis():
    doc_payload = {
        "title": "Press Release for New Storage Tier",
        "document_type": "press_release",
        "content": "Our cheap storage solution is 100% bug-free and guarantees 50% faster indexing.",
        "created_by": "Alex Copywriter"
    }
    res = client.post("/api/documents/", json=doc_payload)
    assert res.status_code == 200
    doc = res.json()
    assert doc["title"] == doc_payload["title"]
    assert len(doc["revisions"]) == 1
    rev = doc["revisions"][0]
    assert rev["compliance_score"] < 100.0
    assert len(rev["findings"]) > 0

def test_human_review_workflow():
    # Fetch queue
    queue_res = client.get("/api/reviews/queue")
    assert queue_res.status_code == 200

    # Submit review decision
    doc_res = client.get("/api/documents/")
    first_doc_id = doc_res.json()[0]["id"]

    decision_payload = {
        "reviewer_name": "Compliance Officer Jordan",
        "decision": "approved",
        "rationale": "All corrections verified against brand book."
    }
    dec_res = client.post(f"/api/reviews/{first_doc_id}/decision", json=decision_payload)
    assert dec_res.status_code == 200
    assert dec_res.json()["decision"] == "approved"

    # Verify status updated
    updated_doc = client.get(f"/api/documents/{first_doc_id}").json()
    assert updated_doc["status"] == "approved"

def test_audit_logs():
    res = client.get("/api/audit/")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    assert "action" in logs[0]
    assert "entity_type" in logs[0]

import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Terminology, Claim, KnowledgeBaseSource

# Pre-compiled regex patterns for common unsubstantiated / absolute / superlative claim indicators
QUANTITATIVE_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?%|\d+x|\d+\s*(?:times|percent|fold))\s+(?:faster|more efficient|savings|cheaper|reduction|increase|boost|better|uptime|growth|cheaper|lower latency)\b",
    re.IGNORECASE
)
SUPERLATIVE_PATTERN = re.compile(
    r"\b(#1|number one|market leader|the best|fastest in the world|unrivaled|unmatched|the most powerful|industry leading|unbeatable)\b",
    re.IGNORECASE
)
ABSOLUTE_PATTERN = re.compile(
    r"\b(100%|guarantee[sd]?|never fails?|zero risk|unhackable|foolproof|completely secure|impossible to breach|bug[- ]free|bulletproof)\b",
    re.IGNORECASE
)
ENVIRONMENTAL_PATTERN = re.compile(
    r"\b(100% eco[- ]friendly|completely green|zero carbon|zero emissions|fully sustainable|100% natural)\b",
    re.IGNORECASE
)
AGGRESSIVE_MARKETING_PATTERN = re.compile(
    r"\b(act now or regret it|miracle solution|secret trick|no risk whatsoever|unlimited lifetime free)\b",
    re.IGNORECASE
)

def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())

def analyze_content(content: str, db: Session) -> Dict[str, Any]:
    """
    Deterministic rule-based and knowledge-grounded brand compliance analysis.
    Works entirely offline without external AI APIs.
    """
    findings: List[Dict[str, Any]] = []
    
    # 1. Fetch Terminology rules from DB
    terms = db.query(Terminology).all()
    # 2. Fetch Claims Register from DB
    claims = db.query(Claim).all()
    # 3. Fetch Knowledge Base sources
    kb_sources = db.query(KnowledgeBaseSource).filter(KnowledgeBaseSource.status == "approved").all()

    # --- A. Terminology Scanning ---
    for item in terms:
        term_text = item.term.strip()
        if not term_text:
            continue
        # Escape special regex chars and search using word boundaries
        escaped_term = re.escape(term_text)
        pattern = re.compile(rf"\b{escaped_term}\b", re.IGNORECASE)
        
        for match in pattern.finditer(content):
            start_idx = match.start()
            end_idx = match.end()
            matched_snippet = match.group(0)
            
            if item.term_type == "prohibited":
                msg = f"Prohibited term detected: '{matched_snippet}'."
                sugg = f"Replace with approved alternative: '{item.preferred_alternative}'" if item.preferred_alternative else "Remove or replace with neutral phrasing."
                evidence = item.context_rule or "Brand Terminology Policy: This term is strictly forbidden across external communications."
                findings.append({
                    "category": "prohibited_term",
                    "severity": item.severity or "high",
                    "matched_text": matched_snippet,
                    "start_index": start_idx,
                    "end_index": end_idx,
                    "message": msg,
                    "suggestion": sugg,
                    "evidence": evidence,
                    "status": "open"
                })
            elif item.term_type == "competitor":
                findings.append({
                    "category": "competitor_mention",
                    "severity": item.severity or "medium",
                    "matched_text": matched_snippet,
                    "start_index": start_idx,
                    "end_index": end_idx,
                    "message": f"Direct competitor mention: '{matched_snippet}'.",
                    "suggestion": item.preferred_alternative or "Obtain legal clearance before publishing direct competitor comparisons.",
                    "evidence": item.context_rule or "Trademark and Comparative Advertising Guidelines.",
                    "status": "open"
                })
            elif item.term_type == "sensitive":
                findings.append({
                    "category": "sensitive_term",
                    "severity": item.severity or "medium",
                    "matched_text": matched_snippet,
                    "start_index": start_idx,
                    "end_index": end_idx,
                    "message": f"Sensitive terminology flagged: '{matched_snippet}'.",
                    "suggestion": f"Consider using: '{item.preferred_alternative}'" if item.preferred_alternative else "Ensure proper legal and compliance context.",
                    "evidence": item.context_rule or "Compliance Review Guidelines.",
                    "status": "open"
                })

    # --- B. Claims Register Matching ---
    # Check if text contains prohibited claims or matches approved claims
    for claim in claims:
        claim_normalized = normalize_text(claim.claim_text)
        # Check for phrase containment or close match
        if claim_normalized in normalize_text(content):
            # Locate in original content
            pattern = re.compile(re.escape(claim.claim_text), re.IGNORECASE)
            for m in pattern.finditer(content):
                if claim.status == "prohibited":
                    findings.append({
                        "category": "prohibited_claim",
                        "severity": "critical",
                        "matched_text": m.group(0),
                        "start_index": m.start(),
                        "end_index": m.end(),
                        "message": f"Prohibited claim found: '{claim.claim_text}'.",
                        "suggestion": "Remove this claim immediately. It has been prohibited by compliance.",
                        "evidence": f"Claims Register Ref #{claim.id} ({claim.category}): {claim.substantiation}",
                        "status": "open"
                    })
                elif claim.status == "deprecated":
                    findings.append({
                        "category": "deprecated_claim",
                        "severity": "medium",
                        "matched_text": m.group(0),
                        "start_index": m.start(),
                        "end_index": m.end(),
                        "message": f"Deprecated claim detected: '{claim.claim_text}'.",
                        "suggestion": "Update to current approved claims register phrasing.",
                        "evidence": f"Claims Register Ref #{claim.id}: {claim.substantiation}",
                        "status": "open"
                    })

    # --- C. Unsubstantiated Quantitative & Superlative Detection ---
    def check_pattern_against_claims(pattern: re.Pattern, category: str, default_severity: str, advice: str):
        for match in pattern.finditer(content):
            matched_str = match.group(0)
            start_i = match.start()
            end_i = match.end()

            # Skip if this range is already captured by a higher severity finding
            already_covered = any(f["start_index"] <= start_i and f["end_index"] >= end_i and f["category"] in ["prohibited_term", "prohibited_claim"] for f in findings)
            if already_covered:
                continue

            # Check if this matched string is part of an approved claim in the Claims Register
            is_substantiated = False
            approved_claim_ref = None
            for claim in claims:
                if claim.status == "approved" and matched_str.lower() in claim.claim_text.lower():
                    is_substantiated = True
                    approved_claim_ref = claim
                    break

            if not is_substantiated:
                findings.append({
                    "category": category,
                    "severity": default_severity,
                    "matched_text": matched_str,
                    "start_index": start_i,
                    "end_index": end_i,
                    "message": f"Unsubstantiated {category.replace('_', ' ')} detected: '{matched_str}'.",
                    "suggestion": advice,
                    "evidence": "Brand Compliance Policy: All comparative, superlative, and quantitative metrics must be formally recorded in the Claims Register with supporting empirical documentation.",
                    "status": "open"
                })

    check_pattern_against_claims(
        QUANTITATIVE_PATTERN,
        "unsubstantiated_metric",
        "high",
        "Register the metric in the Claims Register or cite the specific benchmark study."
    )
    check_pattern_against_claims(
        SUPERLATIVE_PATTERN,
        "superlative_claim",
        "high",
        "Provide third-party market share verification or qualify with 'leading provider in [specific market]'."
    )
    check_pattern_against_claims(
        ABSOLUTE_PATTERN,
        "absolute_claim",
        "critical",
        "Avoid absolute guarantees. Replace with probabilistic assurances (e.g., 'designed for high reliability', 'defense-in-depth architecture')."
    )
    check_pattern_against_claims(
        ENVIRONMENTAL_PATTERN,
        "greenwashing_risk",
        "high",
        "Qualify environmental claims with verified certifications (e.g., ISO 14001, Energy Star) rather than unqualified 'green' statements."
    )
    check_pattern_against_claims(
        AGGRESSIVE_MARKETING_PATTERN,
        "aggressive_tone",
        "medium",
        "Use professional, brand-aligned messaging that conveys value without hyperbolic pressure."
    )

    # Sort findings by position
    findings.sort(key=lambda x: x["start_index"])

    # Calculate compliance score
    critical_count = sum(1 for f in findings if f["severity"] == "critical")
    high_count = sum(1 for f in findings if f["severity"] == "high")
    medium_count = sum(1 for f in findings if f["severity"] == "medium")
    low_count = sum(1 for f in findings if f["severity"] == "low")

    # Penalties
    deductions = (critical_count * 25.0) + (high_count * 12.0) + (medium_count * 6.0) + (low_count * 2.0)
    compliance_score = max(0.0, min(100.0, round(100.0 - deductions, 1)))

    return {
        "compliance_score": compliance_score,
        "total_findings": len(findings),
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "findings": findings
    }

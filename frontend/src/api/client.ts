import {
  DashboardMetrics,
  DocumentItem,
  DocumentDetail,
  DocumentRevision,
  KnowledgeBaseSource,
  Claim,
  Terminology,
  AuditLog,
  ReviewDecision,
  Comment,
  AnalysisResult,
  Finding
} from '../types';

const BASE_URL = '/api';

// --- Offline / Client-Side Fallback Store (for GitHub Pages & Static Deployments) ---
const LOCAL_STORAGE_KEY = 'brandguard_data_v1';

const INITIAL_KB: KnowledgeBaseSource[] = [
  {
    id: 1,
    title: 'ApexCore Brand Identity & Voice Guide 2026',
    description: 'Official tone, voice, and positioning guidelines for external communications.',
    source_type: 'brand_guidelines',
    version: 2,
    status: 'approved',
    extracted_text: `# ApexCore Voice & Messaging Principles
1. Confident, Empirical, and Grounded: We speak with technical authority backed by reproducible benchmarks.
2. Value-Centric: Describe cost advantages as 'cost-effective' or 'capital-efficient', never describe our solutions as 'cheap'.
3. Trust & Security: Never promise absolute immunity. Use 'hardened architecture', 'defense-in-depth', and 'continuous monitoring'. Avoid words like 'unhackable', 'bulletproof', or '100% bug-free'.
4. Approved Product Names: ApexCore Cloud, ApexMesh, ApexVault.`,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: 'Infrastructure Security & Compliance Policy §9',
    description: 'Mandatory compliance rules for security representations and SLA claims.',
    source_type: 'compliance_policy',
    version: 1,
    status: 'approved',
    extracted_text: `# Security & SLA Claims Policy
All claims regarding system resilience must reference published SLA documentation.
- The standard SLA is 99.99% availability for enterprise tier.
- Claims of 100% uptime are strictly prohibited.
- Never assert that client data cannot be compromised under any scenario.`,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 3,
    title: 'Environmental Sustainability & ESG Verification Report',
    description: 'Approved empirical data for green and energy conservation marketing.',
    source_type: 'product_spec',
    version: 1,
    status: 'approved',
    extracted_text: `# Sustainability Metrics
- Facility PUE (Power Usage Effectiveness) benchmarked at 1.18.
- Server cooling energy reduction validated at 40% via intelligent airflow control.
- Broad claims such as '100% eco-friendly' or 'zero emissions' are prohibited under FTC Green Guides without specific renewable offsets.`,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: 1,
    claim_text: 'ApexCore Cloud reduces infrastructure latency by 35% across multi-region deployments',
    category: 'performance',
    substantiation: 'Q3 2026 independent third-party benchmark report #BENCH-4481 conducted by CloudMetrics Lab.',
    source_reference: 'KB #1 §3.2',
    status: 'approved',
    confidence_requirement: 'high',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    claim_text: 'Guarantees 99.99% enterprise service availability SLA with automated failover',
    category: 'performance',
    substantiation: 'Enterprise Master Services Agreement §7.1 and SOC2 Type II audit report.',
    source_reference: 'KB #2 §1.1',
    status: 'approved',
    confidence_requirement: 'high',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 3,
    claim_text: 'ApexCore reduces server cooling energy by 40% through intelligent airflow optimization',
    category: 'sustainability',
    substantiation: 'Certified Green Data Center Audit report #GDC-2025-09.',
    source_reference: 'KB #3 §2.1',
    status: 'approved',
    confidence_requirement: 'high',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 4,
    claim_text: '100% bug-free and completely unhackable software',
    category: 'security',
    substantiation: 'Prohibited under FTC and legal compliance regulations. Absolute security claims cannot be substantiated.',
    source_reference: 'KB #2 §1.3',
    status: 'prohibited',
    confidence_requirement: 'high',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 5,
    claim_text: 'ApexCore is 10 times cheaper than all competitor platforms',
    category: 'financial',
    substantiation: 'Prohibited: Pricing comparisons depend on consumption tier and configurations.',
    source_reference: 'Brand Guide 2026 §2',
    status: 'prohibited',
    confidence_requirement: 'high',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const INITIAL_TERMS: Terminology[] = [
  {
    id: 1,
    term: 'unhackable',
    term_type: 'prohibited',
    preferred_alternative: 'defense-in-depth security architecture',
    context_rule: 'Absolute security claims violate FTC and ISO guidelines.',
    severity: 'critical',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    term: '100% bug-free',
    term_type: 'prohibited',
    preferred_alternative: 'rigorously tested and validated',
    context_rule: 'No commercial software is mathematically guaranteed bug-free.',
    severity: 'critical',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    term: 'cheap',
    term_type: 'prohibited',
    preferred_alternative: 'cost-effective',
    context_rule: 'Devalues premium brand equity and implies substandard engineering.',
    severity: 'high',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 4,
    term: 'miracle solution',
    term_type: 'prohibited',
    preferred_alternative: 'engineered platform',
    context_rule: 'Hyperbolic marketing hype.',
    severity: 'high',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 5,
    term: 'cost-effective',
    term_type: 'preferred',
    preferred_alternative: undefined,
    context_rule: 'Recommended descriptor for pricing and TCO value propositions.',
    severity: 'low',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 6,
    term: 'CloudTitan',
    term_type: 'competitor',
    preferred_alternative: 'leading legacy cloud providers',
    context_rule: 'Direct competitor naming requires legal disclaimer and verified benchmark.',
    severity: 'medium',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

function runDeterministicAnalysis(content: string, terms: Terminology[], claims: Claim[]): AnalysisResult {
  const findings: any[] = [];

  // 1. Terminology scanning
  for (const item of terms) {
    if (!item.term.trim()) continue;
    const regex = new RegExp(`\\b${item.term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matched_snippet = match[0];
      if (item.term_type === 'prohibited') {
        findings.push({
          category: 'prohibited_term',
          severity: item.severity || 'high',
          matched_text: matched_snippet,
          start_index: match.index,
          end_index: match.index + matched_snippet.length,
          message: `Prohibited term detected: '${matched_snippet}'.`,
          suggestion: item.preferred_alternative ? `Replace with approved alternative: '${item.preferred_alternative}'` : 'Remove or replace with neutral phrasing.',
          evidence: item.context_rule || 'Brand Terminology Policy: Strictly forbidden across external communications.',
          status: 'open'
        });
      } else if (item.term_type === 'competitor') {
        findings.push({
          category: 'competitor_mention',
          severity: item.severity || 'medium',
          matched_text: matched_snippet,
          start_index: match.index,
          end_index: match.index + matched_snippet.length,
          message: `Direct competitor mention: '${matched_snippet}'.`,
          suggestion: item.preferred_alternative || 'Obtain legal clearance before publishing direct competitor comparisons.',
          evidence: item.context_rule || 'Trademark and Comparative Advertising Guidelines.',
          status: 'open'
        });
      }
    }
  }

  // 2. Patterns
  const quantRegex = /\b(\d+(?:\.\d+)?%|\d+x|\d+\s*(?:times|percent|fold))\s+(?:faster|more efficient|savings|cheaper|reduction|increase|boost|better|uptime|growth|lower latency)\b/gi;
  let qm: RegExpExecArray | null;
  while ((qm = quantRegex.exec(content)) !== null) {
    const isSubstantiated = claims.some(c => c.status === 'approved' && c.claim_text.toLowerCase().includes(qm![0].toLowerCase()));
    if (!isSubstantiated) {
      findings.push({
        category: 'unsubstantiated_metric',
        severity: 'high' as const,
        matched_text: qm[0],
        start_index: qm.index,
        end_index: qm.index + qm[0].length,
        message: `Unsubstantiated metric detected: '${qm[0]}'.`,
        suggestion: 'Register the metric in the Claims Register or cite the specific benchmark study.',
        evidence: 'Brand Compliance Policy: All comparative and quantitative metrics must be formally recorded in the Claims Register with supporting empirical documentation.',
        status: 'open' as const
      });
    }
  }

  const superRegex = /\b(#1|number one|market leader|the best|fastest in the world|unrivaled|unmatched|the most powerful)\b/gi;
  let sm: RegExpExecArray | null;
  while ((sm = superRegex.exec(content)) !== null) {
    findings.push({
      category: 'superlative_claim',
      severity: 'high' as const,
      matched_text: sm[0],
      start_index: sm.index,
      end_index: sm.index + sm[0].length,
      message: `Unsubstantiated superlative claim: '${sm[0]}'.`,
      suggestion: 'Provide third-party market share verification or qualify with specific market criteria.',
      evidence: 'FTC Advertising Substantiation Doctrine & Brand Policy §4.1.',
      status: 'open' as const
    });
  }

  const absRegex = /\b(100%|guarantee[sd]?|never fails?|zero risk|unhackable|completely secure|impossible to breach)\b/gi;
  let am: RegExpExecArray | null;
  while ((am = absRegex.exec(content)) !== null) {
    const isAlready = findings.some(f => f.start_index <= am!.index && f.end_index >= am!.index + am![0].length);
    if (!isAlready) {
      findings.push({
        category: 'absolute_claim',
        severity: 'critical' as const,
        matched_text: am[0],
        start_index: am.index,
        end_index: am.index + am[0].length,
        message: `Absolute guarantee detected: '${am[0]}'.`,
        suggestion: 'Avoid absolute guarantees. Replace with probabilistic assurances (e.g. high reliability).',
        evidence: 'Product Compliance Standard: No technical product may claim absolute zero risk or 100% uptime.',
        status: 'open' as const
      });
    }
  }

  findings.sort((a, b) => a.start_index - b.start_index);

  const critical_count = findings.filter(f => f.severity === 'critical').length;
  const high_count = findings.filter(f => f.severity === 'high').length;
  const medium_count = findings.filter(f => f.severity === 'medium').length;
  const low_count = findings.filter(f => f.severity === 'low').length;

  const deductions = (critical_count * 25.0) + (high_count * 12.0) + (medium_count * 6.0) + (low_count * 2.0);
  const compliance_score = Math.max(0.0, Math.min(100.0, Math.round((100.0 - deductions) * 10) / 10));

  return {
    compliance_score,
    total_findings: findings.length,
    critical_count,
    high_count,
    medium_count,
    low_count,
    findings
  };
}

function getLocalStore() {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      // fallback
    }
  }

  // Generate initial documents
  const content1 = "Discover why ApexCore Cloud is the #1 platform in the world for hybrid compute. Unlike CloudTitan, our cheap pricing model delivers 50% faster database queries with zero risk. Our engineers guarantee 100% uptime with completely unhackable container isolation.";
  const analysis1 = runDeterministicAnalysis(content1, INITIAL_TERMS, INITIAL_CLAIMS);

  const content2_v2 = "ApexCore Technologies today published its Q3 environmental audit, demonstrating that ApexCore reduces server cooling energy by 40% through intelligent airflow optimization. Our cost-effective green facilities deliver enterprise-grade sustainability.";
  const analysis2_v2 = runDeterministicAnalysis(content2_v2, INITIAL_TERMS, INITIAL_CLAIMS);

  const content3 = "ApexVault implements an unhackable hardware root of trust with 100% bug-free firmware. Clients experience zero risk during cryptographic key rollover.";
  const analysis3 = runDeterministicAnalysis(content3, INITIAL_TERMS, INITIAL_CLAIMS);

  const content4 = "Experience the next evolution in distributed systems with ApexMesh. Our cost-effective network mesh delivers enterprise-grade reliability and low latency.";
  const analysis4 = runDeterministicAnalysis(content4, INITIAL_TERMS, INITIAL_CLAIMS);

  const initialDocs: DocumentDetail[] = [
    {
      id: 1,
      title: 'Q4 Hybrid Cloud Enterprise Campaign',
      document_type: 'marketing_copy',
      status: 'in_review',
      current_version: 1,
      compliance_score: analysis1.compliance_score,
      critical_findings_count: analysis1.critical_count,
      total_findings_count: analysis1.total_findings,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      revisions: [
        {
          id: 1,
          document_id: 1,
          version: 1,
          content: content1,
          created_by: 'Sarah Chen (Copywriter)',
          notes: 'Initial campaign pitch for enterprise review',
          compliance_score: analysis1.compliance_score,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          findings: analysis1.findings.map((f, i) => ({ ...f, id: i + 1, document_revision_id: 1, status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed', created_at: new Date().toISOString() }))
        }
      ],
      decisions: [],
      comments: []
    },
    {
      id: 2,
      title: 'Data Center Sustainability Press Release',
      document_type: 'press_release',
      status: 'approved',
      current_version: 2,
      compliance_score: analysis2_v2.compliance_score,
      critical_findings_count: analysis2_v2.critical_count,
      total_findings_count: analysis2_v2.total_findings,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      revisions: [
        {
          id: 3,
          document_id: 2,
          version: 2,
          content: content2_v2,
          created_by: 'David Ross (PR Specialist)',
          notes: 'Corrected greenwashing claims and linked to approved claims register entry #3',
          compliance_score: analysis2_v2.compliance_score,
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          findings: analysis2_v2.findings.map((f, i) => ({ ...f, id: i + 20, document_revision_id: 3, status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed', created_at: new Date().toISOString() }))
        }
      ],
      decisions: [
        {
          id: 1,
          document_id: 2,
          document_revision_id: 3,
          reviewer_name: 'Elena Vance (Chief Compliance Officer)',
          decision: 'approved',
          rationale: 'All environmental metrics now accurately reflect certified audit GDC-2025-09 and comply with FTC Green Guides.',
          created_at: new Date(Date.now() - 43200000).toISOString()
        }
      ],
      comments: [
        {
          id: 1,
          document_id: 2,
          author: 'Elena Vance',
          content: "Great job swapping out the broad 'zero emissions' phrase for our verified 40% airflow optimization metric.",
          created_at: new Date(Date.now() - 43200000).toISOString()
        }
      ]
    },
    {
      id: 3,
      title: 'NextGen Security Architecture Whitepaper',
      document_type: 'whitepaper',
      status: 'changes_requested',
      current_version: 1,
      compliance_score: analysis3.compliance_score,
      critical_findings_count: analysis3.critical_count,
      total_findings_count: analysis3.total_findings,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      revisions: [
        {
          id: 4,
          document_id: 3,
          version: 1,
          content: content3,
          created_by: 'Marcus Vance (Solutions Architect)',
          notes: 'Submitted for security marketing review',
          compliance_score: analysis3.compliance_score,
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          findings: analysis3.findings.map((f, i) => ({ ...f, id: i + 30, document_revision_id: 4, status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed', created_at: new Date().toISOString() }))
        }
      ],
      decisions: [
        {
          id: 2,
          document_id: 3,
          document_revision_id: 4,
          reviewer_name: 'Alicia Gomez (Head of Legal)',
          decision: 'changes_requested',
          rationale: "Critical violations: Must remove 'unhackable', '100% bug-free', and 'zero risk'. Please rewrite using defense-in-depth principles.",
          created_at: new Date(Date.now() - 21600000).toISOString()
        }
      ],
      comments: []
    },
    {
      id: 4,
      title: 'ApexMesh Product Launch Landing Page',
      document_type: 'landing_page',
      status: 'draft',
      current_version: 1,
      compliance_score: analysis4.compliance_score,
      critical_findings_count: analysis4.critical_count,
      total_findings_count: analysis4.total_findings,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      revisions: [
        {
          id: 5,
          document_id: 4,
          version: 1,
          content: content4,
          created_by: 'Alex Taylor (Growth Marketing)',
          notes: 'Initial draft preview',
          compliance_score: analysis4.compliance_score,
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          findings: analysis4.findings.map((f, i) => ({ ...f, id: i + 40, document_revision_id: 5, status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed', created_at: new Date().toISOString() }))
        }
      ],
      decisions: [],
      comments: []
    }
  ];

  const initialAudits: AuditLog[] = [
    {
      id: 1,
      action: 'SYSTEM_INITIALIZED',
      entity_type: 'system',
      entity_id: '1',
      performed_by: 'SetupService',
      details: '{"message": "BrandGuard knowledge system loaded"}',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 2,
      action: 'KB_SOURCE_CREATED',
      entity_type: 'knowledge_base',
      entity_id: '1',
      performed_by: 'ComplianceLead',
      details: '{"title": "ApexCore Brand Identity & Voice Guide 2026"}',
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 3,
      action: 'CLAIM_CREATED',
      entity_type: 'claim',
      entity_id: '1',
      performed_by: 'ComplianceLead',
      details: '{"claim": "ApexCore Cloud reduces infrastructure latency by 35% across multi-region deployments"}',
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 4,
      action: 'DOCUMENT_CREATED',
      entity_type: 'document',
      entity_id: '1',
      performed_by: 'Sarah Chen',
      details: '{"title": "Q4 Hybrid Cloud Enterprise Campaign"}',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 5,
      action: 'REVIEW_DECISION_CHANGES_REQUESTED',
      entity_type: 'review',
      entity_id: '2',
      performed_by: 'Alicia Gomez',
      details: '{"document_title": "NextGen Security Architecture Whitepaper"}',
      timestamp: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 6,
      action: 'REVIEW_DECISION_APPROVED',
      entity_type: 'review',
      entity_id: '1',
      performed_by: 'Elena Vance',
      details: '{"document_title": "Data Center Sustainability Press Release"}',
      timestamp: new Date(Date.now() - 43200000).toISOString()
    }
  ];

  const store = {
    kb: INITIAL_KB,
    claims: INITIAL_CLAIMS,
    terms: INITIAL_TERMS,
    documents: initialDocs,
    audits: initialAudits
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  return store;
}

function saveLocalStore(store: any) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

// --- Universal API Client (Backend First with Seamless Offline Fallback) ---

export const api = {
  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const docs: DocumentDetail[] = store.documents;
    const total_docs = docs.length;
    const approved_docs = docs.filter(d => d.status === 'approved').length;
    const in_review_docs = docs.filter(d => d.status === 'in_review').length;
    const changes_requested_docs = docs.filter(d => d.status === 'changes_requested').length;
    const draft_docs = docs.filter(d => d.status === 'draft').length;

    const avg_compliance_score = docs.length > 0
      ? Math.round((docs.reduce((acc, d) => acc + (d.compliance_score || 100), 0) / docs.length) * 10) / 10
      : 100.0;

    let critical = 0, high = 0, medium = 0, low = 0;
    const violationMap: Record<string, { count: number; category: string }> = {};

    for (const d of docs) {
      const latest = d.revisions[d.revisions.length - 1];
      if (latest && latest.findings) {
        for (const f of latest.findings) {
          if (f.severity === 'critical') critical++;
          else if (f.severity === 'high') high++;
          else if (f.severity === 'medium') medium++;
          else low++;

          if (!violationMap[f.matched_text]) {
            violationMap[f.matched_text] = { count: 0, category: f.category };
          }
          violationMap[f.matched_text].count++;
        }
      }
    }

    const top_flagged_violations = Object.entries(violationMap)
      .map(([text, info]) => ({ matched_text: text, category: info.category, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const allDecisions = docs.flatMap(d => d.decisions).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    const recentAudits = store.audits.slice(-6).reverse();

    return {
      total_documents: total_docs,
      approved_documents: approved_docs,
      in_review_documents: in_review_docs,
      changes_requested_documents: changes_requested_docs,
      draft_documents: draft_docs,
      average_compliance_score: avg_compliance_score,
      findings_by_severity: { critical, high, medium, low },
      claims_stats: {
        total: store.claims.length,
        approved: store.claims.filter((c: any) => c.status === 'approved').length,
        prohibited: store.claims.filter((c: any) => c.status === 'prohibited').length
      },
      terminology_stats: {
        prohibited: store.terms.filter((t: any) => t.term_type === 'prohibited').length,
        preferred: store.terms.filter((t: any) => t.term_type === 'preferred').length
      },
      top_flagged_violations,
      recent_decisions: allDecisions,
      recent_audits: recentAudits
    };
  },

  // Documents
  getDocuments: async (params?: { status?: string; document_type?: string; search?: string }): Promise<DocumentItem[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.document_type) query.append('document_type', params.document_type);
      if (params?.search) query.append('search', params.search);
      const res = await fetch(`${BASE_URL}/documents/?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    let docs: DocumentDetail[] = store.documents;
    if (params?.status) {
      docs = docs.filter(d => d.status === params.status);
    }
    if (params?.document_type) {
      docs = docs.filter(d => d.document_type === params.document_type);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q));
    }

    return docs.map(d => ({
      id: d.id,
      title: d.title,
      document_type: d.document_type,
      status: d.status,
      current_version: d.current_version,
      compliance_score: d.compliance_score,
      critical_findings_count: d.critical_findings_count,
      total_findings_count: d.total_findings_count,
      created_at: d.created_at,
      updated_at: d.updated_at
    }));
  },

  getDocument: async (id: number): Promise<DocumentDetail> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const doc = store.documents.find((d: any) => d.id === id);
    if (!doc) throw new Error('Document not found');
    return doc;
  },

  createDocument: async (data: {
    title: string;
    document_type: string;
    content: string;
    created_by: string;
    notes?: string;
  }): Promise<DocumentDetail> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const analysis = runDeterministicAnalysis(data.content, store.terms, store.claims);
    const newId = store.documents.length > 0 ? Math.max(...store.documents.map((d: any) => d.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newRev: DocumentRevision = {
      id: Date.now(),
      document_id: newId,
      version: 1,
      content: data.content,
      created_by: data.created_by,
      notes: data.notes || 'Initial version',
      compliance_score: analysis.compliance_score,
      created_at: now,
      findings: analysis.findings.map((f, i) => ({
        ...f,
        id: Date.now() + i,
        document_revision_id: Date.now(),
        status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed',
        created_at: now
      }))
    };

    const newDoc: DocumentDetail = {
      id: newId,
      title: data.title,
      document_type: data.document_type,
      status: 'draft',
      current_version: 1,
      compliance_score: analysis.compliance_score,
      critical_findings_count: analysis.critical_count,
      total_findings_count: analysis.total_findings,
      created_at: now,
      updated_at: now,
      revisions: [newRev],
      decisions: [],
      comments: []
    };

    store.documents.unshift(newDoc);
    store.audits.push({
      id: Date.now(),
      action: 'DOCUMENT_CREATED',
      entity_type: 'document',
      entity_id: String(newId),
      performed_by: data.created_by,
      details: JSON.stringify({ title: data.title, compliance_score: analysis.compliance_score }),
      timestamp: now
    });

    saveLocalStore(store);
    return newDoc;
  },

  createRevision: async (documentId: number, data: {
    content: string;
    created_by: string;
    notes?: string;
  }): Promise<DocumentRevision> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/${documentId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const doc = store.documents.find((d: any) => d.id === documentId);
    if (!doc) throw new Error('Document not found');

    const analysis = runDeterministicAnalysis(data.content, store.terms, store.claims);
    const newVersion = doc.current_version + 1;
    const now = new Date().toISOString();

    const newRev: DocumentRevision = {
      id: Date.now(),
      document_id: documentId,
      version: newVersion,
      content: data.content,
      created_by: data.created_by,
      notes: data.notes || `Revision ${newVersion}`,
      compliance_score: analysis.compliance_score,
      created_at: now,
      findings: analysis.findings.map((f, i) => ({
        ...f,
        id: Date.now() + i,
        document_revision_id: Date.now(),
        status: (f.status || 'open') as 'open' | 'accepted' | 'dismissed',
        created_at: now
      }))
    };

    doc.current_version = newVersion;
    doc.compliance_score = analysis.compliance_score;
    doc.critical_findings_count = analysis.critical_count;
    doc.total_findings_count = analysis.total_findings;
    doc.updated_at = now;
    if (doc.status === 'changes_requested') doc.status = 'in_review';
    doc.revisions.unshift(newRev);

    store.audits.push({
      id: Date.now(),
      action: 'REVISION_CREATED',
      entity_type: 'document',
      entity_id: String(documentId),
      performed_by: data.created_by,
      details: JSON.stringify({ version: newVersion, compliance_score: analysis.compliance_score }),
      timestamp: now
    });

    saveLocalStore(store);
    return newRev;
  },

  analyzeDraft: async (content: string): Promise<AnalysisResult> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/analyze-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    return runDeterministicAnalysis(content, store.terms, store.claims);
  },

  updateFindingStatus: async (findingId: number, status: 'open' | 'accepted' | 'dismissed'): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/findings/${findingId}/status?status=${status}`, {
        method: 'PUT',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    for (const d of store.documents) {
      for (const r of d.revisions) {
        const finding = r.findings?.find((f: any) => f.id === findingId);
        if (finding) {
          finding.status = status;
          saveLocalStore(store);
          return { message: 'Updated' };
        }
      }
    }
    return { message: 'Updated' };
  },

  deleteDocument: async (id: number): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    store.documents = store.documents.filter((d: any) => d.id !== id);
    saveLocalStore(store);
    return { message: 'Deleted' };
  },

  // Reviews
  getApprovalQueue: async (): Promise<DocumentItem[]> => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/queue`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    return store.documents
      .filter((d: any) => d.status === 'in_review' || d.status === 'changes_requested')
      .map((d: any) => ({
        id: d.id,
        title: d.title,
        document_type: d.document_type,
        status: d.status,
        current_version: d.current_version,
        compliance_score: d.compliance_score,
        critical_findings_count: d.critical_findings_count,
        total_findings_count: d.total_findings_count,
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
  },

  submitReviewDecision: async (documentId: number, data: {
    reviewer_name: string;
    decision: 'approved' | 'rejected' | 'changes_requested';
    rationale: string;
    document_revision_id?: number;
  }): Promise<ReviewDecision> => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/${documentId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const doc = store.documents.find((d: any) => d.id === documentId);
    if (!doc) throw new Error('Document not found');

    const now = new Date().toISOString();
    doc.status = data.decision;
    const newDec: ReviewDecision = {
      id: Date.now(),
      document_id: documentId,
      document_revision_id: data.document_revision_id,
      reviewer_name: data.reviewer_name,
      decision: data.decision,
      rationale: data.rationale,
      created_at: now
    };
    doc.decisions.unshift(newDec);
    doc.updated_at = now;

    store.audits.push({
      id: Date.now(),
      action: `REVIEW_DECISION_${data.decision.toUpperCase()}`,
      entity_type: 'review',
      entity_id: String(newDec.id),
      performed_by: data.reviewer_name,
      details: JSON.stringify({ document_title: doc.title, decision: data.decision }),
      timestamp: now
    });

    saveLocalStore(store);
    return newDec;
  },

  addComment: async (documentId: number, data: { author: string; content: string }): Promise<Comment> => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const doc = store.documents.find((d: any) => d.id === documentId);
    if (!doc) throw new Error('Document not found');

    const newComment: Comment = {
      id: Date.now(),
      document_id: documentId,
      author: data.author,
      content: data.content,
      created_at: new Date().toISOString()
    };
    doc.comments.push(newComment);
    saveLocalStore(store);
    return newComment;
  },

  // Knowledge Base
  getKBSources: async (): Promise<KnowledgeBaseSource[]> => {
    try {
      const res = await fetch(`${BASE_URL}/knowledge-base/`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return getLocalStore().kb;
  },

  createKBSource: async (data: {
    title: string;
    description?: string;
    source_type: string;
    version: number;
    status: string;
    extracted_text: string;
  }): Promise<KnowledgeBaseSource> => {
    try {
      const res = await fetch(`${BASE_URL}/knowledge-base/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const newSource: KnowledgeBaseSource = {
      id: Date.now(),
      ...data,
      status: data.status as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.kb.unshift(newSource);
    saveLocalStore(store);
    return newSource;
  },

  uploadKBSource: async (formData: FormData): Promise<KnowledgeBaseSource> => {
    try {
      const res = await fetch(`${BASE_URL}/knowledge-base/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const title = formData.get('title') as string || 'Uploaded Document';
    const description = formData.get('description') as string || '';
    const file = formData.get('file') as File;
    const store = getLocalStore();

    const newSource: KnowledgeBaseSource = {
      id: Date.now(),
      title,
      description,
      source_type: 'compliance_policy',
      version: 1,
      status: 'approved',
      extracted_text: file ? `Content extracted from ${file.name}` : 'Document uploaded.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.kb.unshift(newSource);
    saveLocalStore(store);
    return newSource;
  },

  deleteKBSource: async (id: number): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    store.kb = store.kb.filter((k: any) => k.id !== id);
    saveLocalStore(store);
    return { message: 'Deleted' };
  },

  // Claims
  getClaims: async (params?: { category?: string; status?: string; search?: string }): Promise<Claim[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const res = await fetch(`${BASE_URL}/claims/?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    let claims = store.claims;
    if (params?.category) claims = claims.filter((c: any) => c.category === params.category);
    if (params?.status) claims = claims.filter((c: any) => c.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      claims = claims.filter((c: any) => c.claim_text.toLowerCase().includes(q) || c.substantiation.toLowerCase().includes(q));
    }
    return claims;
  },

  createClaim: async (data: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<Claim> => {
    try {
      const res = await fetch(`${BASE_URL}/claims/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const newClaim: Claim = {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.claims.unshift(newClaim);
    saveLocalStore(store);
    return newClaim;
  },

  deleteClaim: async (id: number): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/claims/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    store.claims = store.claims.filter((c: any) => c.id !== id);
    saveLocalStore(store);
    return { message: 'Deleted' };
  },

  // Terminology
  getTerminology: async (params?: { term_type?: string; severity?: string; search?: string }): Promise<Terminology[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.term_type) query.append('term_type', params.term_type);
      if (params?.severity) query.append('severity', params.severity);
      if (params?.search) query.append('search', params.search);
      const res = await fetch(`${BASE_URL}/terminology/?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    let terms = store.terms;
    if (params?.term_type) terms = terms.filter((t: any) => t.term_type === params.term_type);
    if (params?.severity) terms = terms.filter((t: any) => t.severity === params.severity);
    if (params?.search) {
      const q = params.search.toLowerCase();
      terms = terms.filter((t: any) => t.term.toLowerCase().includes(q));
    }
    return terms;
  },

  createTerminology: async (data: Omit<Terminology, 'id' | 'created_at' | 'updated_at'>): Promise<Terminology> => {
    try {
      const res = await fetch(`${BASE_URL}/terminology/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    const newTerm: Terminology = {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.terms.unshift(newTerm);
    saveLocalStore(store);
    return newTerm;
  },

  deleteTerminology: async (id: number): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/terminology/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    store.terms = store.terms.filter((t: any) => t.id !== id);
    saveLocalStore(store);
    return { message: 'Deleted' };
  },

  // Audit Logs
  getAuditLogs: async (params?: { action?: string; entity_type?: string; limit?: number; offset?: number }): Promise<AuditLog[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.action) query.append('action', params.action);
      if (params?.entity_type) query.append('entity_type', params.entity_type);
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.offset) query.append('offset', params.offset.toString());
      const res = await fetch(`${BASE_URL}/audit/?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const store = getLocalStore();
    let logs = store.audits.slice().reverse();
    if (params?.action) logs = logs.filter((l: any) => l.action.toLowerCase().includes(params.action!.toLowerCase()));
    if (params?.entity_type) logs = logs.filter((l: any) => l.entity_type === params.entity_type);
    return logs;
  },

  // Seed Data
  seedDemoData: async (force: boolean = true): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/seed/?force=${force}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    getLocalStore();
    return { message: 'Seeded' };
  }
};

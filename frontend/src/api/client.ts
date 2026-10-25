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
  AnalysisResult
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetch(`${BASE_URL}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  // Documents
  getDocuments: async (params?: { status?: string; document_type?: string; search?: string }): Promise<DocumentItem[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.document_type) query.append('document_type', params.document_type);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/documents/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  getDocument: async (id: number): Promise<DocumentDetail> => {
    const res = await fetch(`${BASE_URL}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  createDocument: async (data: {
    title: string;
    document_type: string;
    content: string;
    created_by: string;
    notes?: string;
  }): Promise<DocumentDetail> => {
    const res = await fetch(`${BASE_URL}/documents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create document');
    return res.json();
  },

  updateDocument: async (id: number, data: { title?: string; document_type?: string; status?: string }): Promise<DocumentDetail> => {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update document');
    return res.json();
  },

  createRevision: async (documentId: number, data: {
    content: string;
    created_by: string;
    notes?: string;
  }): Promise<DocumentRevision> => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create revision');
    return res.json();
  },

  analyzeDraft: async (content: string): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/documents/analyze-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to analyze draft');
    return res.json();
  },

  updateFindingStatus: async (findingId: number, status: 'open' | 'accepted' | 'dismissed'): Promise<any> => {
    const res = await fetch(`${BASE_URL}/documents/findings/${findingId}/status?status=${status}`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to update finding status');
    return res.json();
  },

  deleteDocument: async (id: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  // Reviews
  getApprovalQueue: async (): Promise<DocumentItem[]> => {
    const res = await fetch(`${BASE_URL}/reviews/queue`);
    if (!res.ok) throw new Error('Failed to fetch approval queue');
    return res.json();
  },

  submitReviewDecision: async (documentId: number, data: {
    reviewer_name: string;
    decision: 'approved' | 'rejected' | 'changes_requested';
    rationale: string;
    document_revision_id?: number;
  }): Promise<ReviewDecision> => {
    const res = await fetch(`${BASE_URL}/reviews/${documentId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit review decision');
    return res.json();
  },

  addComment: async (documentId: number, data: { author: string; content: string }): Promise<Comment> => {
    const res = await fetch(`${BASE_URL}/reviews/${documentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  // Knowledge Base
  getKBSources: async (): Promise<KnowledgeBaseSource[]> => {
    const res = await fetch(`${BASE_URL}/knowledge-base/`);
    if (!res.ok) throw new Error('Failed to fetch KB sources');
    return res.json();
  },

  createKBSource: async (data: {
    title: string;
    description?: string;
    source_type: string;
    version: number;
    status: string;
    extracted_text: string;
  }): Promise<KnowledgeBaseSource> => {
    const res = await fetch(`${BASE_URL}/knowledge-base/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create KB source');
    return res.json();
  },

  uploadKBSource: async (formData: FormData): Promise<KnowledgeBaseSource> => {
    const res = await fetch(`${BASE_URL}/knowledge-base/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload KB source');
    return res.json();
  },

  deleteKBSource: async (id: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/knowledge-base/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete KB source');
    return res.json();
  },

  // Claims
  getClaims: async (params?: { category?: string; status?: string; search?: string }): Promise<Claim[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/claims/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  },

  createClaim: async (data: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<Claim> => {
    const res = await fetch(`${BASE_URL}/claims/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create claim');
    return res.json();
  },

  updateClaim: async (id: number, data: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<Claim> => {
    const res = await fetch(`${BASE_URL}/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update claim');
    return res.json();
  },

  deleteClaim: async (id: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/claims/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete claim');
    return res.json();
  },

  // Terminology
  getTerminology: async (params?: { term_type?: string; severity?: string; search?: string }): Promise<Terminology[]> => {
    const query = new URLSearchParams();
    if (params?.term_type) query.append('term_type', params.term_type);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/terminology/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch terminology');
    return res.json();
  },

  createTerminology: async (data: Omit<Terminology, 'id' | 'created_at' | 'updated_at'>): Promise<Terminology> => {
    const res = await fetch(`${BASE_URL}/terminology/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create terminology');
    return res.json();
  },

  updateTerminology: async (id: number, data: Omit<Terminology, 'id' | 'created_at' | 'updated_at'>): Promise<Terminology> => {
    const res = await fetch(`${BASE_URL}/terminology/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update terminology');
    return res.json();
  },

  deleteTerminology: async (id: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/terminology/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete terminology');
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (params?: { action?: string; entity_type?: string; performed_by?: string; limit?: number; offset?: number }): Promise<AuditLog[]> => {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.entity_type) query.append('entity_type', params.entity_type);
    if (params?.performed_by) query.append('performed_by', params.performed_by);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const res = await fetch(`${BASE_URL}/audit/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Seed Data
  seedDemoData: async (force: boolean = true): Promise<any> => {
    const res = await fetch(`${BASE_URL}/seed/?force=${force}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to seed demo data');
    return res.json();
  }
};

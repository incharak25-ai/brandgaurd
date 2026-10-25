import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  History,
  MessageSquare,
  Sparkles,
  Send,
  Save,
  Check,
  X,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';
import { api } from '../api/client';
import { DocumentDetail, DocumentRevision, Finding } from '../types';

interface DocumentDetailViewProps {
  documentId: number;
  onBack: () => void;
}

export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({ documentId, onBack }) => {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'analysis' | 'review' | 'revisions' | 'comments'>('analysis');
  const [loading, setLoading] = useState(true);

  // Editing & Revision State
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [authorName, setAuthorName] = useState('Marketing Copywriter');
  const [isSavingRevision, setIsSavingRevision] = useState(false);

  // Review Form State
  const [reviewerName, setReviewerName] = useState('Elena Vance (Compliance Officer)');
  const [decisionType, setDecisionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');
  const [reviewRationale, setReviewRationale] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState('Reviewer');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Notification / Alert
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const data = await api.getDocument(documentId);
      setDoc(data);
      setSelectedVersion(data.current_version);
      
      const currentRev = data.revisions.find((r) => r.version === data.current_version);
      if (currentRev) {
        setEditableContent(currentRev.content);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const activeRevision: DocumentRevision | undefined = doc?.revisions.find(
    (r) => r.version === selectedVersion
  );

  useEffect(() => {
    if (activeRevision) {
      setEditableContent(activeRevision.content);
    }
  }, [selectedVersion]);

  // Show temporary toast notification
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // One-click apply finding suggestion
  const handleApplySuggestion = (finding: Finding) => {
    if (!finding.suggestion) return;
    // Extract replacement text if formatted like "Replace with approved alternative: 'xyz'"
    let replacement = finding.suggestion;
    const match = finding.suggestion.match(/'([^']+)'/);
    if (match) {
      replacement = match[1];
    }
    
    // Replace in editableContent
    const updated = editableContent.replace(finding.matched_text, replacement);
    setEditableContent(updated);
    setIsEditing(true);
    notify(`Applied suggestion: Replaced "${finding.matched_text}" with "${replacement}"`);
  };

  // Save as new revision
  const handleSaveRevision = async () => {
    if (!doc) return;
    try {
      setIsSavingRevision(true);
      const newRev = await api.createRevision(doc.id, {
        content: editableContent,
        created_by: authorName,
        notes: revisionNotes || `Revision ${doc.current_version + 1} incorporating compliance fixes`,
      });
      notify(`Revision v${newRev.version} created! New compliance score: ${newRev.compliance_score}%`);
      setIsEditing(false);
      setRevisionNotes('');
      await fetchDocument();
    } catch (err: any) {
      alert(err.message || 'Failed to save revision');
    } finally {
      setIsSavingRevision(false);
    }
  };

  // Submit Review Decision
  const handleSubmitDecision = async () => {
    if (!doc) return;
    if (!reviewRationale.trim()) {
      alert('Please provide a detailed compliance rationale for your decision.');
      return;
    }
    try {
      setIsSubmittingReview(true);
      await api.submitReviewDecision(doc.id, {
        reviewer_name: reviewerName,
        decision: decisionType,
        rationale: reviewRationale,
        document_revision_id: activeRevision?.id,
      });
      notify(`Review decision recorded: Document marked as ${decisionType.replace('_', ' ')}`);
      setReviewRationale('');
      await fetchDocument();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc || !commentText.trim()) return;
    try {
      setIsSubmittingComment(true);
      await api.addComment(doc.id, {
        author: commentAuthor,
        content: commentText,
      });
      setCommentText('');
      await fetchDocument();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Toggle Finding Status
  const handleToggleFindingStatus = async (findingId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'accepted' : currentStatus === 'accepted' ? 'dismissed' : 'open';
    try {
      await api.updateFindingStatus(findingId, nextStatus as any);
      await fetchDocument();
    } catch (err: any) {
      alert(err.message || 'Failed to update finding');
    }
  };

  if (loading || !doc) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const score = activeRevision?.compliance_score ?? 100;
  const scoreBadge =
    score >= 90
      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
      : score >= 70
      ? 'bg-amber-50 text-amber-700 border-amber-300'
      : 'bg-rose-50 text-rose-700 border-rose-300';

  const findings = activeRevision?.findings || [];
  const criticalFindings = findings.filter((f) => f.severity === 'critical');
  const highFindings = findings.filter((f) => f.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Back to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded">
                {doc.document_type.replace('_', ' ')}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border bg-sky-50 text-sky-700 border-sky-200">
                {doc.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{doc.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Created {new Date(doc.created_at).toLocaleDateString()} • Revision {selectedVersion} of {doc.current_version}
            </p>
          </div>
        </div>

        {/* Score & Version Picker */}
        <div className="flex items-center gap-4">
          {/* Version Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Version:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {doc.revisions.map((r) => (
                <option key={r.id} value={r.version}>
                  v{r.version} ({r.compliance_score}%) - {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </div>

          {/* Compliance Score Gauge */}
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${scoreBadge}`}>
            <ShieldCheck className="w-6 h-6" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold block">Compliance Score</span>
              <span className="text-xl font-black">{score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-white px-6 rounded-t-xl">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'analysis'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Content & Findings ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'review'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Human Review Workflow ({doc.decisions.length} Decisions)
        </button>
        <button
          onClick={() => setActiveTab('revisions')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'revisions'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Revision History ({doc.revisions.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'comments'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments & Discussion ({doc.comments.length})
        </button>
      </div>

      {/* TAB 1: Content & Findings (Split Workspace) */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Content Editor / Viewer */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900">Document Content (v{selectedVersion})</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                    isEditing
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Editing Mode' : 'Edit Content'}</span>
                </button>
              </div>
            </div>

            {/* Editor or Viewer */}
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  rows={12}
                  className="w-full p-4 text-sm font-sans text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                  placeholder="Enter or modify copy..."
                />

                <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Author / Editor</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Revision Changelog Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Replaced prohibited terms with defense-in-depth"
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditableContent(activeRevision?.content || '');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRevision}
                      disabled={isSavingRevision}
                      className="px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingRevision ? 'Running Analysis...' : `Save as Revision v${doc.current_version + 1}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                {activeRevision?.content}
              </div>
            )}

            {/* Quick Meta */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Author: <strong className="text-slate-600">{activeRevision?.created_by}</strong></span>
              <span>Notes: <strong className="text-slate-600">{activeRevision?.notes || 'None'}</strong></span>
            </div>
          </div>

          {/* Right Column: Deterministic Findings Inspector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-sky-600" />
                  Compliance Findings ({findings.length})
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {criticalFindings.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      {criticalFindings.length} Critical
                    </span>
                  )}
                  {highFindings.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {highFindings.length} High
                    </span>
                  )}
                </div>
              </div>

              {findings.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-emerald-900">100% Compliant!</p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    No prohibited terms or unsubstantiated claims detected in this revision.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {findings.map((f) => {
                    const sevBadge =
                      f.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : f.severity === 'high'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-sky-100 text-sky-800 border-sky-200';

                    return (
                      <div
                        key={f.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 shadow-xs transition space-y-2.5"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sevBadge}`}>
                            {f.severity}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 capitalize">
                            {f.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Matched Text */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Flagged Text</span>
                          <span className="font-mono font-bold text-rose-700">"{f.matched_text}"</span>
                        </div>

                        {/* Message */}
                        <p className="text-xs text-slate-700 leading-snug">{f.message}</p>

                        {/* Grounded Evidence / Policy */}
                        {f.evidence && (
                          <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] text-indigo-950">
                            <span className="font-bold block text-indigo-700 text-[10px] uppercase">Grounded Policy / Evidence</span>
                            {f.evidence}
                          </div>
                        )}

                        {/* Suggestion & One-Click Fix */}
                        {f.suggestion && (
                          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-2">
                            <div>
                              <span className="font-bold block text-emerald-800 text-[10px] uppercase">Recommended Fix</span>
                              <span className="text-emerald-950 text-[11px]">{f.suggestion}</span>
                            </div>

                            <button
                              onClick={() => handleApplySuggestion(f)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Apply Suggestion</span>
                            </button>
                          </div>
                        )}

                        {/* Status Toggle */}
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Status: <strong className="capitalize text-slate-600">{f.status}</strong></span>
                          <button
                            onClick={() => handleToggleFindingStatus(f.id, f.status)}
                            className="text-xs text-sky-600 hover:underline font-medium"
                          >
                            Mark as {f.status === 'open' ? 'Accepted' : f.status === 'accepted' ? 'Dismissed' : 'Open'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Human Review Workflow */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Review Decision Form */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Record Human Review Decision
            </h2>
            <p className="text-xs text-slate-500">
              Compliance officers, legal reviewers, and brand editors must record formal decisions with rationale.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reviewer Name & Title</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Review Decision</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionType('approved')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      decisionType === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('changes_requested')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      decisionType === 'changes_requested'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Changes Req.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('rejected')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      decisionType === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Compliance Rationale & Review Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={reviewRationale}
                  onChange={(e) => setReviewRationale(e.target.value)}
                  placeholder="Detail the grounds for approval, required edits, or citations to the Claims Register..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                onClick={handleSubmitDecision}
                disabled={isSubmittingReview}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {isSubmittingReview ? 'Submitting...' : 'Record Decision to Audit Log'}
              </button>
            </div>
          </div>

          {/* Past Review Decisions */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Recorded Decisions History ({doc.decisions.length})
            </h2>

            {doc.decisions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No formal decisions recorded yet. Submit the first review decision above.
              </div>
            ) : (
              <div className="space-y-3">
                {doc.decisions.map((dec) => {
                  const decBadge =
                    dec.decision === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : dec.decision === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <div key={dec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{dec.reviewer_name}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(dec.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${decBadge}`}>
                          {dec.decision.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 italic">
                        "{dec.rationale}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Revision History */}
      {activeTab === 'revisions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            Revision Changelog & Progression
          </h2>

          <div className="space-y-4">
            {doc.revisions.map((rev) => (
              <div
                key={rev.id}
                className={`p-5 rounded-xl border transition ${
                  rev.version === selectedVersion
                    ? 'border-sky-500 bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                      v{rev.version}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Created by {rev.created_by}</span>
                      <span className="text-[11px] text-slate-400 block">{new Date(rev.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-700">
                      Score: <strong className="text-sky-600">{rev.compliance_score}%</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedVersion(rev.version);
                        setActiveTab('analysis');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      Inspect
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2">
                  Changelog notes: <strong className="text-slate-800">{rev.notes || 'Initial version'}</strong>
                </p>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 line-clamp-2">
                  {rev.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Comments & Discussion */}
      {activeTab === 'comments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            Reviewer Discussion & Comments ({doc.comments.length})
          </h2>

          {/* Comment Thread */}
          <div className="space-y-3">
            {doc.comments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No comments posted yet.</div>
            ) : (
              doc.comments.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.author}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-700">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name / Title</label>
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Comment</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave feedback or note for the author..."
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

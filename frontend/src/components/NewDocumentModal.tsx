import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Upload,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Send
} from 'lucide-react';
import { api } from '../api/client';
import { AnalysisResult } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (documentId: number) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('marketing_copy');
  const [author, setAuthor] = useState('Marketing Copywriter');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');

  // Live Analysis State
  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  const [liveResult, setLiveResult] = useState<AnalysisResult | null>(null);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Run on-the-fly live analysis without saving
  const handleLiveAnalyze = async () => {
    if (!content.trim()) return;
    try {
      setIsAnalyzingLive(true);
      const res = await api.analyzeDraft(content);
      setLiveResult(res);
    } catch (err: any) {
      alert(err.message || 'Live analysis failed');
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  // Handle local text file reading (.txt, .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text || '');
      setLiveResult(null);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a document title and content.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.createDocument({
        title,
        document_type: documentType,
        content,
        created_by: author,
        notes: notes || 'Initial submission',
      });
      onClose();
      onCreated(created.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Document Analysis</h2>
              <p className="text-xs text-slate-400">Draft, import, and test content against BrandGuard rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Document Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Cloud Migration Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="marketing_copy">Marketing Copy</option>
                <option value="press_release">Press Release</option>
                <option value="landing_page">Landing Page</option>
                <option value="whitepaper">Whitepaper</option>
                <option value="social_post">Social Post</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Author / Submitter</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* File Upload Shortcut */}
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600 font-medium">
                {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Import content from local file (.txt, .md)'}
              </span>
            </div>
            <label className="cursor-pointer px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs">
              Choose File
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Content Body <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleLiveAnalyze}
                disabled={isAnalyzingLive || !content.trim()}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzingLive ? 'Scanning...' : 'Test Compliance Score Live'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setLiveResult(null);
              }}
              placeholder="Paste or write document copy to inspect prohibited phrases, unsubstantiated claims, and brand tone..."
              required
              className="w-full p-3.5 text-xs font-sans text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Live Preview Box */}
          {liveResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Live Deterministic Scan Results
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    liveResult.compliance_score >= 90
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : liveResult.compliance_score >= 70
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Score: {liveResult.compliance_score}%
                </span>
              </div>

              {liveResult.findings.length === 0 ? (
                <p className="text-xs text-emerald-700 font-semibold">
                  ✓ Clean content! No non-compliant terminology or unapproved claims detected.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {liveResult.findings.map((f, i) => (
                    <div key={i} className="text-xs p-2 bg-white rounded-lg border border-slate-200 flex items-start gap-2">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono font-bold text-rose-700">"{f.matched_text}"</span>: {f.message}
                        {f.suggestion && (
                          <span className="text-emerald-700 block text-[11px] font-medium mt-0.5">
                            Fix: {f.suggestion}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Changelog Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Submission Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Prepared for upcoming product announcement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Document...' : 'Submit & Create Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

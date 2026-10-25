import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { KnowledgeBaseSource } from '../types';

export const KnowledgeBaseView: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeBaseSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<KnowledgeBaseSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('brand_guidelines');
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState('approved');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await api.getKBSources();
      setSources(data);
      if (data.length > 0 && !selectedSource) {
        setSelectedSource(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', title);
        if (description) formData.append('description', description);
        formData.append('source_type', sourceType);
        formData.append('version', version.toString());
        formData.append('status', status);
        formData.append('file', selectedFile);
        await api.uploadKBSource(formData);
      } else {
        await api.createKBSource({
          title,
          description,
          source_type: sourceType,
          version,
          status,
          extracted_text: rawText,
        });
      }
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setRawText('');
      setSelectedFile(null);
      await fetchSources();
    } catch (err: any) {
      alert(err.message || 'Failed to save source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      try {
        await api.deleteKBSource(id);
        if (selectedSource?.id === id) {
          setSelectedSource(null);
        }
        await fetchSources();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.source_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base & Policy Repository</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ground truth brand guidelines, compliance policies, and regulatory documents.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </button>
      </div>

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Source List */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search policies & guidelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading repository...</div>
            ) : filteredSources.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No knowledge sources found.</div>
            ) : (
              filteredSources.map((s) => {
                const isSelected = selectedSource?.id === s.id;
                const statusBadge =
                  s.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : s.status === 'pending_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700';

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSource(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {s.source_type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          v{s.version}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusBadge}`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.title}</h3>

                    {s.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{s.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Updated {new Date(s.updated_at).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id, s.title);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Source Detail Viewer */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {selectedSource ? (
            <div>
              <div className="pb-4 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                      {selectedSource.source_type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Version {selectedSource.version}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Created {new Date(selectedSource.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedSource.title}</h2>
                {selectedSource.description && (
                  <p className="text-xs text-slate-600 italic">{selectedSource.description}</p>
                )}
              </div>

              {/* Extracted Text Content */}
              <div className="mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Ground Truth Extracted Content
                </span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[550px] overflow-y-auto">
                  {selectedSource.extracted_text || 'No text extracted.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a knowledge base source from the list to inspect its policy content.
            </div>
          )}
        </div>
      </div>

      {/* Add Knowledge Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Ground Truth Policy / Guideline</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand Identity & Voice Guide 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="brand_guidelines">Brand Guidelines</option>
                    <option value="compliance_policy">Compliance Policy</option>
                    <option value="regulatory">Regulatory Filing</option>
                    <option value="product_spec">Product Spec</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Version</label>
                  <input
                    type="number"
                    min="1"
                    value={version}
                    onChange={(e) => setVersion(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="approved">Approved</option>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of policy coverage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Upload file or enter text */}
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Policy File (.txt, .md, .pdf, .docx)
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.docx,.doc"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  BrandGuard automatically extracts text from PDFs and DOCX files.
                </p>
              </div>

              {!selectedFile && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Or Enter / Paste Policy Markdown Text
                  </label>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="# Voice & Tone Rules..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving Source...' : 'Save Knowledge Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

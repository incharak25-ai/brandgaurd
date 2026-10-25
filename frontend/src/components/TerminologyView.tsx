import React, { useState, useEffect } from 'react';
import {
  SpellCheck,
  Plus,
  Search,
  Trash2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { Terminology } from '../types';

export const TerminologyView: React.FC = () => {
  const [terms, setTerms] = useState<Terminology[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [term, setTerm] = useState('');
  const [termType, setTermType] = useState<'prohibited' | 'preferred' | 'sensitive' | 'competitor'>('prohibited');
  const [preferredAlternative, setPreferredAlternative] = useState('');
  const [contextRule, setContextRule] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const data = await api.getTerminology({
        search: search || undefined,
        term_type: typeFilter || undefined,
        severity: severityFilter || undefined,
      });
      setTerms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [search, typeFilter, severityFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createTerminology({
        term,
        term_type: termType,
        preferred_alternative: preferredAlternative || undefined,
        context_rule: contextRule || undefined,
        severity,
      });
      setIsModalOpen(false);
      setTerm('');
      setPreferredAlternative('');
      setContextRule('');
      await fetchTerms();
    } catch (err: any) {
      alert(err.message || 'Failed to create terminology rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, termStr: string) => {
    if (confirm(`Delete rule for "${termStr}"?`)) {
      try {
        await api.deleteTerminology(id);
        await fetchTerms();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'prohibited':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'preferred':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'competitor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'sensitive':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Terminology & Dictionary Rules</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enforce brand tone, eliminate prohibited jargon, and guide copywriters toward approved alternatives.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Term Rule</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search term or alternative..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option value="">All Rule Types</option>
            <option value="prohibited">Prohibited</option>
            <option value="preferred">Preferred</option>
            <option value="competitor">Competitor</option>
            <option value="sensitive">Sensitive</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Terms Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading terminology rules...</div>
        ) : terms.length === 0 ? (
          <div className="p-12 text-center">
            <SpellCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No terminology rules found</p>
            <p className="text-xs text-slate-400 mt-1">Add prohibited or preferred terms to guide content analysis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Term</th>
                  <th className="py-3 px-4 font-semibold">Rule Type</th>
                  <th className="py-3 px-4 font-semibold">Preferred Alternative</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Context / Rationale</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terms.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      "{t.term}"
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(t.term_type)}`}>
                        {t.term_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">
                      {t.preferred_alternative ? `"${t.preferred_alternative}"` : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-extrabold text-slate-600">
                      {t.severity}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      <span className="line-clamp-2 text-[11px]">{t.context_rule || '-'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(t.id, t.term)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Terminology Rule</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Term / Word <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. unhackable or cheap"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Rule Type</label>
                  <select
                    value={termType}
                    onChange={(e) => setTermType(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="prohibited">Prohibited</option>
                    <option value="preferred">Preferred</option>
                    <option value="competitor">Competitor</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Approved / Preferred Alternative
                </label>
                <input
                  type="text"
                  placeholder="e.g. defense-in-depth security architecture or cost-effective"
                  value={preferredAlternative}
                  onChange={(e) => setPreferredAlternative(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Context Rule & Legal Rationale
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this term violates brand or legal policy..."
                  value={contextRule}
                  onChange={(e) => setContextRule(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

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
                  {isSubmitting ? 'Saving Rule...' : 'Save Terminology Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

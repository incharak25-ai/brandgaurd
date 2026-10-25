import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Claim } from '../types';

export const ClaimsRegisterView: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [claimText, setClaimText] = useState('');
  const [category, setCategory] = useState('performance');
  const [substantiation, setSubstantiation] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [status, setStatus] = useState<'approved' | 'prohibited' | 'pending_review' | 'deprecated'>('approved');
  const [confidenceRequirement, setConfidenceRequirement] = useState<'high' | 'medium' | 'low'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await api.getClaims({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [search, categoryFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createClaim({
        claim_text: claimText,
        category,
        substantiation,
        source_reference: sourceReference || undefined,
        status,
        confidence_requirement: confidenceRequirement,
      });
      setIsModalOpen(false);
      setClaimText('');
      setSubstantiation('');
      setSourceReference('');
      await fetchClaims();
    } catch (err: any) {
      alert(err.message || 'Failed to create claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, text: string) => {
    if (confirm(`Delete claim "${text}"?`)) {
      try {
        await api.deleteClaim(id);
        await fetchClaims();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'prohibited':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'deprecated':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Register & Substantiation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Empirically verified marketing, performance, and legal claims with audit substantiation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Claim</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search claims or substantiation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            <option value="performance">Performance</option>
            <option value="sustainability">Sustainability</option>
            <option value="security">Security</option>
            <option value="financial">Financial</option>
            <option value="safety">Safety</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="prohibited">Prohibited</option>
            <option value="deprecated">Deprecated</option>
            <option value="pending_review">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading claims register...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No claims registered</p>
            <p className="text-xs text-slate-400 mt-1">Register verified claims with supporting empirical evidence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Claim Statement</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Empirical Substantiation</th>
                  <th className="py-3 px-4 font-semibold">Source Ref</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                      "{claim.claim_text}"
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 capitalize">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold">
                        {claim.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      <span className="line-clamp-2 text-[11px] leading-snug">{claim.substantiation}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {claim.source_reference || '-'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-semibold text-slate-500">
                      {claim.confidence_requirement}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(claim.id, claim.claim_text)}
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

      {/* Add Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Register Claim Statement</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Exact Claim Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. ApexCore Cloud reduces infrastructure latency by 35% across multi-region deployments"
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="performance">Performance</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="security">Security</option>
                    <option value="financial">Financial</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="approved">Approved</option>
                    <option value="prohibited">Prohibited</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Confidence</label>
                  <select
                    value={confidenceRequirement}
                    onChange={(e) => setConfidenceRequirement(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Empirical Substantiation & Evidence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Cite the independent study, customer benchmark, or audit report backing this claim..."
                  value={substantiation}
                  onChange={(e) => setSubstantiation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Knowledge Base / Document Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. KB #1 §3.2 or Benchmark Report #BENCH-4481"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
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
                  {isSubmitting ? 'Registering...' : 'Register Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

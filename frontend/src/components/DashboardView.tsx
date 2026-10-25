import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Shield,
  History,
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardMetrics } from '../types';

interface DashboardViewProps {
  onSelectDocument: (docId: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectDocument, onNavigateTab }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading database metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <p className="font-semibold">Failed to load dashboard metrics</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const scoreColor =
    metrics.average_compliance_score >= 85
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : metrics.average_compliance_score >= 65
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-rose-600 bg-rose-50 border-rose-200';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800">
            Brand Protection Engine
          </span>
          <h1 className="text-2xl font-bold mt-2">Compliance Governance Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time deterministic content analysis, evidence-grounded claims substantiation, and audit-ready human review workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Average Compliance</span>
            <span className="text-2xl font-extrabold text-white">{metrics.average_compliance_score}%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{metrics.total_documents}</span>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs text-sky-600 font-medium hover:text-sky-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">{metrics.draft_documents} drafts in progress</p>
        </div>

        {/* In Review Queue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Review Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-600">{metrics.in_review_documents}</span>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-xs text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
            >
              Open queue <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">{metrics.changes_requested_documents} changes requested</p>
        </div>

        {/* Approved Content */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Content</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-600">{metrics.approved_documents}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
              Ready to publish
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">100% verified compliance</p>
        </div>

        {/* Active Knowledge & Claims */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Knowledge & Rules</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {metrics.claims_stats.total + metrics.terminology_stats.prohibited + metrics.terminology_stats.preferred}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button onClick={() => onNavigateTab('claims')} className="text-indigo-600 hover:underline">Claims</button>
              <span className="text-slate-300">•</span>
              <button onClick={() => onNavigateTab('terminology')} className="text-indigo-600 hover:underline">Terms</button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {metrics.claims_stats.approved} approved claims • {metrics.terminology_stats.prohibited} prohibited terms
          </p>
        </div>
      </div>

      {/* Findings Breakdown & Top Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Active Findings by Severity
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Detected across current document revisions</p>

          <div className="space-y-3">
            {/* Critical */}
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <div>
                  <span className="text-xs font-semibold text-rose-900 block">Critical Violations</span>
                  <span className="text-[11px] text-rose-700">Prohibited claims & absolute terms</span>
                </div>
              </div>
              <span className="text-xl font-bold text-rose-700">{metrics.findings_by_severity.critical}</span>
            </div>

            {/* High */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-semibold text-amber-900 block">High Severity</span>
                  <span className="text-[11px] text-amber-700">Unsubstantiated metrics & brand rules</span>
                </div>
              </div>
              <span className="text-xl font-bold text-amber-700">{metrics.findings_by_severity.high}</span>
            </div>

            {/* Medium */}
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                <div>
                  <span className="text-xs font-semibold text-sky-900 block">Medium Severity</span>
                  <span className="text-[11px] text-sky-700">Competitors & sensitive phrases</span>
                </div>
              </div>
              <span className="text-xl font-bold text-sky-700">{metrics.findings_by_severity.medium}</span>
            </div>

            {/* Low */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-slate-600" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Low / Style Advisory</span>
                  <span className="text-[11px] text-slate-600">Preferred phrasing suggestions</span>
                </div>
              </div>
              <span className="text-xl font-bold text-slate-700">{metrics.findings_by_severity.low}</span>
            </div>
          </div>
        </div>

        {/* Top Flagged Terms */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            Top Flagged Violations
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Most frequently triggered non-compliant phrases</p>

          {metrics.top_flagged_violations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No violations recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.top_flagged_violations.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      "{item.matched_text}"
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {item.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Review Decisions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-sky-600" />
              Recent Reviewer Decisions
            </h2>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              Queue →
            </button>
          </div>

          {metrics.recent_decisions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No review decisions logged yet.</div>
          ) : (
            <div className="space-y-3">
              {metrics.recent_decisions.map((dec) => {
                const badge =
                  dec.decision === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : dec.decision === 'rejected'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200';
                return (
                  <div
                    key={dec.id}
                    onClick={() => onSelectDocument(dec.document_id)}
                    className="p-3 rounded-lg border border-slate-100 hover:border-sky-300 hover:bg-sky-50/30 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{dec.reviewer_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badge}`}>
                        {dec.decision.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">"{dec.rationale}"</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Audit Log Ticker */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Audit History Stream
          </h2>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Full Audit Log →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2">Timestamp</th>
                <th className="py-2">Action</th>
                <th className="py-2">Entity</th>
                <th className="py-2">User</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recent_audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 text-slate-500 whitespace-nowrap">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">
                      {a.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 uppercase text-[10px] font-semibold">{a.entity_type}</td>
                  <td className="py-2.5 text-slate-700 font-medium">{a.performed_by}</td>
                  <td className="py-2.5 text-slate-500 font-mono text-[11px] truncate max-w-xs">{a.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

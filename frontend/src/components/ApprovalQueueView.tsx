import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { DocumentItem } from '../types';

interface ApprovalQueueViewProps {
  onSelectDocument: (docId: number) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({ onSelectDocument }) => {
  const [queue, setQueue] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovalQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Compliance Governance
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Human Review & Approval Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Documents pending review, compliance sign-off, or revisions before production release.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <span className="text-xs text-amber-700 block font-semibold">Pending Decisions</span>
            <span className="text-xl font-bold text-amber-800">{queue.length}</span>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading approval queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Queue is clear!</p>
            <p className="text-xs text-slate-400 mt-1">No documents are currently awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((doc) => {
              const statusBadge =
                doc.status === 'in_review'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200';

              const scoreBadge =
                doc.compliance_score >= 90
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : doc.compliance_score >= 70
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-5 hover:bg-sky-50/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 uppercase font-semibold">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-500">v{doc.current_version}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-xs text-slate-400">
                      Last revised {new Date(doc.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Compliance Score */}
                    <div className={`px-3 py-1.5 rounded-xl border text-center ${scoreBadge}`}>
                      <span className="text-[10px] block font-bold uppercase">Score</span>
                      <span className="text-sm font-extrabold">{doc.compliance_score}%</span>
                    </div>

                    {/* Critical Count */}
                    {doc.critical_findings_count > 0 && (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                        <span className="text-[10px] block font-bold uppercase text-rose-700">Critical</span>
                        <span className="text-sm font-extrabold text-rose-800">{doc.critical_findings_count}</span>
                      </div>
                    )}

                    {/* Review Button */}
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <span>Review & Decide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

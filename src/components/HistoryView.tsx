import React from 'react';
import { 
  History, 
  Trash2, 
  FileText, 
  Clock, 
  Download, 
  AlertOctagon, 
  HeartPulse, 
  Calendar,
  ArrowRight
} from 'lucide-react';

interface HistoryItem {
  timestamp: string;
  symptoms: string;
  level: string;
}

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onNewAssessment: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onNewAssessment,
}) => {
  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'emergency': return 'bg-red-950 text-red-300 border-red-800';
      case 'within_24_hours': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'routine_visit': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      default: return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  const handleExportHistory = () => {
    const text = JSON.stringify(history, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TriageAI_Session_History_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Triage History & Case Records</h2>
          </div>
          <p className="text-xs text-slate-400">
            Local device records of previous symptom checks and classifications in this session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportHistory}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 text-xs px-3 py-2 rounded-xl border border-slate-700 hover:border-red-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Assessment Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run your first symptom assessment to save and compare clinical triage records.
          </p>
          <button
            onClick={onNewAssessment}
            className="mt-2 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <span>Start Symptom Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">{item.timestamp}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeClass(item.level)}`}>
                    {item.level.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {item.symptoms}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 font-mono shrink-0">
                Logged locally
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-slate-800 text-[11px] text-slate-500 max-w-5xl mx-auto px-4 text-center space-y-2">
      <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
        <span>Clinical Decision Support & Safety Notice</span>
      </div>
      <p className="leading-relaxed">
        TriageAI is an artificial intelligence triage advisory system aligned with ESI and Manchester Triage protocols. It does not provide definitive medical diagnoses or replace direct consultation with a qualified healthcare professional. If you are experiencing signs of a life-threatening emergency (such as severe chest pain, stroke symptoms, or acute respiratory arrest), call 108 / 112 / 911 immediately.
      </p>
      <p className="text-[10px] text-slate-600">
        PS-02 Specification • Red-flag Rule Engine + Safety-First Urgency Classifier
      </p>
    </footer>
  );
};

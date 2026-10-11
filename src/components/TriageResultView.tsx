import React, { useState } from 'react';
import { 
  TriageResult, 
  PatientProfile, 
  UrgencyLevel 
} from '../types';
import { MOCK_CLINICS } from '../data/mockClinics';
import { 
  AlertOctagon, 
  Clock, 
  Calendar, 
  HeartPulse, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  FileDown,
  Printer
} from 'lucide-react';

interface TriageResultViewProps {
  result: TriageResult;
  patientProfile: PatientProfile;
  onConnectDoctor: () => void;
  onOpenFeedback: () => void;
  onRestart: () => void;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  result,
  patientProfile,
  onConnectDoctor,
  onOpenFeedback,
  onRestart,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedCauseIdx, setExpandedCauseIdx] = useState<number | null>(0);
  const [selectedClinicFilter, setSelectedClinicFilter] = useState<'all' | 'emergency' | 'routine'>('all');

  // Text-To-Speech
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${result.urgencyTitle}. ${result.jargonFreeExplanation}. Recommendations: ${result.immediateInstructions.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Urgency styling based on exact flowchart specs
  const getUrgencyConfig = (level: UrgencyLevel) => {
    switch (level) {
      case 'emergency':
        return {
          title: 'EMERGENCY: Immediate Medical Care Required',
          actionText: 'Call 108 / 112 / 911 or Proceed to Nearest Emergency Room',
          badgeClass: 'bg-red-600 text-white',
          containerClass: 'bg-red-950/70 border-red-600 ring-2 ring-red-600/40 text-red-100',
          icon: AlertOctagon,
          accentColor: 'text-red-400',
          timeframe: 'Immediate (Within minutes)',
        };
      case 'within_24_hours':
        return {
          title: 'URGENT: Evaluation Within 24 Hours Needed',
          actionText: 'See a Doctor / Visit an Urgent Care Center Today',
          badgeClass: 'bg-amber-600 text-white',
          containerClass: 'bg-amber-950/60 border-amber-600 ring-1 ring-amber-500/40 text-amber-100',
          icon: Clock,
          accentColor: 'text-amber-400',
          timeframe: 'Same-Day (Within 24 Hours)',
        };
      case 'routine_visit':
        return {
          title: 'ROUTINE: Book a Clinic Appointment',
          actionText: 'Schedule a visit with Primary Care or Outpatient Clinic',
          badgeClass: 'bg-cyan-600 text-white',
          containerClass: 'bg-cyan-950/60 border-cyan-600 ring-1 ring-cyan-500/40 text-cyan-100',
          icon: Calendar,
          accentColor: 'text-cyan-400',
          timeframe: 'Within 2 - 5 Business Days',
        };
      case 'self_care':
      default:
        return {
          title: 'SELF-CARE: Safe for Home Management',
          actionText: 'Follow Home Care Tips & Monitor Symptoms',
          badgeClass: 'bg-emerald-600 text-white',
          containerClass: 'bg-emerald-950/60 border-emerald-600 ring-1 ring-emerald-500/40 text-emerald-100',
          icon: HeartPulse,
          accentColor: 'text-emerald-400',
          timeframe: 'Supportive recovery over 48 - 72 hours',
        };
    }
  };

  const config = getUrgencyConfig(result.urgencyLevel);
  const IconComponent = config.icon;

  const relevantClinics = MOCK_CLINICS.filter((c) => {
    if (selectedClinicFilter === 'emergency') return c.is24x7;
    if (selectedClinicFilter === 'routine') return !c.is24x7;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Urgency Outcome Banner */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${config.containerClass}`}>
        
        {/* Decorative corner pulse */}
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              result.urgencyLevel === 'emergency' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-white'
            }`}>
              <IconComponent className="w-8 h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${config.badgeClass}`}>
                  Urgency Tier: {result.urgencyLevel.replace(/_/g, ' ')}
                </span>
                <span className="text-xs bg-slate-900/80 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                  Confidence: {result.confidenceScore}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {result.urgencyTitle || config.title}
              </h2>
              <p className="text-sm font-semibold mt-1 opacity-90">
                {config.actionText}
              </p>
            </div>
          </div>

          {/* Quick Actions (Audio Read Aloud & Print) */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleToggleSpeech}
              className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-white px-3 py-2 rounded-xl border border-white/20 text-xs font-medium transition shadow"
              title="Listen to this explanation (Accessibility voice reader)"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-white/20 text-xs font-medium transition shadow"
              title="Print clinical summary"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Safety Downgrade Notice if Confidence < 75% or Safety Policy applied */}
        {result.safetyDowngradeApplied && (
          <div className="mt-4 bg-amber-950/80 border border-amber-500/80 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-amber-300 mr-1.5">
                Low Confidence Safety Override:
              </span>
              <span>
                {result.safetyDowngradeReason ||
                  'Because borderline ambiguity was detected (confidence below 75%), our clinical decision engine automatically escalated you to a safer care tier.'}
              </span>
            </div>
          </div>
        )}

        {/* Red Flag Trigger Alert Banner */}
        {result.redFlagTriggered && (
          <div className="mt-4 bg-red-900/90 border border-red-500 rounded-xl p-3.5 text-xs text-red-100 flex items-start gap-2.5 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider block mb-0.5">
                Deterministic Red-Flag Rule Fired:
              </span>
              <p className="text-red-200">
                Life-critical symptoms detected ({result.matchedRedFlags?.join(', ') || 'Emergency signs'}). Do not delay care. Do not drive yourself.
              </p>
            </div>
          </div>
        )}

        {/* Suggested Care & Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 block mb-0.5">Recommended Care Type</span>
            <span className="font-bold text-white text-sm">{result.suggestedCareType || config.actionText}</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 block mb-0.5">Recommended Timeframe</span>
            <span className="font-bold text-white text-sm">{result.suggestedTimeframe || config.timeframe}</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 block mb-0.5">Specialist / Provider</span>
            <span className="font-bold text-white text-sm">{result.recommendedSpecialist || 'General Physician'}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Explanation + Causes & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Explanation & Differential Causes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Jargon-free Explanation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Clear, Jargon-Free Explanation
              </h3>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line mb-4 font-normal">
              {result.jargonFreeExplanation}
            </p>

            {/* Why This Urgency Level? */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs">
              <span className="font-bold text-cyan-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Why was this urgency level chosen?
              </span>
              <p className="text-slate-300 leading-relaxed">
                {result.urgencyRationale}
              </p>
            </div>
          </div>

          {/* Differential Diagnoses / Possible Causes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Possible Causes Being Considered</span>
                <span className="text-[10px] text-slate-400 font-mono normal-case">
                  (Differential Assessment)
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              These are potential clinical explanations to discuss with your healthcare provider:
            </p>

            <div className="space-y-3">
              {result.possibleCauses?.map((cause, idx) => {
                const isExpanded = expandedCauseIdx === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedCauseIdx(isExpanded ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-900 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          cause.probability === 'High'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : cause.probability === 'Moderate'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {cause.probability} Probability
                        </span>
                        <span className="text-sm font-bold text-white">{cause.condition}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-300 space-y-2 border-t border-slate-800/80 bg-slate-900/50">
                        <p><span className="text-slate-400">Description:</span> {cause.description}</p>
                        <p><span className="text-cyan-400 font-medium">Why suspected:</span> {cause.whySuspected}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immediate Instructions & Home Care Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Immediate Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Immediate Action Steps
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.immediateInstructions?.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Home Care Tips */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-300">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Home Care & Relief Tips
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.homeCareTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Red Flag Warning Signs to Watch For */}
          <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-5 shadow-xl">
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Critical Warning Signs (Escalate Immediately if Observed)
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              If your condition changes or you develop any of these warning signs, seek emergency medical care immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-200">
              {result.warningSignsToWatch?.map((warn, i) => (
                <div key={i} className="flex items-start gap-2 bg-red-950/60 border border-red-900/40 p-2 rounded-lg">
                  <span className="text-red-400 font-bold shrink-0">⚠</span>
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Doctor Escalation, Clinic Finder & Feedback */}
        <div className="space-y-6">
          
          {/* Live Doctor Escalation Card (Key Flowchart Node!) */}
          <div className="bg-gradient-to-br from-indigo-950/90 via-purple-950/70 to-slate-900 border border-indigo-700/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  Escalation Path
                </span>
                <h3 className="text-sm font-bold text-white">
                  Connect with a Live Doctor
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Need immediate professional validation? Our system instantly generates a clinical-grade{' '}
              <span className="text-purple-300 font-bold">SBAR Handover Summary</span> and connects you to an on-call physician for a secure telehealth consultation.
            </p>

            <button
              onClick={onConnectDoctor}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/50 transition flex items-center justify-center gap-2 group"
            >
              <span>Escalate to Live Doctor Consult</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-purple-300/80 mt-3 pt-3 border-t border-purple-800/40 font-mono">
              <span>On-call triage physician</span>
              <span>Avg queue: ~2 mins</span>
            </div>
          </div>

          {/* Nearest Clinic & Hospital Locator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Nearest Care Centers
              </h3>
              <span className="text-[10px] text-slate-400">Within 5 km</span>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setSelectedClinicFilter('all')}
                className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                  selectedClinicFilter === 'all'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                All Facilities
              </button>
              <button
                onClick={() => setSelectedClinicFilter('emergency')}
                className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                  selectedClinicFilter === 'emergency'
                    ? 'bg-red-950 border-red-500 text-red-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                24/7 ER Only
              </button>
              <button
                onClick={() => setSelectedClinicFilter('routine')}
                className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                  selectedClinicFilter === 'routine'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Clinics / Walk-in
              </button>
            </div>

            <div className="space-y-2.5">
              {relevantClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white">{clinic.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono shrink-0">{clinic.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      clinic.is24x7 ? 'bg-red-950 text-red-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {clinic.type}
                    </span>
                    <span>• {clinic.openHours}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                    <a
                      href={`tel:${clinic.phone}`}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {clinic.phone}
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* End Node: Feedback & End */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Complete Assessment
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Help us evaluate medical anxiety reduction and ease healthcare congestion:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenFeedback}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Log Feedback & Conclude Session</span>
              </button>
              
              <button
                onClick={onRestart}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                Start New Symptom Check
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

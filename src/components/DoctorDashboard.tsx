import React, { useState } from 'react';
import { UserAccount, DoctorPatientCase, UrgencyLevel } from '../types';
import { MOCK_DOCTOR_CASES } from '../data/mockDoctorCases';
import { 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  FileText, 
  Video, 
  VideoOff, 
  Send, 
  CheckCircle2, 
  Search, 
  Filter, 
  PhoneCall, 
  TrendingUp, 
  ShieldAlert, 
  Download, 
  Printer, 
  Calendar,
  HeartPulse,
  LogOut,
  Pill,
  Save,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface DoctorDashboardProps {
  doctor: UserAccount;
  onLogout: () => void;
  onSwitchToPatient: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctor,
  onLogout,
  onSwitchToPatient,
}) => {
  const [cases, setCases] = useState<DoctorPatientCase[]>(MOCK_DOCTOR_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_DOCTOR_CASES[0].id);
  const [activeFilter, setActiveFilter] = useState<'all' | UrgencyLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('Patient alerted via AI triage. Advised immediate 12-lead ECG and telemetry.');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'doctor' | 'patient'; text: string; time: string }>>([
    {
      sender: 'doctor',
      text: "Hello Ramesh, this is Dr. Priya Sharma from Trauma Triage. I'm reviewing your chest pressure symptoms right now. Please keep resting in an upright position.",
      time: '10:12 AM',
    },
    {
      sender: 'patient',
      text: 'Thank you doctor, the pain is radiating into my left shoulder and jaw. Breathing is slightly difficult.',
      time: '10:13 AM',
    },
  ]);
  const [replyInput, setReplyInput] = useState('');
  const [dispositionStatus, setDispositionStatus] = useState<string | null>(null);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter((c) => {
    if (activeFilter !== 'all' && c.urgencyLevel !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.patientName.toLowerCase().includes(q) ||
        c.caseId.toLowerCase().includes(q) ||
        c.symptoms.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendChat = () => {
    if (!replyInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'doctor',
        text: replyInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setReplyInput('');
  };

  const handleApplyDisposition = (disposition: string) => {
    setDispositionStatus(disposition);
    setCases((prev) =>
      prev.map((c) => (c.id === selectedCase.id ? { ...c, status: 'completed' } : c))
    );
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'within_24_hours':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'routine_visit':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Doctor Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-950 font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{doctor.name}</h2>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
                {doctor.licenseNumber || 'LIC-#MH-6492'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {doctor.specialty || 'Emergency Medicine'} • {doctor.department || 'Trauma & Triage Command'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>On-Call Live</span>
          </div>

          <button
            onClick={onSwitchToPatient}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
          >
            Switch to Patient Portal
          </button>

          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Clinical Metrics & ER Relief Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
            Emergency Cases
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">1</span>
            <span className="text-[10px] text-red-400 font-mono">Immediate Action</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Urgent (Within 24h)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">1</span>
            <span className="text-[10px] text-amber-400 font-mono">Same-Day Clinic</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            Routine Appointments
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">1</span>
            <span className="text-[10px] text-cyan-400 font-mono">2-5 Days</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            ER Overload Relieved
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-300">68%</span>
            <span className="text-[10px] text-emerald-400 font-mono">Safe Self-Care</span>
          </div>
        </div>
      </div>

      {/* Main Clinical Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Live Triage Ingestion Queue */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Incoming Triage Queue</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {filteredCases.length} Cases
                </span>
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'emergency', label: 'Emergency' },
                { id: 'within_24_hours', label: 'Urgent 24h' },
                { id: 'routine_visit', label: 'Routine' },
                { id: 'self_care', label: 'Self-Care' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                    activeFilter === f.id
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case, name, symptom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[640px] pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === selectedCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{c.patientName}</span>
                        <span className="text-[11px] text-slate-400">({c.age}yo {c.gender})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{c.caseId} • {c.timestamp}</span>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getUrgencyBadge(c.urgencyLevel)}`}>
                      {c.urgencyLevel.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                    {c.symptoms}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span className="font-mono">Severity: <b className="text-slate-200">{c.severity}/10</b></span>
                    {c.redFlagFired && (
                      <span className="text-red-400 font-bold flex items-center gap-1 text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Red-Flag Rule
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (7 Cols): Active SBAR Handover & Clinical Tele-Encounter */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Patient Overview Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedCase.patientName}</h3>
                <span className="text-xs text-slate-400">({selectedCase.age}yo, {selectedCase.gender})</span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                  {selectedCase.caseId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                History: {selectedCase.medicalHistory.join(', ') || 'No known comorbidities'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getUrgencyBadge(selectedCase.urgencyLevel)}`}>
                {selectedCase.urgencyLevel.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* SBAR Structured Report Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated SBAR Handover Report
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Standard Clinical Handover
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Situation */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1 uppercase tracking-wide">
                  S - Situation
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedCase.sbar.situation}</p>
              </div>

              {/* Background */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-300 block mb-1 uppercase tracking-wide">
                  B - Background
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedCase.sbar.background}</p>
              </div>

              {/* Assessment */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1 uppercase tracking-wide">
                  A - Assessment
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedCase.sbar.assessment}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-300 block mb-1 uppercase tracking-wide">
                  R - Recommendation
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedCase.sbar.recommendation}</p>
              </div>

            </div>
          </div>

          {/* Teleconsultation Workbench & Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Patient Tele-Consultation Stream
                </span>
              </div>
              <button
                onClick={() => setIsVideoActive(!isVideoActive)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {isVideoActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-red-400" />}
                <span>{isVideoActive ? 'Camera Active' : 'Camera Paused'}</span>
              </button>
            </div>

            {/* Video Preview Box */}
            <div className="h-32 bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800 p-3 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-1">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-300 font-semibold">
                Live Encrypted Audio/Video Channel Connected
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Patient: {selectedCase.patientName} • Latency: 24ms
              </span>
            </div>

            {/* Patient Chat dialogue */}
            <div className="p-3.5 bg-slate-950/50 space-y-2.5 max-h-48 overflow-y-auto text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'doctor'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] block text-right mt-0.5 opacity-70">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply Bar */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Send physician instructions or guidance..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat();
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendChat}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clinical Disposition Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Physician Disposition Orders
            </h4>

            {dispositionStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Encounter disposition updated: <b>{dispositionStatus}</b></span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleApplyDisposition('Direct ER Admission Dispatched (108)')}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Dispatch ER Transport</span>
              </button>

              <button
                onClick={() => handleApplyDisposition('Booked for Urgent Care Same-Day')}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Refer Urgent Care</span>
              </button>

              <button
                onClick={() => handleApplyDisposition('Prescribed Home Care & Outpatient Follow-up')}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Discharge with Tips</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

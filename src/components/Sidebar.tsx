import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  MessageSquare, 
  ClipboardCheck, 
  Building2, 
  UserCheck, 
  History, 
  HeartHandshake, 
  PhoneCall, 
  Globe, 
  AlertTriangle,
  RotateCcw,
  Shield,
  ChevronRight,
  Flame
} from 'lucide-react';
import { UrgencyLevel, UserAccount } from '../types';

export type ActiveView = 
  | 'intake_form' 
  | 'chat_intake' 
  | 'triage_result' 
  | 'clinic_locator' 
  | 'live_doctor' 
  | 'history' 
  | 'feedback';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  hasTriageResult: boolean;
  urgencyLevel?: UrgencyLevel | null;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  historyCount: number;
  user: UserAccount | null;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  hasTriageResult,
  urgencyLevel,
  currentLanguage,
  setCurrentLanguage,
  onReset,
  isOpenMobile,
  setIsOpenMobile,
  historyCount,
  user,
  onLogout,
  onSwitchRole,
}) => {
  const navItems = [
    {
      id: 'intake_form' as ActiveView,
      label: 'Symptom Intake Form',
      sublabel: 'Guided assessment & presets',
      icon: Stethoscope,
      badge: null,
    },
    {
      id: 'chat_intake' as ActiveView,
      label: 'Conversational Assistant',
      sublabel: 'AI-guided clinical chat',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'triage_result' as ActiveView,
      label: 'Triage & Care Plan',
      sublabel: 'Urgency classification & tips',
      icon: ClipboardCheck,
      badge: urgencyLevel ? urgencyLevel.replace(/_/g, ' ') : null,
      disabled: !hasTriageResult,
    },
    {
      id: 'clinic_locator' as ActiveView,
      label: 'Nearby Clinics & ER',
      sublabel: 'Emergency trauma & walk-ins',
      icon: Building2,
      badge: null,
    },
    {
      id: 'live_doctor' as ActiveView,
      label: 'Live Doctor Handover',
      sublabel: 'SBAR tele-consultation',
      icon: UserCheck,
      badge: 'Telehealth',
    },
    {
      id: 'history' as ActiveView,
      label: 'Session History',
      sublabel: 'Saved patient records',
      icon: History,
      badge: historyCount > 0 ? `${historyCount}` : null,
    },
    {
      id: 'feedback' as ActiveView,
      label: 'Patient Feedback',
      sublabel: 'Anxiety evaluation & survey',
      icon: HeartHandshake,
      badge: null,
    },
  ];

  const getUrgencyBadgeColor = (level?: UrgencyLevel | null) => {
    switch (level) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'within_24_hours': return 'bg-amber-600 text-white';
      case 'routine_visit': return 'bg-cyan-600 text-white';
      case 'self_care': return 'bg-emerald-600 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-950 text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Triage<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  PS-02
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Clinical Triage Assistant</p>
            </div>
          </div>
        </div>

        {/* Emergency Trigger Box */}
        <div className="p-3 m-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-red-200 font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Emergency Services</span>
          </div>
          <p className="text-[11px] text-red-300/80 mb-2">
            Acute chest pain or stroke signs? Call emergency transport:
          </p>
          <a
            href="tel:108"
            className="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition animate-pulse"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108 / 112 / 911</span>
          </a>
        </div>

        {/* Navigation Items (Left Task Bar) */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
            Taskbar Interfaces
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  setActiveView(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between group ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : isActive
                    ? 'bg-slate-800 text-white border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    item.id === 'triage_result' ? getUrgencyBadgeColor(urgencyLevel) : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Panel */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/50">
          
          {/* User Account Card */}
          {user && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 capitalize">{user.role} Portal</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Sign Out"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Switch Role Button */}
          <button
            onClick={() => {
              onSwitchRole();
              setIsOpenMobile(false);
            }}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-purple-300 hover:text-purple-200 text-[11px] font-semibold transition text-center"
          >
            Switch to Doctor Portal ➔
          </button>

          {/* Language Selector */}
          <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Language:</span>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="English" className="bg-slate-800">EN (English)</option>
              <option value="Hindi" className="bg-slate-800">HI (हिन्दी)</option>
              <option value="Spanish" className="bg-slate-800">ES (Español)</option>
            </select>
          </div>

          {/* Reset / New Assessment */}
          <button
            onClick={() => {
              onReset();
              setIsOpenMobile(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>New Symptom Check</span>
          </button>
        </div>

      </aside>
    </>
  );
};

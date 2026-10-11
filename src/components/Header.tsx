import React, { useState } from 'react';
import { 
  Activity, 
  PhoneCall, 
  GitBranch, 
  Globe, 
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  activeUrgencyLevel?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  currentLanguage,
  setCurrentLanguage,
  activeUrgencyLevel,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<'IN' | 'US' | 'UK' | 'EU'>('IN');
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  const emergencyNumbers = {
    IN: { label: 'India', primary: '108', secondary: '112', title: 'Call 108 / 112' },
    US: { label: 'USA / Canada', primary: '911', secondary: '911', title: 'Call 911' },
    UK: { label: 'UK', primary: '999', secondary: '111', title: 'Call 999' },
    EU: { label: 'Europe', primary: '112', secondary: '112', title: 'Call 112' },
  };

  const activeHotline = emergencyNumbers[selectedCountry];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Urgent Emergency Alert Bar */}
      <div className="bg-red-950/80 border-b border-red-800/60 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-red-100">Life-Threatening Emergency?</span>
          <span className="hidden sm:inline text-red-300">
            If you have crushing chest pain, difficulty breathing, or stroke symptoms, call emergency services immediately:
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* Country Selector for Hotline */}
          <div className="relative">
            <button
              onClick={() => setShowCountryMenu(!showCountryMenu)}
              className="flex items-center gap-1 bg-red-900/60 hover:bg-red-800 text-red-100 px-2 py-0.5 rounded text-xs transition border border-red-700/50"
            >
              <span>{activeHotline.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showCountryMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded shadow-xl py-1 z-50">
                {(Object.keys(emergencyNumbers) as Array<keyof typeof emergencyNumbers>).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setSelectedCountry(code);
                      setShowCountryMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex justify-between ${
                      selectedCountry === code ? 'text-emerald-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <span>{emergencyNumbers[code].label}</span>
                    <span className="font-mono text-slate-400">{emergencyNumbers[code].primary}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href={`tel:${activeHotline.primary}`}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-0.5 rounded-full text-xs shadow transition animate-bounce"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{activeHotline.title}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-md shadow-cyan-900/40 text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Triage<span className="text-cyan-400">AI</span>
              </span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full">
                PS-02 Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Symptom Checker & Clinical Triage Assistant
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language selector */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 py-1 pr-2 rounded focus:outline-none cursor-pointer"
            >
              <option value="English" className="bg-slate-800 text-white">EN (English)</option>
              <option value="Hindi" className="bg-slate-800 text-white">HI (हिन्दी)</option>
              <option value="Spanish" className="bg-slate-800 text-white">ES (Español)</option>
            </select>
          </div>

          {/* Reset / New Session */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="Start a new intake assessment"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">New Triage</span>
          </button>
        </div>
      </div>
    </header>
  );
};

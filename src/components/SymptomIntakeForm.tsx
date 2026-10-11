import React, { useState, useEffect } from 'react';
import { 
  PatientProfile, 
  UrgencyLevel 
} from '../types';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  User, 
  FilePlus, 
  HelpCircle,
  Check,
  Stethoscope,
  Zap,
  Info
} from 'lucide-react';

interface SymptomIntakeFormProps {
  onSubmit: (profile: PatientProfile) => void;
  isLoading: boolean;
  onPresetSelect?: (preset: PatientProfile) => void;
}

export const PRESET_SCENARIOS: Array<{
  name: string;
  badge: string;
  expectedTier: UrgencyLevel;
  profile: PatientProfile;
}> = [
  {
    name: 'Severe Chest Pressure & Left Arm Pain (Emergency)',
    badge: 'Red-Flag Emergency',
    expectedTier: 'emergency',
    profile: {
      symptoms: 'Crushing central chest tightness radiating into left shoulder and jaw, breaking out into cold sweats and mild breathlessness.',
      duration: 'Started 45 minutes ago',
      severity: 9,
      age: 58,
      gender: 'Male',
      medicalHistory: ['Hypertension', 'Smoker'],
      currentMedications: 'Amlodipine 5mg',
      language: 'English',
      redFlagChecklist: {
        chestPainPressure: true,
        shortnessOfBreath: true,
        facialDroopSpeechSlur: false,
        suddenSevereHeadache: false,
        coughingVomitingBlood: false,
        anaphylaxisSigns: false,
      },
    },
  },
  {
    name: 'Acute Lower Abdominal Pain & Fever (24 Hours)',
    badge: 'Within 24 Hours',
    expectedTier: 'within_24_hours',
    profile: {
      symptoms: 'Sharp localized pain in lower right abdomen, persistent nausea, loss of appetite, and low-grade fever of 101.2°F.',
      duration: '16 hours, steadily intensifying',
      severity: 7,
      age: 26,
      gender: 'Female',
      medicalHistory: ['None'],
      currentMedications: 'None',
      language: 'English',
      redFlagChecklist: {
        chestPainPressure: false,
        shortnessOfBreath: false,
        facialDroopSpeechSlur: false,
        suddenSevereHeadache: false,
        coughingVomitingBlood: false,
        anaphylaxisSigns: false,
      },
    },
  },
  {
    name: 'Persistent Eczema Rash & Dry Skin (Routine Visit)',
    badge: 'Routine Visit',
    expectedTier: 'routine_visit',
    profile: {
      symptoms: 'Red, itchy scaly rash across both forearms. Mild itching worse at night, no blister oozing, no systemic fever.',
      duration: '8 days',
      severity: 4,
      age: 34,
      gender: 'Female',
      medicalHistory: ['Allergies / Hay fever'],
      currentMedications: 'Moisturizing lotion',
      language: 'English',
      redFlagChecklist: {
        chestPainPressure: false,
        shortnessOfBreath: false,
        facialDroopSpeechSlur: false,
        suddenSevereHeadache: false,
        coughingVomitingBlood: false,
        anaphylaxisSigns: false,
      },
    },
  },
  {
    name: 'Mild Runny Nose & Scratchy Throat (Self-Care)',
    badge: 'Self-Care',
    expectedTier: 'self_care',
    profile: {
      symptoms: 'Mild clear nasal discharge, occasional sneeze, scratchy throat, normal appetite, no fever or shortness of breath.',
      duration: '24 hours',
      severity: 2,
      age: 22,
      gender: 'Male',
      medicalHistory: ['None'],
      currentMedications: 'None',
      language: 'English',
      redFlagChecklist: {
        chestPainPressure: false,
        shortnessOfBreath: false,
        facialDroopSpeechSlur: false,
        suddenSevereHeadache: false,
        coughingVomitingBlood: false,
        anaphylaxisSigns: false,
      },
    },
  },
];

const COMMON_SYMPTOM_TAGS = [
  'Chest pressure',
  'Shortness of breath',
  'High fever >101°F',
  'Severe headache',
  'Dizziness / Vertigo',
  'Abdominal cramps',
  'Sprained ankle',
  'Sore throat',
  'Skin rash / Itch',
  'Persistent dry cough',
  'Nausea & Vomiting',
  'Back pain',
];

const PRE_EXISTING_OPTIONS = [
  'Hypertension (High BP)',
  'Diabetes Type 1 or 2',
  'Asthma / COPD',
  'Heart Disease / CAD',
  'Kidney Disease',
  'Immunocompromised',
  'Smoker',
  'None / Healthy',
];

export const SymptomIntakeForm: React.FC<SymptomIntakeFormProps> = ({
  onSubmit,
  isLoading,
  onPresetSelect,
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState(5);
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState('Female');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState('');
  const [redFlagChecklist, setRedFlagChecklist] = useState({
    chestPainPressure: false,
    shortnessOfBreath: false,
    facialDroopSpeechSlur: false,
    suddenSevereHeadache: false,
    coughingVomitingBlood: false,
    anaphylaxisSigns: false,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!symptoms.includes(tag)) {
      setSymptoms((prev) => (prev ? `${prev}, ${tag}` : tag));
    }
  };

  const handleToggleHistory = (item: string) => {
    if (item === 'None / Healthy') {
      setMedicalHistory(['None / Healthy']);
      return;
    }
    setMedicalHistory((prev) => {
      const filtered = prev.filter((i) => i !== 'None / Healthy');
      return filtered.includes(item) ? filtered.filter((i) => i !== item) : [...filtered, item];
    });
  };

  const handleLoadPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSymptoms(preset.profile.symptoms);
    setDuration(preset.profile.duration);
    setSeverity(preset.profile.severity);
    setAge(preset.profile.age);
    setGender(preset.profile.gender);
    setMedicalHistory(preset.profile.medicalHistory);
    setCurrentMedications(preset.profile.currentMedications);
    setRedFlagChecklist(preset.profile.redFlagChecklist);
    if (onPresetSelect) onPresetSelect(preset.profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    onSubmit({
      symptoms,
      duration,
      severity,
      age,
      gender,
      medicalHistory,
      currentMedications,
      language: 'English',
      redFlagChecklist,
    });
  };

  // Severity color indicator
  const getSeverityColor = (val: number) => {
    if (val <= 3) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
    if (val <= 6) return 'text-cyan-400 bg-cyan-950/50 border-cyan-800';
    if (val <= 8) return 'text-amber-400 bg-amber-950/50 border-amber-800';
    return 'text-red-400 bg-red-950/50 border-red-800';
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return 'Mild Discomfort (Manageable)';
    if (val <= 6) return 'Moderate Pain (Interferes with activity)';
    if (val <= 8) return 'Severe Pain (Difficult to function)';
    return 'Critical / Incapacitating (Unbearable)';
  };

  const hasAnyRedFlag = Object.values(redFlagChecklist).some(Boolean);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Scenario Presets Bar */}
      <div className="bg-slate-950/70 p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Test Cases (1-Click Presets):
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Load realistic clinical case to test any tier
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.expectedTier === 'emergency'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : p.expectedTier === 'within_24_hours'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : p.expectedTier === 'routine_visit'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {p.badge}
                </span>
              </div>
              <span className="text-xs text-slate-200 group-hover:text-white font-medium line-clamp-2">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        
        {/* Step 1: Chief Complaint & Symptoms */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              What symptoms are you experiencing?
              <span className="text-red-400">*</span>
            </label>
            {speechSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
                  isRecording
                    ? 'bg-red-950 text-red-200 border-red-600 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
                title="Speak to dictate symptoms"
              >
                {isRecording ? <Mic className="w-3.5 h-3.5 text-red-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isRecording ? 'Listening... Speak now' : 'Voice Dictate'}</span>
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              rows={3}
              placeholder="e.g., Throbbing pain on the right side of my head since yesterday evening, accompanied by sensitivity to bright light and mild nausea..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            />
          </div>

          {/* Quick Symptom Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-slate-400 mr-1">Quick add:</span>
            {COMMON_SYMPTOM_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-slate-750 transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Critical Red-Flag Rule Checklist (Exact Flowchart Node Check) */}
        <div className={`p-4 rounded-xl border transition ${
          hasAnyRedFlag 
            ? 'bg-red-950/40 border-red-800 ring-1 ring-red-700' 
            : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${hasAnyRedFlag ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                Emergency Screening: Life-Threatening Red Flags
              </span>
            </div>
            {hasAnyRedFlag && (
              <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                Direct Emergency Trigger Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Check any warning signs currently present. Positive signs immediately bypass to emergency protocols:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            
            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.chestPainPressure}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, chestPainPressure: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">Crushing chest pressure or radiating pain</span>
            </label>

            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.shortnessOfBreath}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, shortnessOfBreath: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">Severe gasping or unable to speak sentences</span>
            </label>

            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.facialDroopSpeechSlur}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, facialDroopSpeechSlur: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">F.A.S.T.: Face droop, arm weakness, slurred speech</span>
            </label>

            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.suddenSevereHeadache}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, suddenSevereHeadache: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">Sudden explosive "thunderclap" headache</span>
            </label>

            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.coughingVomitingBlood}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, coughingVomitingBlood: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">Coughing / vomiting blood or black tarry stool</span>
            </label>

            <label className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={redFlagChecklist.anaphylaxisSigns}
                onChange={(e) => setRedFlagChecklist({ ...redFlagChecklist, anaphylaxisSigns: e.target.checked })}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-200">Throat swelling, difficulty swallowing, anaphylaxis</span>
            </label>

          </div>
        </div>

        {/* Step 3: Duration & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Duration / When did this start?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['< 2 hours', 'Today (2-12 hrs)', '1-2 days', '3-7 days', '> 1 week', 'Chronic / Recurring'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`text-xs py-2 px-2.5 rounded-lg border transition text-center font-medium ${
                    duration === d
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Pain & Severity Level (1 - 10):
              </label>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityColor(severity)}`}>
                {severity} / 10
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 (Very mild)</span>
              <span>5 (Moderate)</span>
              <span>10 (Emergency)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Rating: <span className="text-slate-200">{getSeverityLabel(severity)}</span>
            </p>
          </div>

        </div>

        {/* Step 4: Patient Demographics & History */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-3">
            <User className="w-4 h-4 text-cyan-400" />
            Patient Profile & Relevant History:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            
            {/* Age */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Biological Sex</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Pregnant (Female)">Pregnant (Female)</option>
                <option value="Other">Other / Non-binary</option>
              </select>
            </div>

            {/* Current Medications */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Current Medications (if any)</label>
              <input
                type="text"
                placeholder="e.g. Metformin, Aspirin..."
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

          </div>

          {/* Pre-existing conditions */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">Pre-existing Medical Conditions:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRE_EXISTING_OPTIONS.map((item) => {
                const selected = medicalHistory.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleHistory(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      selected
                        ? 'bg-cyan-900/60 border-cyan-500 text-cyan-100 font-medium'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 inline mr-1 text-cyan-400" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !symptoms.trim()}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition shadow-xl flex items-center justify-center gap-2 ${
              hasAnyRedFlag
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-cyan-950/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Rule-Engine & ML Urgency Classifier...</span>
              </>
            ) : hasAnyRedFlag ? (
              <>
                <AlertTriangle className="w-5 h-5 text-white" />
                <span>Red Flag Detected - Run Urgent Triage Assessment</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-5 h-5" />
                <span>Analyze Symptoms & Determine Urgency Level</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            Safety protocol: Low confidence scores automatically escalate to a higher safety level.
          </p>
        </div>

      </form>
    </div>
  );
};

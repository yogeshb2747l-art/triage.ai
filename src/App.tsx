import React, { useState, useEffect } from 'react';
import { 
  PatientProfile, 
  TriageResult, 
  UserAccount,
  UserRole 
} from './types';
import { LoginPage } from './components/LoginPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { Sidebar, ActiveView } from './components/Sidebar';
import { SymptomIntakeForm } from './components/SymptomIntakeForm';
import { ChatIntakeAssistant } from './components/ChatIntakeAssistant';
import { TriageResultView } from './components/TriageResultView';
import { ClinicLocatorView } from './components/ClinicLocatorView';
import { HistoryView } from './components/HistoryView';
import { LiveDoctorModal } from './components/LiveDoctorModal';
import { FeedbackModal } from './components/FeedbackModal';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { 
  Menu, 
  PhoneCall, 
  AlertTriangle, 
  AlertCircle,
  Activity,
  HeartPulse,
  UserCheck,
  Stethoscope,
  LogOut,
  User
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('intake_form');
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState<string | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [pastTriageHistory, setPastTriageHistory] = useState<Array<{ timestamp: string; symptoms: string; level: string }>>([]);

  // Check saved session
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('triage_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const history = JSON.parse(localStorage.getItem('triage_history') || '[]');
      setPastTriageHistory(history);
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('triage_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('triage_user');
    handleReset();
  };

  const handleTriageSubmit = async (profile: PatientProfile) => {
    setIsLoading(true);
    setError(null);
    setPatientProfile(profile);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Triage evaluation service error');
      }

      const data: TriageResult = await response.json();
      setTriageResult(data);
      setActiveView('triage_result');

      const newHist = [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          symptoms: profile.symptoms.slice(0, 50) + '...',
          level: data.urgencyLevel,
        },
        ...pastTriageHistory.slice(0, 7),
      ];
      setPastTriageHistory(newHist);
      localStorage.setItem('triage_history', JSON.stringify(newHist));
    } catch (err: any) {
      console.error('Triage submission error:', err);
      setError(err.message || 'An unexpected error occurred during triage evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPatientProfile(null);
    setTriageResult(null);
    setError(null);
    setActiveView('intake_form');
    setIsDoctorModalOpen(false);
    setIsFeedbackModalOpen(false);
  };

  const handleClearHistory = () => {
    setPastTriageHistory([]);
    localStorage.removeItem('triage_history');
  };

  // IF NOT LOGGED IN -> RENDER LOGIN PAGE
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // IF LOGGED IN AS DOCTOR -> RENDER DOCTOR PORTAL
  if (currentUser.role === 'doctor') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <DoctorDashboard
            doctor={currentUser}
            onLogout={handleLogout}
            onSwitchToPatient={() =>
              handleLogin({
                id: 'usr-pat-01',
                name: 'Ananya Roy',
                email: 'ananya.roy@example.com',
                role: 'patient',
                age: 29,
                gender: 'Female',
              })
            }
          />
        </div>
      </div>
    );
  }

  // IF LOGGED IN AS PATIENT -> RENDER PATIENT PORTAL WITH LEFT TASKBAR
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Left Task Bar / Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'live_doctor') {
            setIsDoctorModalOpen(true);
          } else if (view === 'feedback') {
            setIsFeedbackModalOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        hasTriageResult={!!triageResult}
        urgencyLevel={triageResult?.urgencyLevel}
        currentLanguage={language}
        setCurrentLanguage={setLanguage}
        onReset={handleReset}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        historyCount={pastTriageHistory.length}
        user={currentUser}
        onLogout={handleLogout}
        onSwitchRole={() =>
          handleLogin({
            id: 'usr-doc-01',
            name: 'Dr. Priya Sharma, MD',
            email: 'dr.sharma@apexhealth.org',
            role: 'doctor',
            specialty: 'Emergency Medicine & Acute Care',
            department: 'Trauma & Emergency Triage',
            licenseNumber: 'MCI-REG-849201',
          })
        }
      />

      {/* Main Patient Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Patient Portal
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">
                • Welcome, {currentUser.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                handleLogin({
                  id: 'usr-doc-01',
                  name: 'Dr. Priya Sharma, MD',
                  email: 'dr.sharma@apexhealth.org',
                  role: 'doctor',
                  specialty: 'Emergency Medicine & Acute Care',
                  department: 'Trauma & Emergency Triage',
                  licenseNumber: 'MCI-REG-849201',
                })
              }
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800 transition font-medium"
            >
              <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
              <span>Switch to Doctor View</span>
            </button>

            <a
              href="tel:108"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow transition animate-pulse"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 / 112</span>
            </a>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Global Error Banner */}
          {error && (
            <div className="bg-red-950/80 border border-red-700 text-red-200 p-4 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-white font-bold ml-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active View Display based on Left Task Bar Selection */}
          {activeView === 'intake_form' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Symptom Intake Assessment</h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive questionnaire with voice dictation and life-threatening red-flag screening.
                  </p>
                </div>
              </div>
              <SymptomIntakeForm
                onSubmit={handleTriageSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeView === 'chat_intake' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Conversational Intake Assistant</h2>
                  <p className="text-xs text-slate-400">
                    Interactive clinical dialogue with smart follow-up queries and instant triage triggering.
                  </p>
                </div>
              </div>
              <ChatIntakeAssistant
                onTriageSubmit={handleTriageSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeView === 'triage_result' && (
            <div>
              {triageResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-white">Clinical Triage Evaluation</h2>
                      <p className="text-xs text-slate-400">
                        Urgency level determination, jargon-free explanations, and recommended action steps.
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      ← New Assessment
                    </button>
                  </div>
                  <TriageResultView
                    result={triageResult}
                    patientProfile={patientProfile!}
                    onConnectDoctor={() => setIsDoctorModalOpen(true)}
                    onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                    onRestart={handleReset}
                  />
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <Activity className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No Assessment Active Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Complete the symptom intake form or conversational chat to generate your triage verdict.
                  </p>
                  <button
                    onClick={() => setActiveView('intake_form')}
                    className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    Go to Symptom Intake
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'clinic_locator' && (
            <ClinicLocatorView urgencyLevel={triageResult?.urgencyLevel} />
          )}

          {activeView === 'history' && (
            <HistoryView
              history={pastTriageHistory}
              onClearHistory={handleClearHistory}
              onNewAssessment={handleReset}
            />
          )}

        </main>

        {/* Legal & Medical Notice Footer */}
        <MedicalDisclaimer />

      </div>

      {/* Live Doctor Handover Modal */}
      <LiveDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        result={
          triageResult || {
            urgencyLevel: 'within_24_hours',
            urgencyTitle: 'Clinical Tele-Triage Evaluation',
            confidenceScore: 88,
            safetyDowngradeApplied: false,
            redFlagTriggered: false,
            matchedRedFlags: [],
            jargonFreeExplanation: 'Patient case escalated to live physician for clinical interview.',
            urgencyRationale: 'Tele-triage validation requested.',
            possibleCauses: [],
            immediateInstructions: ['Join video consultation stream'],
            homeCareTips: [],
            warningSignsToWatch: ['Any sudden worsening of symptoms'],
            recommendedSpecialist: 'Emergency Physician',
            suggestedTimeframe: 'Immediate',
            suggestedCareType: 'Telehealth Consult',
          }
        }
        patientProfile={
          patientProfile || {
            symptoms: 'Patient symptom presentation during triage consultation',
            duration: 'Recent onset',
            severity: 6,
            age: 32,
            gender: 'Patient',
            medicalHistory: [],
            currentMedications: 'None stated',
            language: 'English',
            redFlagChecklist: {
              chestPainPressure: false,
              shortnessOfBreath: false,
              facialDroopSpeechSlur: false,
              suddenSevereHeadache: false,
              coughingVomitingBlood: false,
              anaphylaxisSigns: false,
            },
          }
        }
      />

      {/* Patient Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        result={
          triageResult || {
            urgencyLevel: 'routine_visit',
            urgencyTitle: 'Triage Assessment Complete',
            confidenceScore: 90,
            safetyDowngradeApplied: false,
            redFlagTriggered: false,
            matchedRedFlags: [],
            jargonFreeExplanation: 'Assessment complete.',
            urgencyRationale: '',
            possibleCauses: [],
            immediateInstructions: [],
            homeCareTips: [],
            warningSignsToWatch: [],
            recommendedSpecialist: 'Primary Care',
            suggestedTimeframe: '2-5 days',
            suggestedCareType: 'Routine Visit',
          }
        }
        onSubmitted={() => {
          // feedback recorded
        }}
      />

    </div>
  );
}

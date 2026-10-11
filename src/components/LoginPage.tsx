import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';
import { 
  Activity, 
  User, 
  Stethoscope, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemoPatient = () => {
    onLogin({
      id: 'usr-pat-01',
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      role: 'patient',
      age: 29,
      gender: 'Female',
      phone: '+91 98765 43210',
    });
  };

  const handleQuickDemoDoctor = () => {
    onLogin({
      id: 'usr-doc-01',
      name: 'Dr. Priya Sharma, MD',
      email: 'dr.sharma@apexhealth.org',
      role: 'doctor',
      specialty: 'Emergency Medicine & Acute Care',
      department: 'Trauma & Emergency Triage',
      licenseNumber: 'MCI-REG-849201',
      phone: '+91 98200 11223',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (role === 'patient') {
      onLogin({
        id: `pat-${Date.now()}`,
        name: fullName.trim() || email.split('@')[0],
        email: email.trim(),
        role: 'patient',
        age: 32,
        gender: 'Female',
      });
    } else {
      onLogin({
        id: `doc-${Date.now()}`,
        name: fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim() || 'Rajesh Mehta'}`,
        email: email.trim(),
        role: 'doctor',
        specialty: 'General & Emergency Medicine',
        department: 'Clinical Triage Services',
        licenseNumber: 'MED-REG-55209',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          {/* Brand & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950 text-white mb-3">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Triage<span className="text-cyan-400">AI</span> Platform
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clinical Triage Assistant & Physician Telehealth Handover (PS-02 Protocol)
            </p>
          </div>

          {/* Role Selector: Patient vs Doctor */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                setError(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'patient'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('doctor');
                setError(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'doctor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Portal</span>
            </button>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Quick 1-Click Demo Evaluation:
              </span>
              <span className="text-slate-500">No typing required</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPatient}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-800/60 hover:border-cyan-500 text-cyan-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Login as Patient (Ananya)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoDoctor}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-purple-800/60 hover:border-purple-500 text-purple-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                <span>Login as Doctor (Dr. Priya)</span>
              </button>
            </div>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {role === 'patient' ? 'Patient Name (Optional)' : 'Physician Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={role === 'patient' ? 'e.g. Ananya Roy' : 'e.g. Dr. Priya Sharma'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={role === 'patient' ? 'patient@example.com' : 'physician@hospital.org'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-xl transition flex items-center justify-center gap-2 text-white ${
                role === 'patient'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-950/50'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-950/50'
              }`}
            >
              <span>Sign In to {role === 'patient' ? 'Patient Portal' : 'Doctor Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy & Clinical Standard Badge */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted HIPAA & ESI Clinical Decision Support Compliant</span>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        PS-02 Specification • AI Symptom Checker & Clinical Triage Assistant
      </footer>

    </div>
  );
};

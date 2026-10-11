import React, { useState } from 'react';
import { MOCK_CLINICS } from '../data/mockClinics';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  ExternalLink, 
  Clock, 
  Search, 
  Filter, 
  ShieldAlert,
  Star
} from 'lucide-react';
import { UrgencyLevel } from '../types';

interface ClinicLocatorViewProps {
  urgencyLevel?: UrgencyLevel | null;
}

export const ClinicLocatorView: React.FC<ClinicLocatorViewProps> = ({
  urgencyLevel,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'emergency' | 'urgent' | 'primary'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClinics = MOCK_CLINICS.filter((c) => {
    if (filterType === 'emergency' && !c.is24x7) return false;
    if (filterType === 'urgent' && c.type !== 'Urgent Care') return false;
    if (filterType === 'primary' && c.type !== 'Primary Care Clinic' && c.type !== 'Community Health Center') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Nearby Healthcare & Emergency Facilities</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time proximity directory for level-1 trauma centers, urgent walk-ins, and outpatient clinics.
          </p>
        </div>

        {urgencyLevel && (
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 self-start md:self-center ${
            urgencyLevel === 'emergency' ? 'bg-red-950 border-red-500 text-red-200 animate-pulse' : 'bg-slate-800 border-slate-700 text-cyan-300'
          }`}>
            Current Need: {urgencyLevel.replace(/_/g, ' ').toUpperCase()}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clinic or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
            }`}
          >
            All Facilities
          </button>
          <button
            onClick={() => setFilterType('emergency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'emergency' ? 'bg-red-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
            }`}
          >
            24/7 Trauma ER
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'urgent' ? 'bg-amber-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
            }`}
          >
            Urgent Care
          </button>
          <button
            onClick={() => setFilterType('primary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'primary' ? 'bg-emerald-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-400'
            }`}
          >
            Primary Care
          </button>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  clinic.is24x7 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                }`}>
                  {clinic.type}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {clinic.distance}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">{clinic.name}</h3>
              <p className="text-xs text-slate-400 flex items-start gap-1.5 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{clinic.address}</span>
              </p>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{clinic.openHours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Rating: {clinic.rating} / 5.0 • Wait time ~{clinic.estimatedWaitMinutes}m</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <a
                href={`tel:${clinic.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Center</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Map Route</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

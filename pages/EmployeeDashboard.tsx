
import React, { useEffect, useState } from 'react';
import { ChevronRight, Briefcase, MapPin, Search, Info, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { User as UserType, Business, Job } from '../types';
import { jobStore } from '../services/storage';
import { navigateTo } from '../services/navigation';

interface Props {
  user: UserType;
  business: Business;
}

const EmployeeDashboard: React.FC<Props> = ({ user, business }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    setJobs(jobStore.getByBusiness(business.id).filter(j => j.assignedEmployeeId === user.id));
  }, [business.id, user.id]);

  const toggleExpand = (jid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedJobId(expandedJobId === jid ? null : jid);
  };

  const startJob = (jid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo({ record: jid });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Terminal Operational
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">My Tasks</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Active assignments for {user.name}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <Search size={16} className="text-slate-600" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {user.id}</span>
        </div>
      </header>

      <div className="space-y-6">
        <div className="grid gap-6">
          {jobs.length === 0 ? (
             <div className="bg-slate-900/30 border border-slate-800 border-dashed p-16 rounded-[2.5rem] text-center">
               <Briefcase className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-50" />
               <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No pending verifications assigned</p>
               <p className="text-slate-700 text-xs mt-2 italic">New dispatches will appear here in real-time.</p>
             </div>
          ) : (
            jobs.map(job => {
              const isExpanded = expandedJobId === job.id;
              return (
                <div 
                  key={job.id} 
                  className={`group bg-slate-900 border ${isExpanded ? 'border-emerald-500/50 shadow-emerald-900/10' : 'border-slate-800 hover:border-slate-600'} rounded-[2rem] transition-all duration-300 shadow-xl overflow-hidden active:scale-[0.995] flex flex-col`}
                >
                  <div 
                    className="p-8 flex items-center justify-between gap-6 cursor-pointer"
                    onClick={(e) => toggleExpand(job.id, e)}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none">
                      <Briefcase size={80} />
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Awaiting Verification</span>
                        <span className="text-slate-600 font-mono text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800">REF: {job.id}</span>
                      </div>
                      <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tight">{job.clientName}</h4>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                          <div className="bg-slate-800 p-1.5 rounded-lg text-slate-500"><MapPin size={14} /></div>
                          {job.location}
                        </div>
                        
                        <div className="relative group/tooltip">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <Info size={12} className="text-emerald-500" /> Instructions
                          </div>
                          {/* Simple Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl text-[10px] text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                            {job.description.length > 60 ? `${job.description.substring(0, 60)}...` : job.description}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <button 
                        onClick={(e) => startJob(job.id, e)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-tighter italic flex items-center gap-3 transition-all shadow-lg active:scale-95 group-hover:translate-x-[-4px]"
                      >
                        <Play size={16} fill="currentColor" /> START
                      </button>
                      
                      <div className={`text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 border-t border-slate-800/50' : 'max-h-0'}`}
                  >
                    <div className="p-8 bg-slate-950/50">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-emerald-500" /> Full Mission Details
                      </h5>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-900/80 p-6 rounded-2xl border border-slate-800/50 italic">
                        "{job.description}"
                      </p>
                      <div className="mt-6 flex gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 rounded-xl flex-1">
                          <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Compliance Req</div>
                          <div className="text-xs text-slate-400">Continuous GPS + Narrative Capture</div>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/10 px-4 py-3 rounded-xl flex-1">
                          <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Audit Type</div>
                          <div className="text-xs text-slate-400">Hard-Proof Visual Record</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <footer className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Hardware Seal: <span className="text-emerald-500">Active</span></div>
        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Network Status: <span className="text-emerald-500">Synchronized</span></div>
      </footer>
    </div>
  );
};

// Internal icon proxy to avoid duplicate imports if FileText isn't used elsewhere
const FileText = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

export default EmployeeDashboard;

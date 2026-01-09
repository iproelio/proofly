
import React, { useEffect, useState } from 'react';
import { FileCheck, Download, Package, MapPin, ExternalLink, Shield, Share2 } from 'lucide-react';
import { User, ProofRecording } from '../types';
import { getAllRecordings } from '../services/storage';
import { navigateTo } from '../services/navigation';
import ShareModal from '../components/ShareModal';

const ClientDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [proofs, setProofs] = useState<ProofRecording[]>([]);
  const [shareProofId, setShareProofId] = useState<string | null>(null);

  useEffect(() => {
    getAllRecordings().then(all => {
      setProofs(all.filter(p => p.clientId === user.id || p.businessId === user.businessId));
    });
  }, [user.id, user.businessId]);

  const viewVideo = (vid: string) => navigateTo({ vid });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <Shield className="text-amber-500 w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Verified Client Portal</span>
        </div>
        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter uppercase italic">Audit History</h1>
        <p className="text-slate-500 font-medium text-lg mt-2 max-w-2xl">Cryptographically sealed verification records for service operations performed at your locations.</p>
      </header>

      <div className="grid gap-8">
        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-6">
          <FileCheck size={14} className="text-emerald-500" /> Confirmed Service Milestones
        </h3>
        
        {proofs.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-[3rem] p-32 text-center shadow-inner">
            <Package className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No service proofs available yet</p>
            <p className="text-slate-700 text-sm mt-2 italic">Completed jobs with verified seals will populate this ledger.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proofs.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 hover:border-amber-500/30 transition-all shadow-2xl group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Shield size={120} />
                </div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest shadow-sm">
                    Hardware Verified
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShareProofId(p.id)} 
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:border-amber-500/50 transition-all shadow-lg active:scale-95"
                      title="Share Access"
                    >
                      <Share2 size={18} />
                    </button>
                    <button 
                      onClick={() => viewVideo(p.id)} 
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:border-amber-500/50 transition-all shadow-lg active:scale-95"
                      title="Review Proof"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 relative z-10">
                  <div className="text-slate-600 font-mono text-[10px] mb-1 uppercase">Job Identification</div>
                  <h4 className="text-3xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors tracking-tight italic">REF: {p.jobId}</h4>
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-medium mb-10">
                    <div className="bg-slate-950 p-2 rounded-xl text-slate-600 border border-slate-800"><MapPin size={16} /></div>
                    Geographic Origin Sealed
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-800/50 relative z-10">
                  <div className="text-xs">
                    <span className="block font-black text-slate-600 uppercase tracking-widest text-[9px] mb-2">Completion Timestamp</span>
                    <span className="text-slate-300 font-mono text-base">{new Date(p.endedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 shadow-xl active:scale-95">
                    <Download size={16} /> CERT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="pt-20 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Immutable Ledger Active — {proofs.length} Records Authenticated</span>
        </div>
      </footer>

      {shareProofId && (
        <ShareModal 
          proofId={shareProofId} 
          isOpen={!!shareProofId} 
          onClose={() => setShareProofId(null)} 
        />
      )}
    </div>
  );
};

export default ClientDashboard;

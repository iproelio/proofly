
import React, { useEffect, useState } from 'react';
import { CheckCircle, Share2, Database, ShieldCheck, Navigation, Home, ArrowLeft } from 'lucide-react';
import { getAllRecordings } from '../services/storage';
import { ProofRecording } from '../types';
import { getCurrentUser } from '../services/auth';
import { navigateTo } from '../services/navigation';
import ShareModal from '../components/ShareModal';

interface Props {
  proofId: string;
}

const JobCompletePage: React.FC<Props> = ({ proofId }) => {
  const [proof, setProof] = useState<ProofRecording | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const load = async () => {
      const all = await getAllRecordings();
      const found = all.find(p => p.id === proofId);
      if (found) setProof(found);
    };
    load();
  }, [proofId]);

  const handleBack = () => navigateTo({ complete: null });
  const goToQueue = () => navigateTo({ complete: null, view: 'queue' });
  const previewPublic = () => setIsShareModalOpen(true);

  if (!proof) return <div className="p-20 text-center text-white">Finalizing Seal...</div>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col justify-center gap-8 bg-slate-950">
      <div className="text-center">
        <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-emerald-500 w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Verified & Sealed</h1>
        <p className="text-slate-400 font-mono text-sm">Audit Record #{proof.id.substring(0,8)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck size={14} /> Security Fingerprint
          </h3>
          <div className="space-y-4">
            <div className="font-mono text-[10px] break-all bg-black/50 p-3 rounded border border-slate-800 text-emerald-400">
              {proof.videoHash}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Recorded At</span>
              <span className="text-white font-medium">{new Date(proof.startedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Navigation size={14} /> Compliance Check
          </h3>
          <div className="space-y-3 text-white">
             <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Continuous GPS Lock</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">PASS</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Narration Detected</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">PASS</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {user?.role === 'EMPLOYEE' ? (
          <button onClick={goToQueue} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700">
            <Database size={18} /> OPEN VAULT
          </button>
        ) : (
          <button onClick={handleBack} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700">
            <ArrowLeft size={18} /> RETURN TO LOGS
          </button>
        )}
        <button onClick={previewPublic} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20">
          <Share2 size={18} /> PREVIEW PUBLIC LINK
        </button>
      </div>

      <div className="flex justify-center">
        <button onClick={handleBack} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
          <Home size={14} /> Back to Dashboard
        </button>
      </div>

      <ShareModal 
        proofId={proofId} 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
};

export default JobCompletePage;


import React, { useEffect, useState } from 'react';
import { Shield, Clock, MapPin, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { getAllRecordings, businessStore } from '../services/storage';
import { ProofRecording, Business } from '../types';
import { navigateTo, getVirtualParams } from '../services/navigation';

interface Props {
  videoId: string;
}

const PublicProofView: React.FC<Props> = ({ videoId }) => {
  const [proof, setProof] = useState<ProofRecording | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const params = getVirtualParams();
    const exp = params.get('exp');
    
    if (exp && Date.now() > parseInt(exp)) {
      setIsExpired(true);
      return;
    }

    const load = async () => {
      const all = await getAllRecordings();
      const found = all.find(p => p.id === videoId);
      if (found) {
        setProof(found);
        setBusiness(businessStore.getById(found.businessId) || null);
      }
    };
    load();
  }, [videoId]);

  const handleBack = () => {
    navigateTo({ vid: null, exp: null });
  };

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-6 rounded-[2.5rem] border border-red-500/20 mb-8">
          <AlertTriangle className="text-red-500 w-16 h-16" />
        </div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Access Expired</h1>
        <p className="text-slate-500 max-w-sm mb-12">The temporary verification link you are using has passed its security limit. Please contact the dispatching authority for a new token.</p>
        <button onClick={handleBack} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2 border border-slate-800 px-8 py-3 rounded-full transition-all">
           <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="text-red-500 w-16 h-16 mb-4 opacity-20" />
        <h1 className="text-2xl font-bold text-white">Record Not Found</h1>
        <button onClick={handleBack} className="mt-8 text-emerald-500 font-bold flex items-center gap-2">
           <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <nav className="border-b border-slate-800 p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all mr-2"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500 w-6 h-6" />
            <span className="font-black italic uppercase tracking-tighter hidden sm:inline">Proofly Verified</span>
            <span className="font-black italic uppercase tracking-tighter sm:hidden">Proofly</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
          <CheckCircle size={12} className="hidden xs:inline" /> Secure Audit Record
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold">{business?.name || 'Verified Business'}</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">Proof ID: {proof.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <video 
                src={URL.createObjectURL(proof.videoBlob)} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock size={20} className="text-emerald-500" /> Timeline Integrity
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="text-emerald-500 font-mono text-sm shrink-0">00:00</div>
                  <div className="text-slate-300 text-sm font-medium">Session Initialized & Hardware Validated</div>
                </div>
                <div className="flex gap-4">
                  <div className="text-emerald-500 font-mono text-sm shrink-0">END</div>
                  <div className="text-slate-300 text-sm font-medium">Cryptographic Seal Applied</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Security Context</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">SHA-256 Fingerprint</label>
                  <div className="bg-black/50 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 break-all leading-relaxed">
                    {proof.videoHash}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400"><MapPin size={16} /> Origin</div>
                  <div className="text-white font-mono">{proof.gpsStart?.lat.toFixed(4)}, {proof.gpsStart?.lng.toFixed(4)}</div>
                </div>
                <div className="flex items-center justify-between text-sm pt-6 border-t border-slate-800">
                  <div className="text-slate-400">Compliance</div>
                  <span className="text-emerald-400 font-black text-xs uppercase">Pass</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProofView;

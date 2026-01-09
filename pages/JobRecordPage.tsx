
import React, { useState } from 'react';
import { SessionContext, RecorderState } from '../types';
import { useCanvasRecorder } from '../hooks/useCanvasRecorder';
import { useProofStorage } from '../hooks/useProofStorage';
import PreflightChecklist from '../components/PreflightChecklist';
import RecordingCanvas from '../components/RecordingCanvas';
import { AlertCircle, Loader2, StopCircle, ArrowLeft } from 'lucide-react';
import { navigateTo } from '../services/navigation';

interface Props {
  session: SessionContext;
}

const JobRecordPage: React.FC<Props> = ({ session }) => {
  const [ready, setReady] = useState(false);
  const { storeProof } = useProofStorage();

  const handleFinished = async (blob: Blob, metadata: any) => {
    const proof = await storeProof(session, blob, metadata);
    navigateTo({ record: null, complete: proof.id });
  };

  const handleBack = () => navigateTo({ record: null });

  const { start, stop, state, duration, currentGPS, canvasRef, videoRef } = useCanvasRecorder({
    session,
    onFinished: handleFinished
  });

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full text-center mb-8">
          <h1 className="text-3xl font-black mb-2 tracking-tight text-white uppercase italic">{session.business.name}</h1>
          <p className="text-slate-400">Secure Verification Terminal</p>
        </div>
        <PreflightChecklist onReady={() => setReady(true)} />
        <button 
          onClick={handleBack}
          className="mt-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Cancel & Return
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 bg-slate-950">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Verification Active
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-widest font-mono">
              Job: {session.job.id}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">{session.job.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-red-500">{formatTime(duration)}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Hard Stop at 03:00</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RecordingCanvas canvasRef={canvasRef} videoRef={videoRef} />
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            {state !== RecorderState.RECORDING ? (
              <button 
                onClick={start}
                className="bg-red-600 hover:bg-red-500 text-white px-12 py-4 rounded-full font-black text-xl shadow-xl shadow-red-900/40 transition-all transform active:scale-95"
              >
                RECORD PROOF
              </button>
            ) : (
              <button 
                onClick={stop}
                className="bg-white text-slate-900 px-12 py-4 rounded-full font-black text-xl shadow-xl transition-all transform active:scale-95 flex items-center gap-2"
              >
                <StopCircle /> FINISH & SEAL
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <StatusCard title="GPS LOCK" status={currentGPS ? 'STABLE' : 'SEARCHING'} active={!!currentGPS} detail={currentGPS ? `±${currentGPS.accuracy.toFixed(1)}m` : 'Wait for signal...'} />
          <StatusCard title="AUDIO" status="MANDATORY" active={state === RecorderState.RECORDING} detail="Narration Required" />
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mt-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold text-xs uppercase">
              <AlertCircle size={14} /> Compliance Protocol
            </div>
            <ul className="text-[11px] space-y-2 text-slate-400">
              <li>• Narration is mandatory.</li>
              <li>• Backgrounding app invalidates session.</li>
              <li>• GPS must remain active.</li>
            </ul>
          </div>
        </div>
      </div>

      {state === RecorderState.STOPPING && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Sealing Cryptographic Proof</h2>
            <p className="text-slate-400 text-sm mt-2">Finalising audit record...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusCard = ({ title, status, active, detail }: { title: string, status: string, active: boolean, detail: string }) => (
  <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</div>
    <div className={`text-lg font-black ${active ? 'text-emerald-400' : 'text-slate-400'}`}>{status}</div>
    <div className="text-xs text-slate-500 mt-1">{detail}</div>
  </div>
);

export default JobRecordPage;

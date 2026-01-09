
import React, { useEffect, useState } from 'react';
import { Database, Upload, Trash2, Clock, CheckCircle, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useProofStorage } from '../hooks/useProofStorage';
import { useProofUploader } from '../hooks/useProofUploader';
import { getSessionBusiness } from '../services/auth';
import { navigateTo } from '../services/navigation';
import { ProofRecording } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const OfflineQueuePage: React.FC = () => {
  const { recordings, fetchRecordings, removeProof } = useProofStorage();
  const business = getSessionBusiness();
  const { uploadProof, uploadAll, isAnyUploading } = useProofUploader(fetchRecordings);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const businessRecordings = recordings.filter(r => r.businessId === business?.id);
  const pendingCount = businessRecordings.filter(r => r.uploadStatus !== 'uploaded').length;

  const handleBack = () => navigateTo({ view: null });

  const confirmDelete = () => {
    if (deleteId) {
      removeProof(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto bg-slate-950">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tighter uppercase">
            <Database className="text-emerald-500" /> Proof Vault
          </h1>
          <p className="text-slate-400 text-sm font-medium">{business?.name} — Secure Local Cache</p>
        </div>
        <button 
          onClick={() => uploadAll(businessRecordings)}
          disabled={pendingCount === 0 || isAnyUploading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 uppercase italic tracking-tighter"
        >
          {isAnyUploading ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
          {isAnyUploading ? 'Synchronizing...' : `Sync ${pendingCount} to Cloud`}
        </button>
      </header>

      {businessRecordings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 border-dashed p-32 rounded-[2.5rem] text-center shadow-inner">
          <Database className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-30" />
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No verifiable proof currently vaulted</p>
          <p className="text-slate-700 text-sm mt-2 italic">Recorded field tasks will appear here for audit synchronization.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {businessRecordings.map(proof => (
            <div key={proof.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group shadow-xl hover:border-slate-700 transition-all">
              <div className="p-6 flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-white text-xl italic tracking-tighter uppercase">Ref: {proof.jobId}</span>
                    <StatusBadge status={proof.uploadStatus} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock size={14} className="text-slate-700" /> {new Date(proof.startedAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldBadge status={proof.failureFlags} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {proof.uploadStatus !== 'uploaded' && (
                    <button 
                      onClick={() => uploadProof(proof)}
                      disabled={proof.uploadStatus === 'uploading'}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all disabled:opacity-50"
                      title="Sync Proof"
                    >
                      <RefreshCw size={20} className={proof.uploadStatus === 'uploading' ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <button 
                    onClick={() => setDeleteId(proof.id)} 
                    disabled={proof.uploadStatus === 'uploading'}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all disabled:opacity-50"
                    title="Delete Permanently"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 flex justify-center">
         <button onClick={handleBack} className="text-slate-500 text-[10px] hover:text-white font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
           <ArrowLeft size={14} /> Return to Terminal Workspace
         </button>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Destroy Record?"
        message="This will permanently delete the cryptographically sealed proof from the local vault. This action cannot be undone."
        confirmLabel="Destroy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

const StatusBadge = ({ status }: { status: ProofRecording['uploadStatus'] }) => {
  const configs = {
    pending: { label: 'In Vault', icon: <Database size={10} />, color: 'bg-slate-800 text-slate-400 border-slate-700' },
    uploading: { label: 'Syncing...', icon: <RefreshCw size={10} className="animate-spin" />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    uploaded: { label: 'Synchronized', icon: <CheckCircle size={10} />, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    failed: { label: 'Sync Failed', icon: <AlertCircle size={10} />, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };

  const config = configs[status];

  return (
    <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
};

const ShieldBadge = ({ status }: { status: ProofRecording['failureFlags'] }) => {
  const hasIssues = Object.values(status).some(v => v === true);
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest ${hasIssues ? 'text-amber-500' : 'text-slate-600'}`}>
      Compliance: {hasIssues ? 'Warning Flags' : 'Clean Trace'}
    </span>
  );
};

export default OfflineQueuePage;

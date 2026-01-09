
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Camera, Mic, MapPin, AlertTriangle } from 'lucide-react';

interface Props {
  onReady: () => void;
}

const PreflightChecklist: React.FC<Props> = ({ onReady }) => {
  const [permissions, setPermissions] = useState({
    camera: false,
    mic: false,
    gps: false
  });
  const [loading, setLoading] = useState(true);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      // Basic check
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop());
      
      const pos = await new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(() => resolve(true), () => resolve(false));
      });

      setPermissions({ camera: true, mic: true, gps: pos });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const allReady = permissions.camera && permissions.mic && permissions.gps;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-emerald-400 w-8 h-8" />
        <h2 className="text-xl font-bold">Integrity Check</h2>
      </div>

      <div className="space-y-4 mb-8">
        <CheckItem icon={<Camera />} label="Camera Source" active={permissions.camera} />
        <CheckItem icon={<Mic />} label="Mandatory Audio" active={permissions.mic} />
        <CheckItem icon={<MapPin />} label="Continuous GPS" active={permissions.gps} />
      </div>

      {!allReady && !loading && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-6 flex items-start gap-3">
          <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">
            Missing required hardware permissions. Verification cannot proceed without camera, microphone, and location access.
          </p>
        </div>
      )}

      <button
        onClick={allReady ? onReady : checkPermissions}
        className={`w-full py-4 rounded-lg font-bold transition-all ${
          allReady 
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
            : 'bg-slate-700 text-slate-400'
        }`}
      >
        {loading ? 'Validating...' : allReady ? 'START VERIFICATION' : 'RETRY PERMISSIONS'}
      </button>
    </div>
  );
};

const CheckItem = ({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border ${active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/50'}`}>
    <div className="flex items-center gap-3">
      <span className={active ? 'text-emerald-400' : 'text-slate-500'}>{icon}</span>
      <span className={active ? 'text-emerald-50' : 'text-slate-400'}>{label}</span>
    </div>
    {active ? (
      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Secure</span>
    ) : (
      <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Required</span>
    )}
  </div>
);

export default PreflightChecklist;

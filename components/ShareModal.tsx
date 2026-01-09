
import React, { useState } from 'react';
import { X, Copy, Check, Clock, Shield, Link as LinkIcon } from 'lucide-react';

interface Props {
  proofId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<Props> = ({ proofId, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState('24');

  if (!isOpen) return null;

  const generateLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const expiresAt = Date.now() + (parseInt(expiryHours) * 60 * 60 * 1000);
    return `${baseUrl}?vid=${proofId}&exp=${expiresAt}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative animate-in zoom-in duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <div className="bg-emerald-600/20 p-3 rounded-2xl inline-block mb-4 border border-emerald-500/30">
            <LinkIcon className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Share Proof</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Generate a secure, expiring access link</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock size={12} /> Link Expiration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Hour', value: '1' },
                { label: '24 Hours', value: '24' },
                { label: '7 Days', value: '168' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExpiryHours(opt.value)}
                  className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                    expiryHours === opt.value
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> Access Token Sealed
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={generateLink()}
                className="flex-1 bg-transparent border-none text-slate-400 text-xs font-mono focus:ring-0 overflow-hidden text-ellipsis whitespace-nowrap"
              />
              <button 
                onClick={handleCopy}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-500 transition-all flex items-center gap-2 shrink-0"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic text-center">
            Once expired, this specific URL will no longer grant access to the video stream or audit logs.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl transition-all"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

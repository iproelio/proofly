
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-300">
        <button 
          onClick={onCancel} 
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 border ${
            isDanger ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{title}</h2>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onCancel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest shadow-lg ${
                isDanger 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

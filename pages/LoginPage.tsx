
import React from 'react';
import { Shield, User as UserIcon, Briefcase, Building2, ArrowLeft } from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { login } from '../services/auth';
import { User } from '../types';
import { navigateTo } from '../services/navigation';

const LoginPage: React.FC = () => {
  const handleLogin = (user: User) => {
    login(user);
    // After mock login, go to the mock business terminal
    navigateTo({ bid: user.businessId, view: null });
  };

  const handleBack = () => navigateTo({ view: null });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
      <div className="absolute top-8 left-8">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Platform Home
        </button>
      </div>

      <div className="mb-12 text-center">
        <div className="bg-emerald-600 p-4 rounded-2xl inline-block mb-4 shadow-xl shadow-emerald-900/20">
          <Shield className="text-white w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Identity Portal</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a mock persona to explore the environment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <RoleCard 
          title="Administrator"
          description="Manage jobs, field staff, and verification audits."
          icon={<Briefcase className="w-8 h-8" />}
          user={MOCK_USERS[0]}
          onClick={() => handleLogin(MOCK_USERS[0])}
          color="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
        />
        <RoleCard 
          title="Field Operator"
          description="Capture non-editable proof and upload to the vault."
          icon={<UserIcon className="w-8 h-8" />}
          user={MOCK_USERS[1]}
          onClick={() => handleLogin(MOCK_USERS[1])}
          color="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
        />
        <RoleCard 
          title="Client"
          description="Access a ledger of verified service milestones."
          icon={<Building2 className="w-8 h-8" />}
          user={MOCK_USERS[2]}
          onClick={() => handleLogin(MOCK_USERS[2])}
          color="border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
        />
      </div>

      <footer className="mt-20 text-slate-600 text-[10px] font-black uppercase tracking-widest">
        Hardware Attestation Layer: <span className="text-emerald-500">Bypassed for Demo</span>
      </footer>
    </div>
  );
};

const RoleCard = ({ title, description, icon, user, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`bg-slate-900 border ${color} p-8 rounded-3xl text-left transition-all group hover:scale-[1.02] shadow-xl flex flex-col h-full`}
  >
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">{description}</p>
    <div className="pt-6 border-t border-slate-800 mt-auto">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Identity Profile</div>
      <div className="text-white font-black text-xs uppercase italic">{user.name}</div>
    </div>
  </button>
);

export default LoginPage;


import React, { useState } from 'react';
import { Shield, Building, UserPlus, ArrowRight, CheckCircle, Image as ImageIcon, Briefcase, User as UserIcon, Building2, LogOut, Zap, LayoutDashboard, Database, Search } from 'lucide-react';
import { Business, User } from '../types';
import { businessStore, userStore } from '../services/storage';
import { getCurrentUser, logout } from '../services/auth';
import { navigateTo } from '../services/navigation';

interface Props {
  business?: Business;
  empid?: string;
}

const LandingPage: React.FC<Props> = ({ business, empid }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    company: '',
    logoUrl: '' 
  });

  const currentUser = getCurrentUser();

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const bid = `comp-${Math.random().toString(36).substr(2, 6)}`;
      const newBusiness: Business = {
        id: bid,
        name: formData.company,
        email: formData.email,
        logo: formData.logoUrl || undefined,
        createdAt: Date.now()
      };
      
      const adminUser: User = {
        id: `admin-${bid}`,
        name: formData.name,
        role: 'ADMIN',
        businessId: bid,
        email: formData.email
      };

      businessStore.save(newBusiness);
      userStore.save(adminUser);
      login(adminUser);
      navigateTo({ bid });
    } catch (err) {
      console.error("Signup failure:", err);
      setIsSubmitting(false);
      alert("Registration failed. Please ensure local storage is enabled.");
    }
  };

  const handleRoleLogin = (role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT') => {
    if (!business) return;
    const users = userStore.getByBusiness(business.id);
    let targetUser = users.find(u => u.role === role);

    if (!targetUser) {
      targetUser = {
        id: `${role.toLowerCase()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${business.name} ${role === 'ADMIN' ? 'Admin' : role === 'EMPLOYEE' ? 'Staff' : 'Client'}`,
        role: role,
        businessId: business.id
      };
      userStore.save(targetUser);
    }

    login(targetUser);
    navigateTo({ bid: business.id });
  };

  const login = (user: User) => {
    localStorage.setItem('proofly_session_v4', JSON.stringify(user));
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const resumeSession = () => {
    if (currentUser) {
      navigateTo({ bid: currentUser.businessId });
    }
  };

  // --- LOGGED IN VIEW (Platform Home) ---
  if (currentUser && !business) {
    const userBusiness = businessStore.getById(currentUser.businessId);
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500 w-8 h-8" />
            <span className="text-2xl font-black italic uppercase tracking-tighter">Proofly</span>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-2">
            <LogOut size={14} /> End Session
          </button>
        </nav>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap size={12} className="fill-emerald-400" /> Active Session
              </div>
              <h1 className="text-5xl font-black mb-4 leading-tight tracking-tighter">Welcome back,<br/><span className="text-emerald-500 italic uppercase">{currentUser.name.split(' ')[0]}</span></h1>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                You are currently signed into the <strong>{userBusiness?.name || 'Authorized'}</strong> verification terminal.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <QuickAction 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dashboard" 
                  onClick={resumeSession}
                  color="bg-emerald-600 hover:bg-emerald-500"
                />
                {currentUser.role === 'ADMIN' && (
                  <QuickAction 
                    icon={<ArrowRight size={18} />} 
                    label="Dispatch" 
                    onClick={() => navigateTo({ bid: currentUser.businessId, 'create-job': 'true' })}
                    color="bg-slate-800 hover:bg-slate-700"
                  />
                )}
                {currentUser.role === 'EMPLOYEE' && (
                  <QuickAction 
                    icon={<Database size={18} />} 
                    label="Vault" 
                    onClick={() => navigateTo({ bid: currentUser.businessId, view: 'queue' })}
                    color="bg-slate-800 hover:bg-slate-700"
                  />
                )}
                {currentUser.role === 'CLIENT' && (
                  <QuickAction 
                    icon={<Search size={18} />} 
                    label="Ledger" 
                    onClick={resumeSession}
                    color="bg-slate-800 hover:bg-slate-700"
                  />
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-500 text-center overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
               <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-800 shadow-inner">
                 {currentUser.role === 'ADMIN' && <Briefcase className="text-blue-400 w-10 h-10" />}
                 {currentUser.role === 'EMPLOYEE' && <UserIcon className="text-emerald-400 w-10 h-10" />}
                 {currentUser.role === 'CLIENT' && <Building2 className="text-amber-400 w-10 h-10" />}
               </div>
               <h2 className="text-xl font-bold text-white mb-2">{currentUser.name}</h2>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">{currentUser.role} AT {userBusiness?.name}</div>
               
               <button 
                onClick={resumeSession}
                className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all text-lg active:scale-95 shadow-xl"
               >
                 RESUME WORKSPACE <ArrowRight size={22} />
               </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- TERMINAL VIEW ---
  if (business) {
    if (currentUser && currentUser.businessId === business.id) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="mb-6">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                 <Shield className="text-emerald-500 w-10 h-10" />
               </div>
               <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Session Active</h1>
               <p className="text-slate-500 text-sm mt-1">Authenticated at {business.name}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-8">
               <div className="text-white font-bold">{currentUser.name}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{currentUser.role}</div>
            </div>
            <button 
              onClick={resumeSession}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-emerald-900/20 mb-4"
            >
              ENTER WORKSPACE <ArrowRight size={18} />
            </button>
            <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">Sign Out of Terminal</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          
          <div className="text-center mb-8">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-slate-700 shadow-md" />
            ) : (
              <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
                <Shield className="text-white w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Terminal Access</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">{business.name}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
             <RoleSelectorButton 
               onClick={() => handleRoleLogin('ADMIN')} 
               icon={<Briefcase size={20} />} 
               label="Administrator" 
               sub="System Control" 
               color="text-blue-400 bg-blue-500/10 border-blue-500/20" 
             />
             <RoleSelectorButton 
               onClick={() => handleRoleLogin('EMPLOYEE')} 
               icon={<UserIcon size={20} />} 
               label="Field Operator" 
               sub="Proof Capture" 
               color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
             />
             <RoleSelectorButton 
               onClick={() => handleRoleLogin('CLIENT')} 
               icon={<Building2 size={20} />} 
               label="Client Portal" 
               sub="Audit Review" 
               color="text-amber-400 bg-amber-500/10 border-amber-500/20" 
             />
          </div>
          
          <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Hardware Encryption Layer: <span className="text-emerald-500">ACTIVE</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="text-emerald-500 w-8 h-8" />
          <span className="text-2xl font-black italic uppercase tracking-tighter">Proofly</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => navigateTo({ view: 'login' })}
             className="text-[10px] font-black text-white bg-slate-800 hover:bg-slate-700 transition-colors uppercase tracking-widest px-4 py-2 rounded-full"
          >
            Demo Login
          </button>
          <button 
             onClick={() => {
               const bidInput = prompt('Terminal ID:');
               if (bidInput) navigateTo({ bid: bidInput });
             }} 
             className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-full"
          >
            Enter BID
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-20 items-center">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-6xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tighter">
            Verified Proof for <br/><span className="text-emerald-500 italic uppercase">Service Teams.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-lg leading-relaxed font-medium">
            Deploy non-editable, geo-verified job records. Audit-grade trust for service and maintenance providers.
          </p>
          <div className="space-y-4">
            <FeatureItem text="Sealed Video Evidence" />
            <FeatureItem text="GPS/Time Timestamping" />
            <FeatureItem text="Audit-Compliant Logs" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-500">
          <div className="absolute -top-6 -right-6 bg-emerald-600 text-white p-6 rounded-full shadow-xl">
            <Building size={32} />
          </div>
          
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter italic">Register Platform</h2>
          <form onSubmit={handleRegisterBusiness} className="space-y-5">
            <input 
              type="text" required placeholder="Business Name"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:outline-none font-medium placeholder:text-slate-800"
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
            />
            <input 
              type="text" required placeholder="System Admin Name"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:outline-none font-medium placeholder:text-slate-800"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              type="email" required placeholder="Admin Email"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:outline-none font-medium placeholder:text-slate-800"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <button 
              disabled={isSubmitting}
              className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all text-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'DEPLOYING...' : 'DEPLOY TERMINAL'} <UserPlus size={22} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-slate-300 font-bold">
    <div className="bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
      <CheckCircle className="text-emerald-500" size={18} />
    </div>
    {text}
  </div>
);

const QuickAction = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center gap-2 ${color} text-white font-black py-4 px-4 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest`}
  >
    {icon} {label}
  </button>
);

const RoleSelectorButton = ({ onClick, icon, label, sub, color }: { onClick: () => void, icon: React.ReactNode, label: string, sub: string, color: string }) => (
  <button onClick={onClick} className={`flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:border-blue-500/50 transition-all text-left group`}>
    <div className={`p-2 rounded-lg transition-all group-hover:scale-110 ${color}`}>{icon}</div>
    <div>
      <div className="text-white font-bold text-sm">{label}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub}</div>
    </div>
  </button>
);

export default LandingPage;

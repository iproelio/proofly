
import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Database, 
  History, 
  LogOut, 
  Briefcase,
  X
} from 'lucide-react';
import { User, Business } from '../types';
import { logout } from '../services/auth';
import { navigateTo } from '../services/navigation';

interface SidebarProps {
  user: User;
  business?: Business;
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, business, activeView, isOpen, onClose }) => {
  const handleLogout = () => {
    logout();
    navigateTo({ bid: null, view: null, 'create-job': null, record: null, complete: null });
  };

  const isAdmin = user.role === 'ADMIN';
  const isEmployee = user.role === 'EMPLOYEE';
  const isClient = user.role === 'CLIENT';

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-emerald-500 w-6 h-6" />
              <span className="text-xl font-black italic uppercase tracking-tighter text-white">Proofly</span>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[140px]">
              {business?.name || 'Authorized Terminal'}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {isAdmin && (
            <>
              <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label="Audit Logs" 
                active={activeView === 'logs' || activeView === 'default'} 
                onClick={() => { navigateTo({ view: 'logs', 'create-job': null }); onClose(); }} 
              />
              <NavItem 
                icon={<PlusCircle size={18} />} 
                label="Create Job" 
                active={activeView === 'create-job'} 
                onClick={() => { navigateTo({ 'create-job': 'true', view: null }); onClose(); }} 
              />
              <NavItem 
                icon={<Users size={18} />} 
                label="Staff Management" 
                active={activeView === 'staff'} 
                onClick={() => { navigateTo({ view: 'staff', 'create-job': null }); onClose(); }} 
              />
            </>
          )}

          {isEmployee && (
            <>
              <NavItem 
                icon={<Briefcase size={18} />} 
                label="My Tasks" 
                active={activeView === 'tasks' || activeView === 'default'} 
                onClick={() => { navigateTo({ view: 'tasks' }); onClose(); }} 
              />
              <NavItem 
                icon={<Database size={18} />} 
                label="Vault" 
                active={activeView === 'queue'} 
                onClick={() => { navigateTo({ view: 'queue' }); onClose(); }} 
              />
            </>
          )}

          {isClient && (
            <>
              <NavItem 
                icon={<History size={18} />} 
                label="Audit History" 
                active={activeView === 'history' || activeView === 'default'} 
                onClick={() => { navigateTo({ view: 'history' }); onClose(); }} 
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-4 bg-slate-950/50 border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400 uppercase">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold border ${
      active 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default Sidebar;


import React, { useEffect, useState, useMemo } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ClientDashboard from './pages/ClientDashboard';
import PublicProofView from './pages/PublicProofView';
import JobRecordPage from './pages/JobRecordPage';
import JobCompletePage from './pages/JobCompletePage';
import OfflineQueuePage from './pages/OfflineQueuePage';
import JobCreationPage from './pages/JobCreationPage';
import Sidebar from './components/Sidebar';
import { getCurrentUser } from './services/auth';
import { businessStore, jobStore } from './services/storage';
import { clearAllParams, getVirtualParams } from './services/navigation';
import { Shield, AlertCircle, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [navKey, setNavKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const params = useMemo(() => getVirtualParams(), [navKey]);
  
  useEffect(() => {
    const handleNav = () => setNavKey(prev => prev + 1);
    window.addEventListener('popstate', handleNav);
    window.addEventListener('proofly-nav', handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('proofly-nav', handleNav);
    };
  }, []);

  const vid = params.get('vid');
  const bid = params.get('bid');
  const empid = params.get('empid');
  const recordJobId = params.get('record');
  const completeId = params.get('complete');
  const view = params.get('view');
  const createJob = params.get('create-job') === 'true';

  const user = getCurrentUser();

  // 1. Standalone Public View (Proof Sharing)
  if (vid) {
    return <PublicProofView videoId={vid} />;
  }

  // 2. Global Mock Login View (For testing/demo)
  if (view === 'login') {
    return <LoginPage />;
  }

  // 3. Business Context View (Terminal)
  if (bid) {
    const activeBusiness = businessStore.getById(bid);
    
    if (!activeBusiness) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Entity Unknown</h1>
          <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
            The terminal ID <code>{bid}</code> is not recognized. If you just registered, the storage may still be initializing.
          </p>
          <button 
            onClick={() => clearAllParams()} 
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Return to Homepage
          </button>
        </div>
      );
    }

    // Security: Check if user belongs to this business
    if (user && user.businessId !== bid) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <Shield className="text-amber-500 w-12 h-12 mb-4" />
          <h1 className="text-xl font-black text-white uppercase italic mb-4">Mismatched Terminal</h1>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            Your active session is tied to another organization. Please sign out of your current session to enter the <strong>{activeBusiness.name}</strong> terminal.
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }} 
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-red-900/20"
          >
            Sign Out & Continue
          </button>
        </div>
      );
    }

    // Authenticated Routes
    if (user) {
      // Special views that don't need a sidebar (immersive/active capture)
      if (recordJobId && user.role === 'EMPLOYEE') {
        const job = jobStore.getById(recordJobId);
        if (job) return <JobRecordPage session={{ job, employee: user, business: activeBusiness, serverTime: Date.now() }} />;
      }
      if (completeId) {
        return <JobCompletePage proofId={completeId} />;
      }

      // Main Shell wrapping with Role-Based Sidebar
      return (
        <div className="flex flex-col lg:flex-row h-screen bg-slate-950 overflow-hidden relative">
          <Sidebar 
            user={user} 
            business={activeBusiness} 
            activeView={createJob ? 'create-job' : (view || 'default')}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="text-emerald-500 w-6 h-6" />
                <span className="text-lg font-black italic uppercase tracking-tighter text-white">Proofly</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar relative">
              {user.role === 'ADMIN' && (
                <>
                  {createJob && <JobCreationPage business={activeBusiness} />}
                  {(!createJob && (view === 'logs' || !view)) && <AdminDashboard user={user} business={activeBusiness} subview="logs" />}
                  {(!createJob && view === 'staff') && <AdminDashboard user={user} business={activeBusiness} subview="staff" />}
                </>
              )}

              {user.role === 'EMPLOYEE' && (
                <>
                  {view === 'queue' ? <OfflineQueuePage /> : <EmployeeDashboard user={user} business={activeBusiness} />}
                </>
              )}

              {user.role === 'CLIENT' && (
                <ClientDashboard user={user} />
              )}
            </main>
          </div>
        </div>
      );
    }

    // Not logged in but inside business context -> Business Landing (Login/Role Selection)
    return <LandingPage business={activeBusiness} empid={empid || undefined} />;
  }

  // 4. Platform Home (Default Landing/Registration)
  return <LandingPage />;
};

export default App;

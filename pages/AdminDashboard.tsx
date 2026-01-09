
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BarChart3, 
  Search, 
  Clock, 
  CheckCircle, 
  ExternalLink, 
  Activity, 
  Copy, 
  AlertCircle, 
  MessageSquare, 
  X, 
  Smartphone,
  Shield,
  Share2,
  MapPin,
  Building2,
  Trash2,
  Briefcase
} from 'lucide-react';
import { User, ProofRecording, Job, Business } from '../types';
import { getAllRecordings, userStore, jobStore, deleteRecording } from '../services/storage';
import { navigateTo } from '../services/navigation';
import ShareModal from '../components/ShareModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface Props {
  user: User;
  business: Business;
  subview: 'logs' | 'staff' | 'jobs';
}

// Added missing StatCard component
const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  </div>
);

// Added missing TabButton component
const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
      active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />}
  </button>
);

const AdminDashboard: React.FC<Props> = ({ user, business, subview }) => {
  const [proofs, setProofs] = useState<ProofRecording[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', phone: '' });

  const [shareProofId, setShareProofId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteProofId, setDeleteProofId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const allP = await getAllRecordings();
      setProofs(allP.filter(p => p.businessId === business.id));
      setEmployees(userStore.getByBusiness(business.id).filter(u => u.role === 'EMPLOYEE'));
      setAllJobs(jobStore.getByBusiness(business.id));
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Unable to sync with local audit vault.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [business.id, subview]);

  const copyInvite = (empId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?bid=${business.id}&empid=${empId}`;
    navigator.clipboard.writeText(url);
    alert('Employee Terminal Link Copied!');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `emp-${Math.random().toString(36).substr(2, 5)}`;
    const newEmployee: User = {
      id,
      name: inviteForm.name,
      phone: inviteForm.phone,
      role: 'EMPLOYEE',
      businessId: business.id,
      inviteStatus: 'SENT'
    };
    userStore.save(newEmployee);
    setInviteForm({ name: '', phone: '' });
    setIsInviteModalOpen(false);
    fetchData();
    
    const inviteUrl = `${window.location.origin}${window.location.pathname}?bid=${business.id}&empid=${id}`;
    console.log(`[SMS Simulation] Sending to ${newEmployee.phone}: Welcome ${newEmployee.name}! Access: ${inviteUrl}`);
    alert(`Invitation sent to ${newEmployee.phone}!`);
  };

  const handleDeleteJob = () => {
    if (deleteJobId) {
      const currentJobs = jobStore.getAll();
      const filtered = currentJobs.filter(j => j.id !== deleteJobId);
      localStorage.setItem('proofly_jobs_v4', JSON.stringify(filtered));
      setDeleteJobId(null);
      fetchData();
    }
  };

  const handleDeleteProof = async () => {
    if (deleteProofId) {
      await deleteRecording(deleteProofId);
      setDeleteProofId(null);
      fetchData();
    }
  };

  const viewVideo = (vid: string) => navigateTo({ vid });

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Vault Connection Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {subview === 'logs' ? 'Audit Records' : subview === 'staff' ? 'Staff Directory' : 'Job Management'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">Organization ID: {business.id}</p>
        </div>
        <div className="flex gap-3">
          {subview === 'staff' && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 text-sm"
            >
              <Smartphone size={18} /> DISPATCH INVITE
            </button>
          )}
          {subview === 'jobs' && (
            <button 
              onClick={() => navigateTo({ 'create-job': 'true' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-sm"
            >
              <Briefcase size={18} /> CREATE JOB
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<CheckCircle className="text-emerald-400" />} label="Sealed Proofs" value={proofs.length} />
        <StatCard icon={<Clock className="text-amber-400" />} label="Active Assignments" value={allJobs.filter(j => j.status === 'PENDING').length} />
        <StatCard icon={<Users className="text-blue-400" />} label="Operators" value={employees.length} />
        <StatCard icon={<BarChart3 className="text-purple-400" />} label="Integrity Score" value="100%" />
      </div>

      <nav className="flex gap-2 border-b border-slate-800 pb-px">
        <TabButton active={subview === 'logs'} onClick={() => navigateTo({ view: 'logs' })} label="Verification Logs" />
        <TabButton active={subview === 'jobs'} onClick={() => navigateTo({ view: 'jobs' })} label="Job Pipeline" />
        <TabButton active={subview === 'staff'} onClick={() => navigateTo({ view: 'staff' })} label="Field Staff" />
      </nav>

      {subview === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  <th className="px-8 py-4">Client / Job</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4">Operator</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {proofs.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-600 italic">No verification records synced yet.</td></tr>
                ) : (
                  proofs.map(p => {
                    const job = allJobs.find(j => j.id === p.jobId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="text-white font-bold">{job?.clientName || 'Project'}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {p.jobId}</div>
                        </td>
                        <td className="px-8 py-6 text-slate-400 text-xs">
                          {job?.location || 'Remote'}
                        </td>
                        <td className="px-8 py-6 text-slate-400 text-xs">
                          {employees.find(e => e.id === p.employeeId)?.name || p.employeeId}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => setShareProofId(p.id)} className="p-2 text-slate-500 hover:text-emerald-400 transition-all"><Share2 size={16} /></button>
                            <button onClick={() => viewVideo(p.id)} className="p-2 text-slate-500 hover:text-white transition-all"><ExternalLink size={16} /></button>
                            <button onClick={() => setDeleteProofId(p.id)} className="p-2 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subview === 'jobs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4">Assigned To</th>
                  <th className="px-8 py-4 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allJobs.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-600 italic">Queue is empty.</td></tr>
                ) : (
                  allJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tight ${
                          job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>{job.status}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-white font-bold">{job.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{job.location}</div>
                      </td>
                      <td className="px-8 py-6 text-slate-400 text-xs">
                        {employees.find(e => e.id === job.assignedEmployeeId)?.name || 'Unassigned'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setDeleteJobId(job.id)} 
                          className="p-2 text-slate-600 hover:text-red-500 transition-all group-hover:bg-red-500/5 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subview === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(emp => (
            <div key={emp.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-blue-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-black text-blue-400">
                  {emp.name[0]}
                </div>
                <div className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tight ${
                  emp.inviteStatus === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {emp.inviteStatus || 'OFFLINE'}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{emp.name}</h3>
              <p className="text-slate-500 text-xs mb-6">{emp.phone || emp.email || 'No contact provided'}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyInvite(emp.id)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> Link
                </button>
                <button className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-600 hover:text-red-500 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareProofId && (
        <ShareModal 
          proofId={shareProofId} 
          isOpen={!!shareProofId} 
          onClose={() => setShareProofId(null)} 
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteJobId}
        title="Delete Job?"
        message="This will permanently remove the job assignment from the pipeline. This cannot be undone."
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteJobId(null)}
      />

      <ConfirmationModal
        isOpen={!!deleteProofId}
        title="Destroy Record?"
        message="This will permanently delete the sealed proof. This action is irreversible."
        onConfirm={handleDeleteProof}
        onCancel={() => setDeleteProofId(null)}
      />

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">New Operator</h2>
            <p className="text-slate-500 text-sm mb-6">Authorize a new field staff member.</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <input 
                type="text" required placeholder="Full Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-800"
                value={inviteForm.name}
                onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
              />
              <input 
                type="tel" required placeholder="Phone Number"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-800"
                value={inviteForm.phone}
                onChange={e => setInviteForm({...inviteForm, phone: e.target.value})}
              />
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-900/20 uppercase text-xs tracking-widest">
                SEND INVITE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Added missing default export
export default AdminDashboard;

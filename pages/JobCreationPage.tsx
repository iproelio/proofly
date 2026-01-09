
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, MapPin, FileText, User, Sparkles } from 'lucide-react';
import { Business, User as UserType } from '../types';
import { userStore, jobStore } from '../services/storage';
import { navigateTo } from '../services/navigation';

interface Props {
  business: Business;
}

const JobCreationPage: React.FC<Props> = ({ business }) => {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    location: '',
    description: '',
    employee: ''
  });

  useEffect(() => {
    const emps = userStore.getByBusiness(business.id).filter(u => u.role === 'EMPLOYEE');
    setEmployees(emps);
    if (emps.length > 0) setFormData(prev => ({...prev, employee: emps[0].id}));
  }, [business.id]);

  const handleBack = () => navigateTo({ 'create-job': null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate slight delay for effect
    await new Promise(r => setTimeout(r, 600));

    const jid = `JOB-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    jobStore.save({
      id: jid,
      businessId: business.id,
      clientName: formData.clientName,
      clientId: `CL-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      assignedEmployeeId: formData.employee,
      location: formData.location,
      description: formData.description,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    setIsSubmitting(false);
    handleBack();
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={handleBack} className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">New Dispatch</h1>
          <p className="text-slate-500 text-sm font-medium">Authorising field verification task</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Client Information</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-slate-700 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Client or Project Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-all font-medium placeholder:text-slate-800"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Service Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-slate-700 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Street Address, City, Site"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-all font-medium placeholder:text-slate-800"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Verification Instructions</label>
              <textarea 
                required
                placeholder="Detail the required proof actions (e.g. 'Record seal intact, then narrate delivery check')"
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-500 focus:outline-none transition-all font-medium placeholder:text-slate-800 resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Field Operator Assignment</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-700 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-blue-500 focus:outline-none transition-all font-medium appearance-none"
                  value={formData.employee}
                  onChange={e => setFormData({...formData, employee: e.target.value})}
                >
                  {employees.length === 0 && <option value="">No Operators Registered</option>}
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-slate-700">
                  <ArrowLeft className="rotate-[270deg] w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || employees.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-lg uppercase italic tracking-tighter"
        >
          {isSubmitting ? 'GENERATING TOKEN...' : (
            <>AUTHORISE DISPATCH <Sparkles size={20} /></>
          )}
        </button>
      </form>
      
      <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
        Immutable Job ID will be generated upon confirmation
      </p>
    </div>
  );
};

export default JobCreationPage;

import React, { useEffect, useState } from 'react';
import { garageService } from '../services/garageService';
import { Job, JobStatus, User } from '../types';
import { SERVICE_MENU } from '../constants';
import StatusBadge from '../components/StatusBadge';
import { Calendar, Plus, Car, History, Clock } from 'lucide-react';

interface CustomerViewProps {
  user: User;
}

const CustomerView: React.FC<CustomerViewProps> = ({ user }) => {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [showBooking, setShowBooking] = useState(false);

  // Helper to get local date string YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Booking Form State
  const [formData, setFormData] = useState({
    carModel: '',
    licensePlate: '',
    serviceId: '',
    scheduledDate: getTodayString(),
    selectedSlot: 0
  });

  const [availableSlots, setAvailableSlots] = useState<number[]>([]);

  useEffect(() => {
    loadData();
    const unsub = garageService.subscribe('change', loadData);
    return unsub;
  }, []);

  // Effect to recalculate slots when Date or Service changes
  useEffect(() => {
    if (formData.scheduledDate && formData.serviceId) {
        const service = SERVICE_MENU.find(s => s.id === formData.serviceId);
        if (service) {
            const slots = garageService.findAvailableSlots(formData.scheduledDate, service.duration);
            setAvailableSlots(slots);
            setFormData(prev => ({...prev, selectedSlot: 0})); // Reset slot on change
        }
    } else {
        setAvailableSlots([]);
    }
  }, [formData.scheduledDate, formData.serviceId]);

  const loadData = () => {
    if (user) {
        setMyJobs(garageService.getJobsByCustomer(user.id));
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.selectedSlot) return;

    const service = SERVICE_MENU.find(s => s.id === formData.serviceId);
    if (!service) return;

    garageService.addJob({
        ownerName: user.name,
        customerId: user.id,
        carModel: formData.carModel,
        licensePlate: formData.licensePlate,
        serviceDescription: service.name,
        estimatedDurationHours: service.duration,
        scheduledTime: formData.selectedSlot
    });

    setShowBooking(false);
    setFormData({ 
        carModel: '', 
        licensePlate: '', 
        serviceId: '', 
        scheduledDate: getTodayString(), 
        selectedSlot: 0 
    });
  };

  const activeJobs = myJobs.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED);
  const historyJobs = myJobs.filter(j => j.status === JobStatus.COMPLETED || j.status === JobStatus.CANCELLED);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name.split(' ')[0]}</h1>
            <p className="text-slate-500">Manage your vehicle services</p>
        </div>
        <button 
            onClick={() => setShowBooking(!showBooking)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
        >
            {showBooking ? 'Cancel Booking' : <><Plus size={18}/> Book Service</>}
        </button>
      </div>

      {showBooking && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 animate-slide-up">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600"/> Request New Appointment
            </h2>
            <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Details</label>
                    <div className="space-y-3">
                         <input required type="text" className="w-full border p-2.5 rounded-lg text-sm" placeholder="Car Model (e.g. Honda Civic)" value={formData.carModel} onChange={e=>setFormData({...formData, carModel: e.target.value})}/>
                         <input required type="text" className="w-full border p-2.5 rounded-lg text-sm" placeholder="License Plate" value={formData.licensePlate} onChange={e=>setFormData({...formData, licensePlate: e.target.value})}/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                    <select 
                        required 
                        className="w-full border p-2.5 rounded-lg text-sm bg-white"
                        value={formData.serviceId}
                        onChange={e => setFormData({...formData, serviceId: e.target.value})}
                    >
                        <option value="">-- Select Service --</option>
                        {SERVICE_MENU.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.duration} hrs)</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Date & Time</label>
                    <input 
                        required 
                        type="date" 
                        min={getTodayString()}
                        className="w-full border p-2.5 rounded-lg text-sm mb-4" 
                        value={formData.scheduledDate} 
                        onChange={e=>setFormData({...formData, scheduledDate: e.target.value})}
                    />

                    {formData.serviceId && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Available Slots</h4>
                             {availableSlots.length > 0 ? (
                                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                     {availableSlots.map(slot => (
                                         <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData({...formData, selectedSlot: slot})}
                                            className={`px-2 py-2 text-xs font-medium rounded border transition-all ${
                                                formData.selectedSlot === slot 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                         >
                                             {new Date(slot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </button>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="text-center text-slate-400 text-sm py-2">
                                     No slots available for this duration on selected date. Try another day.
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="col-span-1 md:col-span-2 pt-2">
                    <button 
                        type="submit" 
                        disabled={!formData.selectedSlot}
                        className={`w-full py-3 rounded-lg font-bold transition-colors ${
                            formData.selectedSlot 
                            ? 'bg-slate-900 text-white hover:bg-slate-800' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Confirm Booking
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Active Services */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2"><Car size={20}/> Active & Upcoming</h2>
        <div className="grid gap-4">
            {activeJobs.map(job => (
                <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg text-slate-900">{job.carModel}</span>
                            <StatusBadge status={job.status} />
                        </div>
                        <p className="text-slate-600">{job.serviceDescription}</p>
                        {job.status === JobStatus.SCHEDULED && job.scheduledTime && (
                            <p className="text-sm text-blue-600 mt-1 font-medium flex items-center gap-1">
                                <Clock size={14} /> Scheduled: {new Date(job.scheduledTime).toLocaleDateString()} at {new Date(job.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        )}
                        {job.status === JobStatus.IN_PROGRESS && (
                            <p className="text-sm text-emerald-600 mt-1 font-medium">
                                Currently being serviced in Bay {job.bayId}
                            </p>
                        )}
                    </div>
                </div>
            ))}
            {activeJobs.length === 0 && <p className="text-slate-400 italic">No active services.</p>}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2"><History size={20}/> Service History</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Service</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {historyJobs.map(job => (
                        <tr key={job.id}>
                            <td className="px-6 py-3 text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-3 font-medium">{job.carModel}</td>
                            <td className="px-6 py-3">{job.serviceDescription}</td>
                            <td className="px-6 py-3"><StatusBadge status={job.status} /></td>
                        </tr>
                    ))}
                    {historyJobs.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400">No history found.</td></tr>
                    )}
                </tbody>
             </table>
        </div>
      </section>
    </div>
  );
};

export default CustomerView;
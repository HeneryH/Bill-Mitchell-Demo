import React, { useEffect, useState } from 'react';
import { garageService } from '../services/garageService';
import { Job, JobStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Clock, CheckCircle, AlertCircle, PlayCircle, Plus, Calendar, ArrowRight, LayoutGrid } from 'lucide-react';
import NewJobModal from '../components/NewJobModal';
import ScheduleTimeline from '../components/ScheduleTimeline';

const ManagerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');

  useEffect(() => {
    loadData();
    const unsubscribe = garageService.subscribe('change', loadData);
    return unsubscribe;
  }, []);

  const loadData = () => {
    setJobs(garageService.getAllJobs());
    setScheduledJobs(garageService.getScheduledJobs());
  };

  const assignScheduledJob = (jobId: string, bayId: number) => {
    garageService.updateJobDetails(jobId, { bayId });
    garageService.updateJobStatus(jobId, JobStatus.QUEUED);
  };

  const stats = garageService.getBayStats();

  const statusData = [
    { name: 'Active', value: stats.active, color: '#3B82F6' },
    { name: 'Queued', value: stats.queued, color: '#94A3B8' },
    { name: 'On Hold', value: stats.onHold, color: '#F59E0B' },
    { name: 'Completed', value: stats.completed, color: '#10B981' },
  ].filter(d => d.value > 0);

  const bayEfficiencyData = Array.from({length: 5}, (_, i) => {
    const bayId = i + 1;
    const bayJobs = jobs.filter(j => j.bayId === bayId);
    
    // Filter completed jobs to only show those completed TODAY
    const completedTodayCount = bayJobs.filter(j => {
        if (j.status !== JobStatus.COMPLETED) return false;
        if (!j.completedAt) return false;
        
        const jobDate = new Date(j.completedAt);
        const today = new Date();
        
        return jobDate.getDate() === today.getDate() &&
               jobDate.getMonth() === today.getMonth() &&
               jobDate.getFullYear() === today.getFullYear();
    }).length;

    return {
      name: `Bay ${bayId}`,
      completed: completedTodayCount,
      active: bayJobs.filter(j => j.status === JobStatus.IN_PROGRESS).length
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-500">Shop overview and performance metrics</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid size={16}/> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Calendar size={16}/> Master Schedule
                </button>
           </div>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm ml-2"
            >
            <Plus size={18} />
            New Job
            </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
          <div className="h-[850px]">
               <ScheduleTimeline jobs={jobs} />
          </div>
      ) : (
        <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <PlayCircle size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">In Queue</p>
                <p className="text-2xl font-bold text-slate-900">{stats.queued}</p>
            </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <AlertCircle size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">On Hold</p>
                <p className="text-2xl font-bold text-slate-900">{stats.onHold}</p>
            </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="text-2xl font-bold text-slate-900">{stats.scheduled}</p>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scheduled Appointments Section */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-purple-600" /> Pending Appointments
                </h3>
                {scheduledJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scheduledJobs.map(job => (
                            <div key={job.id} className="border border-purple-100 bg-purple-50/30 p-4 rounded-lg flex flex-col gap-3">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-slate-800">{job.carModel}</span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                            {job.scheduledTime ? new Date(job.scheduledTime).toLocaleString() : 'Unscheduled'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">{job.ownerName} • {job.serviceDescription}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-purple-100">
                                    <span className="text-xs text-slate-500">Assign to:</span>
                                    <div className="flex gap-1 flex-1">
                                        {[1,2,3,4,5].map(b => (
                                            <button 
                                                key={b}
                                                onClick={() => assignScheduledJob(job.id, b)}
                                                className="flex-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded text-xs py-1 transition-colors"
                                            >
                                                Bay {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">No pending appointments.</p>
                )}
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Workload</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Bay Performance (Today)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bayEfficiencyData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Legend />
                    <Bar dataKey="active" stackId="a" fill="#3B82F6" name="Active" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed Today" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
            <h3 className="font-semibold text-slate-800">All Jobs Overview</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                    <th className="px-6 py-3">Job ID</th>
                    <th className="px-6 py-3">Bay</th>
                    <th className="px-6 py-3">Car</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Est. Hours</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {jobs.filter(j => j.status !== JobStatus.SCHEDULED).slice().reverse().map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-500">#{job.id.substring(0, 6)}</td>
                    <td className="px-6 py-3 font-medium">Bay {job.bayId}</td>
                    <td className="px-6 py-3">{job.carModel} <span className="text-slate-400 text-xs ml-1">{job.licensePlate}</span></td>
                    <td className="px-6 py-3">{job.ownerName}</td>
                    <td className="px-6 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-6 py-3 text-right text-slate-600">{job.estimatedDurationHours}h</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </>
      )}

      <NewJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onJobAdded={loadData} />
    </div>
  );
};

export default ManagerDashboard;
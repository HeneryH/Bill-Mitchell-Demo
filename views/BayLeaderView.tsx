import React, { useState, useEffect } from 'react';
import { garageService } from '../services/garageService';
import { Job, JobStatus, User } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Play, Pause, CheckSquare, Clock, User as UserIcon, AlertTriangle, MessageSquare, Layout, Calendar, Grid, Check } from 'lucide-react';
import { TOTAL_BAYS, BAY_CALENDAR_IDS } from '../constants';

interface BayLeaderViewProps {
  user: User;
}

const BayPanel: React.FC<{ bayId: number }> = ({ bayId }) => {
  const [activeJob, setActiveJob] = useState<Job | undefined>(undefined);
  const [queue, setQueue] = useState<Job[]>([]);

  useEffect(() => {
    loadData();
    const unsub = garageService.subscribe('change', loadData);
    return unsub;
  }, [bayId]);

  const loadData = () => {
    setActiveJob(garageService.getActiveJob(bayId));
    setQueue(garageService.getQueue(bayId));
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    if (newStatus === JobStatus.IN_PROGRESS && activeJob && activeJob.id !== jobId) {
      alert(`Bay ${bayId} is busy. Finish or hold the current job first.`);
      return;
    }
    
    let note = '';
    if (newStatus === JobStatus.ON_HOLD) {
      note = prompt("Reason for hold:") || 'Hold requested by operator';
    }

    garageService.updateJobStatus(jobId, newStatus, note);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        {/* Panel Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">Bay {bayId}</span>
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeJob ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {activeJob ? 'ACTIVE' : 'READY'}
            </span>
        </div>

        <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Active Job Area */}
            <div className="flex-shrink-0">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Job</h4>
                {activeJob ? (
                     <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 relative group">
                        <div className="mb-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-900 block truncate" title={activeJob.carModel}>{activeJob.carModel}</span>
                                <StatusBadge status={activeJob.status} />
                            </div>
                            <span className="text-blue-600 font-mono text-xs">{activeJob.licensePlate}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3 line-clamp-2" title={activeJob.serviceDescription}>{activeJob.serviceDescription}</p>
                         
                         <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusChange(activeJob.id, JobStatus.COMPLETED)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                                <CheckSquare size={14} /> Finish
                            </button>
                             <button
                                onClick={() => handleStatusChange(activeJob.id, JobStatus.ON_HOLD)}
                                className="px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-xs font-medium flex items-center justify-center border border-amber-200 transition-colors"
                                title="Hold Job"
                            >
                                <Pause size={14} />
                            </button>
                         </div>
                     </div>
                ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 min-h-[140px]">
                        <Clock size={24} className="mb-2 opacity-50"/>
                        <span className="text-xs font-medium">No Active Job</span>
                        <span className="text-[10px] opacity-75">Start one from queue</span>
                    </div>
                )}
            </div>

            {/* Queue Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                    Queue <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] font-mono">{queue.length}</span>
                 </h4>
                 <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    {queue.map(job => (
                        <div key={job.id} className={`border rounded p-2.5 shadow-sm transition-all flex justify-between items-center group ${job.status === JobStatus.ON_HOLD ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 hover:border-blue-300'}`}>
                             <div className="min-w-0 flex-1 mr-2">
                                <div className="flex items-center gap-1.5">
                                    {job.status === JobStatus.ON_HOLD && <AlertTriangle size={12} className="text-amber-500" />}
                                    <p className="font-medium text-slate-800 text-sm truncate">{job.carModel}</p>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{job.serviceDescription}</p>
                             </div>
                             
                            <button 
                                onClick={() => handleStatusChange(job.id, JobStatus.IN_PROGRESS)}
                                disabled={!!activeJob}
                                className={`p-1.5 rounded-md transition-colors ${
                                    activeJob 
                                    ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                }`}
                                title={activeJob ? "Bay is busy" : "Start Job"}
                            >
                                <Play size={14} />
                            </button>
                        </div>
                    ))}
                    {queue.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                            Queue is empty
                        </div>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
};

const BayLeaderView: React.FC<BayLeaderViewProps> = ({ user }) => {
  // Initialize with assigned bay, or Bay 1 if none.
  const [selectedBays, setSelectedBays] = useState<number[]>(
      user.assignedBayId ? [user.assignedBayId] : [1]
  );
  const [viewMode, setViewMode] = useState<'work' | 'schedule'>('work');

  const toggleBay = (bayId: number) => {
    setSelectedBays(prev => {
        if (prev.includes(bayId)) {
            // Prevent deselecting the last bay
            if (prev.length === 1) return prev;
            return prev.filter(id => id !== bayId);
        } else {
            return [...prev, bayId].sort((a,b) => a - b);
        }
    });
  };

  const getCalendarUrl = () => {
    const baseUrl = "https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=UTC&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&mode=WEEK";
    // Define colors for bays to distinguish them in combined view
    const colors = ['%23039BE5', '%2333B679', '%238E24AA', '%23E67C73', '%23F09300'];
    
    // Construct src params for all selected bays
    const calendars = selectedBays.map(id => {
        const calId = BAY_CALENDAR_IDS[id - 1];
        return `&src=${encodeURIComponent(calId)}&color=${colors[id-1]}`;
    }).join('');
    
    return baseUrl + calendars;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-lg text-white shadow-md shadow-indigo-200">
                <UserIcon size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800">Bay Leader Control</h1>
                <p className="text-sm text-slate-500">
                    Welcome, {user?.name.split(' ')[0]}
                </p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center">
             {/* Bay Selector */}
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Managing Bays:</span>
                <div className="flex gap-1">
                    {Array.from({ length: TOTAL_BAYS }).map((_, i) => {
                        const id = i + 1;
                        const isSelected = selectedBays.includes(id);
                        return (
                            <button
                                key={id}
                                onClick={() => toggleBay(id)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                                    isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                                title={`Toggle Bay ${id}`}
                            >
                                {id}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('work')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'work' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Grid size={16}/> Workspace
                </button>
                <button 
                    onClick={() => setViewMode('schedule')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Calendar size={16}/> Schedule
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'schedule' ? (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-[750px]">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                     <Calendar className="text-indigo-600" size={20}/> 
                     Schedule View
                  </h2>
                  <div className="text-sm text-slate-500">
                      Showing calendars for Bays: {selectedBays.join(', ')}
                  </div>
              </div>
              <iframe 
                src={getCalendarUrl()} 
                style={{border: 0}} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no"
                title="Bay Schedules"
               ></iframe>
          </div>
      ) : (
        <div className={`grid gap-6 ${selectedBays.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
            {selectedBays.map(id => (
                <BayPanel key={id} bayId={id} />
            ))}
        </div>
      )}
    </div>
  );
};

export default BayLeaderView;
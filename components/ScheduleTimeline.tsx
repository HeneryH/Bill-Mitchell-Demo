import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { SHOP_OPEN_HOUR, SHOP_CLOSE_HOUR, TOTAL_BAYS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, PlayCircle, PauseCircle, Users, AlertCircle } from 'lucide-react';

interface ScheduleTimelineProps {
  jobs: Job[];
  filterBays?: number[];
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ jobs, filterBays }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = Array.from({ length: SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR + 1 }, (_, i) => SHOP_OPEN_HOUR + i);
  const bays = filterBays || Array.from({ length: TOTAL_BAYS }, (_, i) => i + 1);

  const getJobStyles = (status: JobStatus) => {
    switch (status) {
        case JobStatus.COMPLETED: 
            return {
                base: 'bg-emerald-100 border-emerald-300 text-emerald-900',
                icon: <CheckCircle size={14} className="text-emerald-600"/>,
                label: 'Completed'
            };
        case JobStatus.IN_PROGRESS: 
            return {
                base: 'bg-blue-600 border-blue-700 text-white shadow-md z-20',
                icon: <PlayCircle size={14} className="text-blue-100"/>,
                label: 'Active'
            };
        case JobStatus.SCHEDULED: 
            return {
                base: 'bg-purple-50 border-purple-300 text-purple-900 border-dashed border-2',
                icon: <Calendar size={14} className="text-purple-600"/>,
                label: 'Scheduled'
            };
        case JobStatus.QUEUED:
             return {
                base: 'bg-slate-200 border-slate-300 text-slate-700',
                icon: <Users size={14} className="text-slate-500"/>,
                label: 'Queued'
             };
        case JobStatus.ON_HOLD:
             return {
                base: 'bg-amber-100 border-amber-300 text-amber-900 stripe-amber',
                icon: <PauseCircle size={14} className="text-amber-600"/>,
                label: 'On Hold'
             };
        default: 
            return {
                base: 'bg-gray-100 border-gray-300 text-gray-700',
                icon: <Clock size={14} />,
                label: 'Unknown'
            };
    }
  };

  // Helper to calculate position percentage with clamping
  const getPosition = (job: Job) => {
    // Determine effective time to display
    let timestamp = job.scheduledTime || job.startedAt || job.createdAt;
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(SHOP_OPEN_HOUR, 0, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(SHOP_CLOSE_HOUR, 0, 0, 0);

    const totalDayMs = (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR) * 60 * 60 * 1000;
    
    // If job is from a previous day but still active/queued, clamp it to start of day
    // so it appears on the timeline instead of off-screen
    if (timestamp < dayStart.getTime()) {
        timestamp = dayStart.getTime();
    }

    const offsetMs = timestamp - dayStart.getTime();
    const durationMs = job.estimatedDurationHours * 60 * 60 * 1000;

    const left = (offsetMs / totalDayMs) * 100;
    const width = (durationMs / totalDayMs) * 100;

    // Clamp values to ensure they stay within 0-100% mostly, but allow partial overflow
    return { 
        left: `${Math.max(0, left)}%`, 
        width: `${width}%` 
    };
  };

  // Filter logic: Show jobs that belong to this date OR are active/queued right now (if viewing Today)
  const displayedJobs = jobs.filter(job => {
    if (job.status === JobStatus.CANCELLED) return false;

    const time = job.scheduledTime || job.startedAt || job.createdAt;
    const jobDate = new Date(time);
    
    const isSameDay = jobDate.getDate() === selectedDate.getDate() && 
                      jobDate.getMonth() === selectedDate.getMonth() &&
                      jobDate.getFullYear() === selectedDate.getFullYear();

    // If viewing "Today", also show anything currently in the shop (carry-overs)
    const isViewingToday = selectedDate.toDateString() === new Date().toDateString();
    const isActiveState = [JobStatus.IN_PROGRESS, JobStatus.QUEUED, JobStatus.ON_HOLD].includes(job.status);

    if (isViewingToday && isActiveState) return true;

    return isSameDay;
  });
  
  const handleDateChange = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      setSelectedDate(newDate);
  };
  
  const nowPercent = ((new Date().getHours() + new Date().getMinutes()/60 - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100;
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
      {/* Controls & Legend */}
      <div className="flex flex-col gap-4 p-4 border-b bg-slate-50">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                        <Calendar className="text-blue-600" size={20}/>
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                   </div>
                   <div className="flex bg-white rounded-lg border shadow-sm p-0.5">
                        <button onClick={() => handleDateChange(-1)} className="p-1.5 hover:bg-slate-50 rounded text-slate-600"><ChevronLeft size={16}/></button>
                        <button onClick={() => setSelectedDate(new Date())} className="px-3 text-xs font-bold hover:bg-slate-50 rounded text-slate-600 border-x">Today</button>
                        <button onClick={() => handleDateChange(1)} className="p-1.5 hover:bg-slate-50 rounded text-slate-600"><ChevronRight size={16}/></button>
                   </div>
               </div>

               {/* Legend */}
               <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600"></div> Active</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-50 border border-purple-300 border-dashed"></div> Scheduled</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></div> Queued</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div> On Hold</div>
               </div>
           </div>
      </div>

      {/* Timeline Header (Hours) */}
      <div className="flex border-b bg-slate-50/80 backdrop-blur sticky top-0 z-30">
        <div className="w-24 md:w-32 flex-shrink-0 p-3 border-r font-bold text-slate-400 text-xs tracking-wider uppercase flex items-center">Bay</div>
        <div className="flex-1 relative h-8">
          {hours.map((hour) => (
            <div 
                key={hour} 
                className="absolute top-0 bottom-0 text-[10px] font-medium text-slate-400 border-l pl-1 pt-2" 
                style={{ left: `${((hour - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%` }}
            >
                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative bg-white">
        
        {/* Current Time Indicator Line */}
        {isToday && nowPercent >= 0 && nowPercent <= 100 && (
             <div 
                className="absolute top-0 bottom-0 w-px bg-rose-500 z-30 pointer-events-none shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                style={{ left: `${nowPercent}%` }}
            >
                <div className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full absolute -top-1.5 -translate-x-1/2 shadow-sm whitespace-nowrap">
                    Now
                </div>
            </div>
        )}

        {/* Unassigned / Pending Row */}
        {!filterBays && (
            <div className="flex border-b min-h-[70px] bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <div className="w-24 md:w-32 flex-shrink-0 p-3 border-r flex flex-col justify-center text-xs">
                    <span className="font-bold text-slate-700">Walk-ins / Queue</span>
                    <span className="text-slate-400 text-[10px]">Unassigned Jobs</span>
                </div>
                <div className="flex-1 relative my-2 mx-1">
                     {/* Background Grid */}
                     {hours.map((hour) => (
                        <div key={hour} className="absolute top-[-8px] bottom-[-8px] border-l border-slate-100" style={{ left: `${((hour - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%` }} />
                     ))}
                     
                     {/* Unassigned Jobs */}
                     {displayedJobs.filter(j => !j.bayId).map(job => {
                        const style = getPosition(job);
                        const visual = getJobStyles(job.status);
                        
                        return (
                             <div
                                key={job.id}
                                className={`absolute top-1 bottom-1 rounded-md border px-2 py-1 text-xs overflow-hidden cursor-pointer transition-all flex flex-col justify-center hover:scale-[1.02] hover:shadow-lg ${visual.base}`}
                                style={{ ...style }}
                                title={`${job.carModel} (${job.status})`}
                            >
                                <div className="font-bold flex items-center gap-1.5 leading-tight truncate">
                                    {visual.icon}
                                    <span className="truncate">{job.carModel}</span>
                                </div>
                                <span className="text-[10px] opacity-80 truncate">{job.serviceDescription}</span>
                            </div>
                        )
                     })}
                     
                     {displayedJobs.filter(j => !j.bayId).length === 0 && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold border border-dashed border-slate-300 px-3 py-1 rounded-full">Empty Queue</span>
                         </div>
                     )}
                </div>
            </div>
        )}

        {/* Bays */}
        {bays.map(bayId => (
          <div key={bayId} className="flex border-b min-h-[100px] group hover:bg-slate-50/50 transition-colors relative">
            <div className="w-24 md:w-32 flex-shrink-0 p-3 border-r flex flex-col justify-center text-sm bg-white group-hover:bg-slate-50 transition-colors z-20">
                <span className="font-bold text-slate-800">Bay {bayId}</span>
                <span className="text-xs text-slate-400">General Service</span>
            </div>
            <div className="flex-1 relative my-2 mx-1">
                {/* Background Grid Lines */}
                {hours.map((hour) => (
                    <div 
                        key={hour} 
                        className="absolute top-[-8px] bottom-[-8px] border-l border-slate-100 group-hover:border-slate-200 transition-colors" 
                        style={{ left: `${((hour - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%` }}
                    />
                ))}

                {/* Jobs */}
                {displayedJobs.filter(j => j.bayId === bayId).map(job => {
                    const style = getPosition(job);
                    const visual = getJobStyles(job.status);

                    return (
                        <div
                            key={job.id}
                            className={`absolute top-1 bottom-1 rounded-lg border px-3 py-2 text-xs overflow-hidden shadow-sm hover:z-20 hover:shadow-xl hover:scale-[1.01] cursor-pointer transition-all flex flex-col ${visual.base}`}
                            style={style}
                            title={`${job.carModel} - ${job.serviceDescription}`}
                        >
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold truncate text-sm">{job.carModel}</span>
                                {visual.icon}
                            </div>
                            <div className="truncate opacity-90 text-[11px] font-medium mb-auto">{job.serviceDescription}</div>
                            
                            <div className="flex justify-between items-end mt-1 pt-1 border-t border-black/5">
                                <span className="text-[10px] opacity-75">{visual.label}</span>
                                {job.scheduledTime && (
                                    <span className="text-[10px] font-mono opacity-100">
                                        {new Date(job.scheduledTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        ))}
        
        {displayedJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                <AlertCircle size={48} className="mb-4 opacity-20"/>
                <p className="font-medium text-slate-400">No scheduled or active jobs for {selectedDate.toLocaleDateString()}.</p>
                {!isToday && (
                    <button onClick={() => setSelectedDate(new Date())} className="mt-4 text-blue-600 hover:underline text-sm font-medium">Return to Today</button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTimeline;
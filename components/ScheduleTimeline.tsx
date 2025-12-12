import React from 'react';
import { Job, JobStatus } from '../types';
import { SHOP_OPEN_HOUR, SHOP_CLOSE_HOUR, TOTAL_BAYS } from '../constants';

interface ScheduleTimelineProps {
  jobs: Job[];
  filterBays?: number[];
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ jobs, filterBays }) => {
  const hours = Array.from({ length: SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR + 1 }, (_, i) => SHOP_OPEN_HOUR + i);
  const bays = filterBays || Array.from({ length: TOTAL_BAYS }, (_, i) => i + 1);

  // Helper to calculate position percentage
  const getPosition = (timestamp: number, durationHours: number) => {
    const date = new Date(timestamp);
    const startOfDay = new Date(date);
    startOfDay.setHours(SHOP_OPEN_HOUR, 0, 0, 0);
    
    const totalDayMs = (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR) * 60 * 60 * 1000;
    const offsetMs = timestamp - startOfDay.getTime();
    
    const left = (offsetMs / totalDayMs) * 100;
    const width = (durationHours / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${width}%` };
  };

  const getJobColor = (status: JobStatus) => {
    switch (status) {
        case JobStatus.COMPLETED: return 'bg-emerald-200 text-emerald-800 border-emerald-300';
        case JobStatus.IN_PROGRESS: return 'bg-blue-200 text-blue-800 border-blue-300';
        case JobStatus.SCHEDULED: return 'bg-purple-200 text-purple-800 border-purple-300';
        default: return 'bg-slate-200 text-slate-800 border-slate-300';
    }
  };

  // Filter jobs for "Today" visualization
  const todayJobs = jobs.filter(job => {
    const time = job.scheduledTime || job.startedAt || job.createdAt;
    const jobDate = new Date(time);
    const today = new Date();
    return jobDate.getDate() === today.getDate() && 
           jobDate.getMonth() === today.getMonth() &&
           jobDate.getFullYear() === today.getFullYear() &&
           (job.status === JobStatus.SCHEDULED || job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.COMPLETED);
  });

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header (Hours) */}
      <div className="flex border-b bg-slate-50">
        <div className="w-20 flex-shrink-0 p-3 border-r font-bold text-slate-500 text-sm">Bay</div>
        <div className="flex-1 relative h-10">
          {hours.map((hour) => (
            <div 
                key={hour} 
                className="absolute text-xs text-slate-400 border-l h-full pl-1" 
                style={{ left: `${((hour - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%` }}
            >
                {hour}:00
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Current Time Indicator Line (Optional visual) */}
        <div 
            className="absolute top-0 bottom-0 border-l-2 border-red-400 z-10 pointer-events-none opacity-50"
            style={{ 
                left: `${((new Date().getHours() + new Date().getMinutes()/60 - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%`,
                display: (new Date().getHours() >= SHOP_OPEN_HOUR && new Date().getHours() < SHOP_CLOSE_HOUR) ? 'block' : 'none'
            }}
        >
            <div className="bg-red-400 text-white text-[10px] px-1 rounded-sm absolute -top-0 -translate-x-1/2">Now</div>
        </div>

        {bays.map(bayId => (
          <div key={bayId} className="flex border-b min-h-[80px] group hover:bg-slate-50 transition-colors">
            <div className="w-20 flex-shrink-0 p-3 border-r flex items-center justify-center font-bold text-slate-700 bg-slate-50/50">
                Bay {bayId}
            </div>
            <div className="flex-1 relative my-2 mx-1">
                {/* Background Grid Lines */}
                {hours.map((hour) => (
                    <div 
                        key={hour} 
                        className="absolute top-[-8px] bottom-[-8px] border-l border-slate-100" 
                        style={{ left: `${((hour - SHOP_OPEN_HOUR) / (SHOP_CLOSE_HOUR - SHOP_OPEN_HOUR)) * 100}%` }}
                    />
                ))}

                {/* Jobs */}
                {todayJobs.filter(j => j.bayId === bayId).map(job => {
                    const time = job.scheduledTime || job.startedAt || job.createdAt;
                    const style = getPosition(time, job.estimatedDurationHours);
                    return (
                        <div
                            key={job.id}
                            className={`absolute h-full rounded border px-2 py-1 text-xs font-medium overflow-hidden whitespace-nowrap shadow-sm hover:z-20 hover:shadow-md cursor-pointer transition-all ${getJobColor(job.status)}`}
                            style={style}
                            title={`${job.carModel} - ${job.serviceDescription}`}
                        >
                            <div className="font-bold">{job.carModel}</div>
                            <div className="opacity-80 text-[10px]">{job.serviceDescription}</div>
                        </div>
                    );
                })}
            </div>
          </div>
        ))}
        {todayJobs.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic">
                No jobs scheduled for today
            </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTimeline;
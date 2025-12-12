import React from 'react';
import { JobStatus } from '../types';

interface StatusBadgeProps {
  status: JobStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';

  switch (status) {
    case JobStatus.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case JobStatus.COMPLETED:
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case JobStatus.ON_HOLD:
      colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
      break;
    case JobStatus.QUEUED:
      colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
      break;
    case JobStatus.SCHEDULED:
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    case 'AVAILABLE':
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'OCCUPIED':
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
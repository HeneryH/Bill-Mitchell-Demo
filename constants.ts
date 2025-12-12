import { Bay, Job, JobStatus } from './types';

export const TOTAL_BAYS = 5;

// Shop Hours: 8 AM to 6 PM
export const SHOP_OPEN_HOUR = 8;
export const SHOP_CLOSE_HOUR = 18;

export const INITIAL_BAYS: Bay[] = Array.from({ length: TOTAL_BAYS }, (_, i) => ({
  id: i + 1,
  name: `Bay ${i + 1}`,
  status: 'AVAILABLE'
}));

export const SERVICE_MENU = [
  { id: 's1', name: 'Quick Oil Change', duration: 1.0 },
  { id: 's2', name: 'Tire Rotation & Balance', duration: 1.0 },
  { id: 's3', name: 'Brake Service (Axle)', duration: 2.0 },
  { id: 's4', name: 'General Diagnostics', duration: 1.5 },
  { id: 's5', name: 'Major Service / Tune-up', duration: 4.0 },
  { id: 's6', name: 'Transmission Flush', duration: 2.5 },
];

// Fallback data if DB is empty
export const INITIAL_JOBS: Job[] = [];
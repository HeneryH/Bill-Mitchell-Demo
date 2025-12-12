import { Bay, Job, JobStatus } from './types';

export const TOTAL_BAYS = 5;

// Shop Hours: 8 AM to 6 PM
export const SHOP_OPEN_HOUR = 8;
export const SHOP_CLOSE_HOUR = 18;

// --- Calendar IDs for Schedule View ---
export const BAY_CALENDAR_IDS = [
  '27f018994f9455e1ab137d5ed78ad92248c57989b5e9978ec08ffee402bcf521@group.calendar.google.com',
  '3145ac069ae08a5a0d9b902bb135227c52e5c1ae728e2cde1cfbd1aebd0741b1@group.calendar.google.com',
  '15d84e66a12465a03232fbf8aa40958fc5a7656bfe406a2e19e478c7ca72ff1a@group.calendar.google.com',
  'c9f221d43f0cc7156ac3e53b60a84c21f1a1ead810e4b7dc5728b85c6b3122f2@group.calendar.google.com',
  'b80b9fc0215cb30fe90a7c68c8a3b4b8217e7ee08685f42607f564e033301eed@group.calendar.google.com'
];

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
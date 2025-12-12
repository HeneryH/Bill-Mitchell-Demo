import { Job, JobStatus, Bay, AppNotification } from '../types';
import { INITIAL_BAYS, SHOP_OPEN_HOUR, SHOP_CLOSE_HOUR, TOTAL_BAYS } from '../constants';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  terminate,
  setLogLevel
} from 'firebase/firestore';

// Suppress verbose connection errors from the SDK when the backend is missing
try {
    setLogLevel('silent'); 
} catch (e) {
    // Ignore if setLogLevel is unavailable
}

type GarageEventListener = (data?: any) => void;

const DEMO_STORAGE_KEY = 'autoflow_demo_db';

class GarageService {
  private jobs: Job[] = [];
  private bays: Bay[] = [];
  private listeners: Map<string, GarageEventListener[]> = new Map();
  private initialized = false;
  private isOfflineMode = false;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.initRealtimeListeners();
  }

  // --- Real-time Sync ---
  private async initRealtimeListeners() {
    if (this.initialized) return;

    try {
        // Listen to Jobs
        // If db is empty (offline mode), this throws immediately
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));
        
        const unsubJobs = onSnapshot(jobsQuery, 
            (snapshot) => {
                if (this.isOfflineMode) return;
                this.jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
                this.notifyChange();
            },
            (error) => {
                this.handleFirestoreError(error);
            }
        );
        this.unsubscribers.push(unsubJobs);

        // Listen to Bays
        const baysRef = collection(db, 'bays');
        const unsubBays = onSnapshot(baysRef, 
            async (snapshot) => {
                if (this.isOfflineMode) return;

                if (snapshot.empty) {
                    // First run initialization only if we are actually connected
                    try {
                        for (const bay of INITIAL_BAYS) {
                            await setDoc(doc(db, 'bays', bay.id.toString()), bay);
                        }
                    } catch (e) {
                         // Write failed, likely no DB or permission denied
                         this.handleFirestoreError(e);
                    }
                } else {
                    this.bays = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Bay)).sort((a,b) => a.id - b.id);
                    this.notifyChange();
                }
            },
            (error) => {
                 this.handleFirestoreError(error);
            }
        );
        this.unsubscribers.push(unsubBays);

        this.initialized = true;
    } catch (e) {
        // Immediate failure (e.g. invalid DB object)
        console.warn("Firestore initialization failed, enabling offline mode.", e);
        await this.enableOfflineMode();
        // Wait a tick for UI to mount before notifying
        setTimeout(() => {
            this.sendNotification({
                message: 'Running in Offline Demo Mode',
                type: 'info'
            });
        }, 1000);
    }
  }

  private handleFirestoreError(error: any) {
      if (this.isOfflineMode) return;
      
      if (error?.code === 'permission-denied' || error?.code === 'unavailable') {
          console.warn("Cloud Database unavailable. Switching to Offline Demo Mode.");
          this.sendNotification({
              message: 'Database Locked. Using Offline Data (Synced across tabs).',
              type: 'warning'
          });
      } else {
          console.error("Firestore Error:", error);
      }
      
      this.enableOfflineMode();
  }

  // --- Offline / Demo Mode Logic ---

  private async enableOfflineMode() {
    if (this.isOfflineMode) return;
    this.isOfflineMode = true;
    this.initialized = true;

    // Stop listening to Firestore
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    try { await terminate(db); } catch (e) {}

    // 1. Setup Cross-Tab Listener
    window.addEventListener('storage', (e) => {
        if (e.key === DEMO_STORAGE_KEY) {
            this.loadOfflineData();
            this.notifyChange();
        }
    });

    // 2. Load existing data from LocalStorage
    this.loadOfflineData();

    // 3. Seed data only if absolutely empty (first time ever)
    if (this.jobs.length === 0) {
        this.jobs = [
            {
                id: 'demo-1',
                bayId: 1,
                ownerName: 'Demo Customer',
                carModel: 'Tesla Model 3',
                licensePlate: 'DEMO-01',
                serviceDescription: 'Tire Rotation',
                status: JobStatus.IN_PROGRESS,
                createdAt: Date.now() - 100000,
                estimatedDurationHours: 1,
                startedAt: Date.now() - 50000
            },
            {
                id: 'demo-2',
                ownerName: 'Manager Test',
                carModel: 'Ford F-150',
                licensePlate: 'DEMO-02',
                serviceDescription: 'Oil Change',
                status: JobStatus.QUEUED,
                createdAt: Date.now(),
                estimatedDurationHours: 1.5,
                bayId: 1
            }
        ];
        // Save initial seed so other tabs see it
        this.persistOfflineData();
    }
    
    if (this.bays.length === 0) {
        this.bays = INITIAL_BAYS;
        this.persistOfflineData();
    }

    this.notifyChange();
  }

  private loadOfflineData() {
      try {
          const stored = localStorage.getItem(DEMO_STORAGE_KEY);
          if (stored) {
              const data = JSON.parse(stored);
              this.jobs = data.jobs || [];
              this.bays = data.bays || [];
          }
      } catch (e) {
          console.error("Failed to load offline data", e);
      }
  }

  private persistOfflineData() {
      if (!this.isOfflineMode) return;
      try {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
              jobs: this.jobs,
              bays: this.bays
          }));
      } catch (e) {
          console.error("Failed to save offline data", e);
      }
  }

  // --- Event System ---
  subscribe(event: 'change' | 'notification', callback: GarageEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(event, list.filter(cb => cb !== callback));
      }
    };
  }

  private notifyChange() {
    this.listeners.get('change')?.forEach(cb => cb());
  }

  private sendNotification(notification: Omit<AppNotification, 'id' | 'timestamp'>) {
    const fullNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    this.listeners.get('notification')?.forEach(cb => cb(fullNotification));
  }

  // --- Queries ---
  getAllJobs(): Job[] {
    return [...this.jobs];
  }

  getJobsByBay(bayId: number): Job[] {
    return this.jobs.filter(job => job.bayId === bayId && job.status !== JobStatus.SCHEDULED);
  }

  getActiveJob(bayId: number): Job | undefined {
    return this.jobs.find(job => job.bayId === bayId && job.status === JobStatus.IN_PROGRESS);
  }

  getQueue(bayId: number): Job[] {
    return this.jobs.filter(job => 
      job.bayId === bayId && 
      (job.status === JobStatus.QUEUED || job.status === JobStatus.ON_HOLD)
    );
  }

  getScheduledJobs(): Job[] {
    return this.jobs.filter(job => job.status === JobStatus.SCHEDULED).sort((a, b) => (a.scheduledTime || 0) - (b.scheduledTime || 0));
  }

  getJobsByCustomer(customerId: string): Job[] {
    return this.jobs.filter(job => job.customerId === customerId).sort((a,b) => b.createdAt - a.createdAt);
  }

  findAvailableSlots(dateStr: string, durationHours: number): number[] {
    // FIX: Parse date string (YYYY-MM-DD) manually to ensure it uses Local Time.
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Create base target date for filtering existing jobs.
    // We use noon (12:00) to safely determine the "Day" limits without risking 
    // midnight timezone shifts (e.g. 00:00 -> 23:00 previous day).
    const baseDate = new Date(year, month - 1, day, 12, 0, 0);
    
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0,0,0,0);
    
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23,59,59,999);

    // Find jobs that overlap with this day
    const daysJobs = this.jobs.filter(job => {
      if (job.scheduledTime) {
        const d = new Date(job.scheduledTime);
        return d >= startOfDay && d <= endOfDay && job.status !== JobStatus.CANCELLED;
      }
      if (job.startedAt) {
        const d = new Date(job.startedAt);
        return d >= startOfDay && d <= endOfDay;
      }
      return false;
    });

    const slots: Set<number> = new Set();
    const bufferHours = 0.25;
    const stepMinutes = 30;

    for (let bayId = 1; bayId <= TOTAL_BAYS; bayId++) {
      const bayJobs = daysJobs.filter(j => j.bayId === bayId);

      for (let hour = SHOP_OPEN_HOUR; hour <= SHOP_CLOSE_HOUR - durationHours; hour += (stepMinutes/60)) {
        // Atomic construction of the slot time.
        // explicitly setting year, month, day, hour prevents "day prior" issues 
        // that can happen if you setHours on a Date object near a DST boundary.
        const slotStart = new Date(year, month - 1, day, Math.floor(hour), (hour % 1) * 60, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + (durationHours + bufferHours) * 3600000);

        let isBlocked = false;
        
        for (const job of bayJobs) {
            let jobStart = 0;
            let jobEnd = 0;

            if (job.scheduledTime) {
                jobStart = job.scheduledTime;
                jobEnd = jobStart + (job.estimatedDurationHours * 3600000);
            } else if (job.startedAt) {
                jobStart = job.startedAt;
                jobEnd = jobStart + (job.estimatedDurationHours * 3600000); 
            }

            if (jobStart < slotEnd.getTime() && jobEnd > slotStart.getTime()) {
                isBlocked = true;
                break;
            }
        }

        if (!isBlocked) {
            slots.add(slotStart.getTime());
        }
      }
    }

    return Array.from(slots).sort((a,b) => a - b);
  }

  // --- Actions ---
  
  async addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status'>): Promise<void> {
    const newJob: Job = {
        ...jobData,
        id: this.isOfflineMode ? `local-${Date.now()}-${Math.random().toString(36).substr(2,5)}` : '', 
        createdAt: Date.now(),
        status: jobData.scheduledTime ? JobStatus.SCHEDULED : JobStatus.QUEUED,
    };

    if (this.isOfflineMode) {
        this.jobs.unshift(newJob);
        this.persistOfflineData(); // Sync to other tabs
        this.notifyChange();
        this.sendNotification({
            message: `(Offline) New job added: ${jobData.carModel}`,
            type: 'info'
        });
        return;
    }

    try {
        const { id, ...data } = newJob; // Remove empty ID
        await addDoc(collection(db, 'jobs'), data);
        this.sendNotification({
            message: `New job added: ${jobData.carModel}`,
            type: 'info'
        });
    } catch (e) {
        // Fallback to offline if write fails
        this.enableOfflineMode();
        this.addJob(jobData);
    }
  }

  async updateJobStatus(jobId: string, status: JobStatus, note?: string): Promise<void> {
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return;
    const job = this.jobs[jobIndex];

    const updates: any = { status };
    if (status === JobStatus.IN_PROGRESS && !job.startedAt) {
      updates.startedAt = Date.now();
    }
    if (status === JobStatus.COMPLETED) {
      updates.completedAt = Date.now();
    }
    if (note) {
      updates.notes = [...(job.notes || []), note];
    }

    // Apply local update immediately (optimistic UI or offline mode)
    this.jobs[jobIndex] = { ...job, ...updates };
    
    if (this.isOfflineMode) {
        this.persistOfflineData(); // Sync to other tabs
    }
    
    this.notifyChange();

    // Notifications logic
    if (status === JobStatus.ON_HOLD) {
      this.sendNotification({
        message: `Delay Alert: Job ${job.carModel} in Bay ${job.bayId} placed ON HOLD.`,
        type: 'warning',
        recipientRole: 'MANAGER'
      });
    }
    if (job.customerId) {
        let msg = `Your vehicle status updated: ${status.replace('_', ' ')}`;
        if (status === JobStatus.COMPLETED) msg = `Good news! Your ${job.carModel} is ready for pickup.`;
        if (status === JobStatus.IN_PROGRESS) msg = `Service started on your ${job.carModel}.`;
        
        this.sendNotification({
            message: msg,
            type: 'info',
            recipientUserId: job.customerId
        });
    }

    if (this.isOfflineMode) return;

    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, updates);
    } catch (e) {
        this.enableOfflineMode();
    }
  }

  async updateJobDetails(jobId: string, updates: Partial<Job>) {
    const jobIndex = this.jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return;

    // Local update
    this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates };
    
    if (this.isOfflineMode) {
        this.persistOfflineData(); // Sync
    }
    
    this.notifyChange();

    if (this.isOfflineMode) return;

    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, updates);
    } catch (e) {
        this.enableOfflineMode();
    }
  }

  getBayStats() {
    const total = this.jobs.length;
    const completed = this.jobs.filter(j => j.status === JobStatus.COMPLETED).length;
    const active = this.jobs.filter(j => j.status === JobStatus.IN_PROGRESS).length;
    const queued = this.jobs.filter(j => j.status === JobStatus.QUEUED).length;
    const onHold = this.jobs.filter(j => j.status === JobStatus.ON_HOLD).length;
    const scheduled = this.jobs.filter(j => j.status === JobStatus.SCHEDULED).length;

    return { total, completed, active, queued, onHold, scheduled };
  }
}

export const garageService = new GarageService();
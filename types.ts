export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type UserRole = 'MANAGER' | 'LEADER' | 'CUSTOMER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  assignedBayId?: number; // Only for LEADER
}

export interface Job {
  id: string;
  bayId?: number; // Optional if just scheduled
  customerId?: string; // Link to user
  ownerName: string;
  carModel: string;
  licensePlate: string;
  serviceDescription: string;
  status: JobStatus;
  createdAt: number;
  scheduledTime?: number; // For appointments
  startedAt?: number;
  completedAt?: number;
  notes?: string[];
  estimatedDurationHours: number;
}

export interface Bay {
  id: number;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  recipientRole?: UserRole; // If null, for everyone (or specific logic)
  recipientUserId?: string;
}

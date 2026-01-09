
export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
export type InviteStatus = 'SENT' | 'ACCEPTED' | 'DECLINED';

export interface Business {
  id: string;
  name: string;
  logo?: string;
  email: string;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  businessId: string;
  email?: string;
  phone?: string;
  inviteStatus?: InviteStatus;
}

export interface GPSCoord {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface Job {
  id: string;
  businessId: string;
  clientName: string;
  clientId: string;
  assignedEmployeeId: string;
  location: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'COMPLETED';
  createdAt: string;
}

export interface SessionContext {
  job: Job;
  employee: User;
  business: Business;
  serverTime: number;
}

export interface FailureFlags {
  gpsLost: boolean;
  accuracyExceeded: boolean;
  visibilityChanged: boolean;
  backgrounded: boolean;
}

export interface ProofRecording {
  id: string;
  jobId: string;
  businessId: string;
  employeeId: string;
  clientId: string;
  startedAt: number;
  endedAt: number;
  gpsStart: GPSCoord | null;
  gpsTimeline: GPSCoord[];
  videoBlob: Blob;
  videoHash: string;
  metadataHash: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  failureFlags: FailureFlags;
}

export enum RecorderState {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  RECORDING = 'RECORDING',
  STOPPING = 'STOPPING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

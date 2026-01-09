
import { User, Job, Business } from './types';

export const MAX_RECORDING_DURATION = 180;
export const GPS_ACCURACY_THRESHOLD = 50;
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const WATERMARK_TEXT = 'Verified by Proofly';

export const MOCK_BUSINESS: Business = {
  id: 'B-MOCK',
  name: 'Global Shield Corp',
  email: 'ops@globalshield.io',
  createdAt: 1710000000000
};

export const MOCK_USERS: User[] = [
  { id: 'U-ADMIN-01', name: 'Alexander Vault', role: 'ADMIN', businessId: 'B-MOCK', email: 'alex@proofly.io', inviteStatus: 'ACCEPTED' },
  { id: 'EMP-9002', name: 'Sarah Connor', role: 'EMPLOYEE', businessId: 'B-MOCK', phone: '+1 (555) 0199', inviteStatus: 'ACCEPTED' },
  { id: 'CLIENT-771', name: 'Jenkins Logistics', role: 'CLIENT', businessId: 'B-MOCK', email: 'security@jenkins.com' }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'JOB-4412',
    businessId: 'B-MOCK',
    clientName: 'Jenkins Logistics',
    clientId: 'CLIENT-771',
    assignedEmployeeId: 'EMP-9002',
    location: '123 Tech Lane, Austin TX',
    description: 'Security System Maintenance & Verification',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: 'JOB-5589',
    businessId: 'B-MOCK',
    clientName: 'Pioneer Logistics',
    clientId: 'CLIENT-PIONEER',
    assignedEmployeeId: 'EMP-9002',
    location: '888 Industrial Way',
    description: 'Cargo Seal Inspection',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }
];

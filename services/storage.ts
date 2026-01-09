
import { ProofRecording, Business, User, Job } from '../types';
import { MOCK_BUSINESS, MOCK_USERS, MOCK_JOBS } from '../constants';

const DB_NAME = 'ProoflyDB';
const STORE_NAME = 'proof_recordings';
const DB_VERSION = 1;

// IndexedDB for large video files
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const saveRecording = async (recording: ProofRecording): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(recording);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllRecordings = async (): Promise<ProofRecording[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn("IndexedDB not available, returning empty recordings list.");
    return [];
  }
};

export const deleteRecording = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// LocalStorage for Metadata (Businesses, Users, Jobs)
const L_KEYS = {
  BUSINESSES: 'proofly_businesses_v4',
  USERS: 'proofly_users_v4',
  JOBS: 'proofly_jobs_v4'
};

const getL = <T>(key: string, def: T): T => {
  try {
    const val = localStorage.getItem(key);
    if (!val) return def;
    const parsed = JSON.parse(val);
    return Array.isArray(def) && !Array.isArray(parsed) ? def : parsed;
  } catch (e) {
    console.error(`Storage error for key ${key}:`, e);
    return def;
  }
};

const setL = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Critical storage write failure:", e);
  }
};

export const businessStore = {
  getAll: () => {
    const bs = getL<Business[]>(L_KEYS.BUSINESSES, []);
    if (bs.length === 0) {
      setL(L_KEYS.BUSINESSES, [MOCK_BUSINESS]);
      return [MOCK_BUSINESS];
    }
    return bs;
  },
  getById: (id: string) => businessStore.getAll().find(b => b.id === id),
  save: (b: Business) => {
    const bs = businessStore.getAll();
    const idx = bs.findIndex(item => item.id === b.id);
    if (idx >= 0) bs[idx] = b; else bs.push(b);
    setL(L_KEYS.BUSINESSES, bs);
  }
};

export const userStore = {
  getAll: () => {
    const us = getL<User[]>(L_KEYS.USERS, []);
    if (us.length === 0) {
      setL(L_KEYS.USERS, MOCK_USERS);
      return MOCK_USERS;
    }
    return us;
  },
  getByBusiness: (bid: string) => userStore.getAll().filter(u => u.businessId === bid),
  getById: (id: string) => userStore.getAll().find(u => u.id === id),
  save: (u: User) => {
    const us = userStore.getAll();
    const idx = us.findIndex(item => item.id === u.id);
    if (idx >= 0) us[idx] = u; else us.push(u);
    setL(L_KEYS.USERS, us);
  }
};

export const jobStore = {
  getAll: () => {
    const js = getL<Job[]>(L_KEYS.JOBS, []);
    if (js.length === 0) {
      setL(L_KEYS.JOBS, MOCK_JOBS);
      return MOCK_JOBS;
    }
    return js;
  },
  getByBusiness: (bid: string) => jobStore.getAll().filter(j => j.businessId === bid),
  getById: (id: string) => jobStore.getAll().find(j => j.id === id),
  save: (j: Job) => {
    const js = jobStore.getAll();
    const idx = js.findIndex(item => item.id === j.id);
    if (idx >= 0) js[idx] = j; else js.push(j);
    setL(L_KEYS.JOBS, js);
  }
};

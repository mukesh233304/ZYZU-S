/**
 * FOCUSPOINT — Location Demand & Unserved Area Service
 * 
 * Tracks real-time demand when students/parents search for study libraries
 * or verified home tutors in localities/districts with zero listed providers.
 * Supports de-duplicated aggregation, interest registration capture,
 * District Admin review, onboarding opportunity actions, and audit trails.
 */

export type LibraryDemandStatus = 
  | 'NEW' 
  | 'UNDER_REVIEW' 
  | 'CONTACTED' 
  | 'LIBRARY_IDENTIFIED' 
  | 'ONBOARDING' 
  | 'LISTED' 
  | 'CLOSED';

export type TeacherDemandStatus = 
  | 'NEW' 
  | 'UNDER_REVIEW' 
  | 'TEACHER_SEARCH' 
  | 'TEACHER_CONTACTED' 
  | 'ONBOARDING' 
  | 'FULFILLED' 
  | 'CLOSED';

export interface ProtectedContactInfo {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface LibraryDemandRecord {
  id: string;
  state: string;
  district: string;
  locality: string;
  searchCount: number;
  uniqueUsers: number;
  requestedFacilities: string[];
  firstRequestedDate: string;
  lastRequestedDate: string;
  status: LibraryDemandStatus;
  adminNotes?: string;
  contacts?: ProtectedContactInfo[];
}

export interface TeacherDemandRecord {
  id: string;
  state: string;
  district: string;
  locality: string;
  classGrade: string;
  subject: string;
  searchCount: number;
  uniqueDemand: number;
  firstRequestedDate: string;
  lastRequestedDate: string;
  status: TeacherDemandStatus;
  adminNotes?: string;
  contacts?: ProtectedContactInfo[];
}

const DEFAULT_LIBRARY_DEMANDS: LibraryDemandRecord[] = [
  {
    id: 'lib-dem-01',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Mardah',
    searchCount: 42,
    uniqueUsers: 28,
    requestedFacilities: ['AC', 'Wi-Fi', 'Power Backup'],
    firstRequestedDate: '2026-08-15',
    lastRequestedDate: '2026-09-24',
    status: 'LIBRARY_IDENTIFIED',
    adminNotes: 'Contacted Surya Coaching Hall; owner interested in affiliating 30 study cabins.'
  },
  {
    id: 'lib-dem-02',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Zamania',
    searchCount: 89,
    uniqueUsers: 64,
    requestedFacilities: ['AC', 'Wi-Fi', 'Parking', 'RO Water'],
    firstRequestedDate: '2026-08-01',
    lastRequestedDate: '2026-09-25',
    status: 'ONBOARDING',
    adminNotes: 'Inspection scheduled by District Admin for verified electricity & fire safety.'
  },
  {
    id: 'lib-dem-03',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Dullahpur',
    searchCount: 19,
    uniqueUsers: 14,
    requestedFacilities: ['Wi-Fi', 'Power Backup'],
    firstRequestedDate: '2026-09-10',
    lastRequestedDate: '2026-09-23',
    status: 'NEW',
    adminNotes: 'Initial demand flagged from student search telemetry.'
  }
];

const DEFAULT_TEACHER_DEMANDS: TeacherDemandRecord[] = [
  {
    id: 'tch-dem-01',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Sadat',
    classGrade: 'UKG',
    subject: 'All Subjects',
    searchCount: 31,
    uniqueDemand: 22,
    firstRequestedDate: '2026-08-20',
    lastRequestedDate: '2026-09-24',
    status: 'TEACHER_SEARCH',
    adminNotes: 'Reaching out to nearby certified kindergarten tutors in Saidpur block.'
  },
  {
    id: 'tch-dem-02',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Bhurkura',
    classGrade: 'Class 10',
    subject: 'Mathematics',
    searchCount: 56,
    uniqueDemand: 38,
    firstRequestedDate: '2026-08-05',
    lastRequestedDate: '2026-09-25',
    status: 'ONBOARDING',
    adminNotes: '2 M.Sc graduates from PG College undergoing degree & Aadhaar KYC.'
  },
  {
    id: 'tch-dem-03',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    locality: 'Nandganj',
    classGrade: 'Nursery',
    subject: 'All Subjects',
    searchCount: 15,
    uniqueDemand: 11,
    firstRequestedDate: '2026-09-12',
    lastRequestedDate: '2026-09-23',
    status: 'NEW',
    adminNotes: 'Fresh request pool for early foundation learning.'
  }
];

class LocationDemandService {
  private eventTarget = new EventTarget();
  private storageKeyLib = 'fp_location_demand_libraries';
  private storageKeyTch = 'fp_location_demand_teachers';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKeyLib || e.key === this.storageKeyTch) {
          this.eventTarget.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    this.eventTarget.addEventListener('change', handler);
    return () => this.eventTarget.removeEventListener('change', handler);
  }

  private notify() {
    this.eventTarget.dispatchEvent(new Event('change'));
  }

  // ==========================================
  // LIBRARY DEMAND METHODS
  // ==========================================

  public getLibraryDemands(district?: string): LibraryDemandRecord[] {
    let records = [...DEFAULT_LIBRARY_DEMANDS];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKeyLib);
        if (stored) records = JSON.parse(stored);
      } catch {
        records = [...DEFAULT_LIBRARY_DEMANDS];
      }
    }

    if (district) {
      const dLower = district.toLowerCase();
      records = records.filter(r => r.district.toLowerCase().includes(dLower));
    }
    return records;
  }

  public recordLibraryDemand(input: {
    state: string;
    district: string;
    locality: string;
    facility?: string;
    contact?: { name?: string; phone?: string; email?: string; notes?: string };
  }): LibraryDemandRecord {
    const records = this.getLibraryDemands();
    const today = new Date().toISOString().split('T')[0];

    // Find existing aggregate record for same locality & district
    const existingIdx = records.findIndex(
      r => r.district.toLowerCase() === input.district.toLowerCase() &&
           r.locality.toLowerCase() === input.locality.toLowerCase()
    );

    let updatedRecord: LibraryDemandRecord;

    if (existingIdx > -1) {
      const existing = records[existingIdx];
      const facilities = new Set(existing.requestedFacilities);
      if (input.facility && input.facility !== 'all') {
        facilities.add(input.facility.toUpperCase());
      }

      const contacts = [...(existing.contacts || [])];
      if (input.contact && (input.contact.phone || input.contact.email)) {
        contacts.push({
          ...input.contact,
          createdAt: new Date().toISOString()
        });
      }

      updatedRecord = {
        ...existing,
        searchCount: existing.searchCount + 1,
        uniqueUsers: input.contact ? existing.uniqueUsers + 1 : existing.uniqueUsers,
        requestedFacilities: Array.from(facilities),
        lastRequestedDate: today,
        contacts
      };
      records[existingIdx] = updatedRecord;
    } else {
      const facilities: string[] = [];
      if (input.facility && input.facility !== 'all') {
        facilities.push(input.facility.toUpperCase());
      } else {
        facilities.push('AC', 'Wi-Fi');
      }

      const contacts: ProtectedContactInfo[] = [];
      if (input.contact && (input.contact.phone || input.contact.email)) {
        contacts.push({
          ...input.contact,
          createdAt: new Date().toISOString()
        });
      }

      updatedRecord = {
        id: `lib-dem-${Date.now()}`,
        state: input.state || 'Uttar Pradesh',
        district: input.district,
        locality: input.locality,
        searchCount: 1,
        uniqueUsers: 1,
        requestedFacilities: facilities,
        firstRequestedDate: today,
        lastRequestedDate: today,
        status: 'NEW',
        contacts
      };
      records.unshift(updatedRecord);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKeyLib, JSON.stringify(records));
      this.notify();
    }
    return updatedRecord;
  }

  public updateLibraryDemandStatus(
    id: string, 
    status: LibraryDemandStatus, 
    adminNotes?: string
  ): boolean {
    const records = this.getLibraryDemands();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return false;

    records[idx].status = status;
    if (adminNotes) {
      records[idx].adminNotes = adminNotes;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKeyLib, JSON.stringify(records));
      this.notify();
    }
    return true;
  }

  // ==========================================
  // TEACHER DEMAND METHODS
  // ==========================================

  public getTeacherDemands(district?: string): TeacherDemandRecord[] {
    let records = [...DEFAULT_TEACHER_DEMANDS];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKeyTch);
        if (stored) records = JSON.parse(stored);
      } catch {
        records = [...DEFAULT_TEACHER_DEMANDS];
      }
    }

    if (district) {
      const dLower = district.toLowerCase();
      records = records.filter(r => r.district.toLowerCase().includes(dLower));
    }
    return records;
  }

  public recordTeacherDemand(input: {
    state: string;
    district: string;
    locality: string;
    classGrade: string;
    subject: string;
    contact?: { name?: string; phone?: string; email?: string; notes?: string };
  }): TeacherDemandRecord {
    const records = this.getTeacherDemands();
    const today = new Date().toISOString().split('T')[0];

    const existingIdx = records.findIndex(
      r => r.district.toLowerCase() === input.district.toLowerCase() &&
           r.locality.toLowerCase() === input.locality.toLowerCase() &&
           r.classGrade.toLowerCase() === input.classGrade.toLowerCase() &&
           r.subject.toLowerCase() === input.subject.toLowerCase()
    );

    let updatedRecord: TeacherDemandRecord;

    if (existingIdx > -1) {
      const existing = records[existingIdx];
      const contacts = [...(existing.contacts || [])];
      if (input.contact && (input.contact.phone || input.contact.email)) {
        contacts.push({
          ...input.contact,
          createdAt: new Date().toISOString()
        });
      }

      updatedRecord = {
        ...existing,
        searchCount: existing.searchCount + 1,
        uniqueDemand: input.contact ? existing.uniqueDemand + 1 : existing.uniqueDemand,
        lastRequestedDate: today,
        contacts
      };
      records[existingIdx] = updatedRecord;
    } else {
      const contacts: ProtectedContactInfo[] = [];
      if (input.contact && (input.contact.phone || input.contact.email)) {
        contacts.push({
          ...input.contact,
          createdAt: new Date().toISOString()
        });
      }

      updatedRecord = {
        id: `tch-dem-${Date.now()}`,
        state: input.state || 'Uttar Pradesh',
        district: input.district,
        locality: input.locality,
        classGrade: input.classGrade,
        subject: input.subject,
        searchCount: 1,
        uniqueDemand: 1,
        firstRequestedDate: today,
        lastRequestedDate: today,
        status: 'NEW',
        contacts
      };
      records.unshift(updatedRecord);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKeyTch, JSON.stringify(records));
      this.notify();
    }
    return updatedRecord;
  }

  public updateTeacherDemandStatus(
    id: string, 
    status: TeacherDemandStatus, 
    adminNotes?: string
  ): boolean {
    const records = this.getTeacherDemands();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return false;

    records[idx].status = status;
    if (adminNotes) {
      records[idx].adminNotes = adminNotes;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKeyTch, JSON.stringify(records));
      this.notify();
    }
    return true;
  }
}

export const locationDemandService = new LocationDemandService();

import fs from 'fs';
import path from 'path';
import { RateItem, HospitalItem, CommonProfile } from '@/types/form';

const DATA_DIR = path.join(process.cwd(), 'data');
const RATELIST_FILE = path.join(DATA_DIR, 'ratelist.json');
const NOSQL_DB_FILE = path.join(DATA_DIR, 'ratelist_nosql_db.json');

interface NoSqlSchema {
  collection: string;
  count: number;
  updatedAt: string;
  items: RateItem[];
  hospitals: HospitalItem[];
  mockProfile: CommonProfile;
}

const DEFAULT_HOSPITALS: HospitalItem[] = [
  { id: 'h1', name: 'Max Super Speciality Hospital, Saket, New Delhi', address: '1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi', isPanel: true },
  { id: 'h2', name: 'Fortis Escorts Heart Institute, Okhla, New Delhi', address: 'Okhla Road, Opp Holy Family Hospital, New Delhi', isPanel: true },
  { id: 'h3', name: 'Apollo Hospitals, Sarita Vihar, New Delhi', address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi', isPanel: true },
  { id: 'h4', name: 'Sir Ganga Ram Hospital, Rajinder Nagar, New Delhi', address: 'Rajinder Nagar, New Delhi', isPanel: true },
  { id: 'h5', name: 'BLK-Max Super Speciality Hospital, Pusa Road, New Delhi', address: 'Pusa Road, Rajinder Nagar, New Delhi', isPanel: true },
  { id: 'h6', name: 'Venkateshwar Hospital, Dwarka, New Delhi', address: 'Sector 18A, Dwarka, New Delhi', isPanel: true },
  { id: 'h7', name: 'Artemis Hospital, Gurugram', address: 'Sector 51, Gurugram, Haryana', isPanel: true },
  { id: 'h8', name: 'Rajiv Gandhi Cancer Institute and Research Centre, Rohini', address: 'Sector 5, Rohini, New Delhi', isPanel: true },
  { id: 'h9', name: 'Narayana Superspeciality Hospital, Gurugram', address: 'DLF Phase 3, Gurugram, Haryana', isPanel: true },
  { id: 'h10', name: 'Metro Hospital & Heart Institute, Lajpat Nagar', address: 'Lajpat Nagar IV, Ring Road, New Delhi', isPanel: true },
  { id: 'other', name: 'OTHER (NOT FROM PANEL - ENTER MANUALLY)', address: '', isPanel: false }
];

const DEFAULT_MOCK_PROFILE: CommonProfile = {
  employeeName: 'RAJESH KUMAR SHARMA',
  employeeId: 'EMP-98241',
  employeeCode: 'EC-44120',
  designation: 'Senior Section Officer',
  cardNo: 'DGEHS-DEL-887412',
  placeOfIssue: 'Dispensary Gulabi Bagh, Delhi',
  validFrom: '2024-01-01',
  validTo: '2029-12-31',
  residenceAddress: 'H.No. 402, Block-C, Govt. Officers Colony, Gulabi Bagh, Delhi-110007',
  phoneMobile: '9876543210',
  phoneOffice: '011-23891042',
  phoneRes: '011-27459812',
  email: 'rajesh.sharma@gov.in',
  basicPay: '78800',
  payLevel: 'Level 10 (Pay Matrix 56100-177500)',
  entitlement: 'Pvt.',
  status: 'Govt. Servant',
  bankName: 'State Bank of India',
  bankBranch: 'Delhi Secretariat Branch, IP Estate, New Delhi',
  sbAccountNo: '30491823901',
  micrCode: '110002044',
  ifsCode: 'SBIN0000677',
  bankPhone: '011-23392104'
};

class NoSqlFileDB {
  private data: NoSqlSchema | null = null;

  private initializeDb(): NoSqlSchema {
    let items: RateItem[] = [];
    if (fs.existsSync(RATELIST_FILE)) {
      try {
        const rawList = fs.readFileSync(RATELIST_FILE, 'utf8');
        const parsed = JSON.parse(rawList);
        items = parsed.rateListArray || [];
      } catch (e) {
        console.error('Failed reading ratelist.json for DB seed', e);
      }
    }

    if (fs.existsSync(NOSQL_DB_FILE)) {
      try {
        const raw = fs.readFileSync(NOSQL_DB_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        // Fall through to default initialization
      }
    }

    const schema: NoSqlSchema = {
      collection: 'cghs_rate_list',
      count: items.length,
      updatedAt: new Date().toISOString(),
      items: items,
      hospitals: DEFAULT_HOSPITALS,
      mockProfile: DEFAULT_MOCK_PROFILE
    };

    // Attempt writing cache to disk only if writeable (ignored in read-only serverless runtimes)
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(NOSQL_DB_FILE, JSON.stringify(schema, null, 2), 'utf8');
    } catch {
      // In serverless / read-only filesystem (e.g. Vercel), hold in memory
    }

    return schema;
  }

  private getDb(): NoSqlSchema {
    if (!this.data) {
      this.data = this.initializeDb();
    }
    return this.data;
  }

  public searchRateList(query: string, limit = 40): RateItem[] {
    const db = this.getDb();
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return db.items.slice(0, limit);
    }

    return db.items.filter(item => {
      const code = (item.alphanumeric_code || '').toLowerCase();
      const name = (item.cghs_treatment_procedure_investigation_list || '').toLowerCase();
      const cat = (item.speciality_classification || '').toLowerCase();
      return code.includes(q) || name.includes(q) || cat.includes(q);
    }).slice(0, limit);
  }

  public getHospitals(): HospitalItem[] {
    return this.getDb().hospitals;
  }

  public getMockProfile(): CommonProfile {
    return this.getDb().mockProfile;
  }

  public saveProfile(profile: CommonProfile): CommonProfile {
    const db = this.getDb();
    db.mockProfile = profile;
    try {
      fs.writeFileSync(NOSQL_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch {
      // In serverless environments (Vercel / AWS Lambda), the filesystem is read-only
      // In-memory update is preserved for the lifecycle of the warm instance
    }
    return db.mockProfile;
  }
}

export const localDb = new NoSqlFileDB();

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { CommonProfile, HospitalItem, RateItem } from '@/types/form';
import { localDb } from './db';

const DEFAULT_HOSPITALS: HospitalItem[] = [
  { id: 'h1', name: 'Max Super Speciality Hospital, Saket, New Delhi', address: '1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h2', name: 'Fortis Escorts Heart Institute, Okhla, New Delhi', address: 'Okhla Road, Opp Holy Family Hospital, New Delhi', isPanel: true, type: 'Super Speciality' },
  { id: 'h3', name: 'Apollo Hospitals, Sarita Vihar, New Delhi', address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h4', name: 'Sir Ganga Ram Hospital, Rajinder Nagar, New Delhi', address: 'Rajinder Nagar, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h5', name: 'BLK-Max Super Speciality Hospital, Pusa Road, New Delhi', address: 'Pusa Road, Rajinder Nagar, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h6', name: 'Venkateshwar Hospital, Dwarka, New Delhi', address: 'Sector 18A, Dwarka, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h7', name: 'Artemis Hospital, Gurugram', address: 'Sector 51, Gurugram, Haryana', isPanel: true, type: 'NABH' },
  { id: 'h8', name: 'Rajiv Gandhi Cancer Institute and Research Centre, Rohini', address: 'Sector 5, Rohini, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'h9', name: 'Narayana Superspeciality Hospital, Gurugram', address: 'DLF Phase 3, Gurugram, Haryana', isPanel: true, type: 'NABH' },
  { id: 'h10', name: 'Metro Hospital & Heart Institute, Lajpat Nagar', address: 'Lajpat Nagar IV, Ring Road, New Delhi', isPanel: true, type: 'NABH' },
  { id: 'other', name: 'OTHER (NOT FROM PANEL - ENTER MANUALLY)', address: '', isPanel: false, type: 'non-NABH' }
];

let schemaInitialized = false;

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL
  );
}

export function getNeonClient(): NeonQueryFunction<false, false> | null {
  const connStr = getDatabaseUrl();
  if (!connStr) {
    return null;
  }
  return neon(connStr);
}

export async function ensureNeonSchema(): Promise<void> {
  if (schemaInitialized) return;
  const sql = getNeonClient();
  if (!sql) return;

  try {
    // 1. User Profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        employee_name TEXT DEFAULT '',
        employee_id TEXT DEFAULT '',
        employee_code TEXT DEFAULT '',
        designation TEXT DEFAULT '',
        card_no TEXT DEFAULT '',
        place_of_issue TEXT DEFAULT '',
        valid_from TEXT DEFAULT '',
        valid_to TEXT DEFAULT '',
        residence_address TEXT DEFAULT '',
        phone_mobile TEXT DEFAULT '',
        phone_office TEXT DEFAULT '',
        phone_res TEXT DEFAULT '',
        email_contact TEXT DEFAULT '',
        basic_pay TEXT DEFAULT '',
        pay_level TEXT DEFAULT '',
        entitlement TEXT DEFAULT 'Pvt.',
        status TEXT DEFAULT 'Govt. Servant',
        bank_name TEXT DEFAULT '',
        bank_branch TEXT DEFAULT '',
        sb_account_no TEXT DEFAULT '',
        micr_code TEXT DEFAULT '',
        ifs_code TEXT DEFAULT '',
        bank_phone TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Claims table
    await sql`
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        form_data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_claims_user_email ON claims(user_email);
    `;

    // 3. Hospitals table
    await sql`
      CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT DEFAULT '',
        is_panel BOOLEAN DEFAULT true,
        type TEXT DEFAULT 'NABH'
      );
    `;

    // 4. Rate Items table
    await sql`
      CREATE TABLE IF NOT EXISTS rate_items (
        id SERIAL PRIMARY KEY,
        s_no TEXT,
        speciality_classification TEXT,
        alphanumeric_code TEXT,
        cghs_treatment_procedure_investigation_list TEXT,
        tier_i_nabh_general_ward TEXT
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_rate_items_code ON rate_items(alphanumeric_code);
    `;

    schemaInitialized = true;
    console.log('✅ Neon DB PostgreSQL Schema verified/initialized successfully');
  } catch (err) {
    console.warn('Neon DB schema initialization warning:', err);
  }
}

function mapRowToProfile(row: any): CommonProfile {
  return {
    employeeName: row.employee_name || '',
    employeeId: row.employee_id || '',
    employeeCode: row.employee_code || '',
    designation: row.designation || '',
    cardNo: row.card_no || '',
    placeOfIssue: row.place_of_issue || '',
    validFrom: row.valid_from || '',
    validTo: row.valid_to || '',
    residenceAddress: row.residence_address || '',
    phoneMobile: row.phone_mobile || '',
    phoneOffice: row.phone_office || '',
    phoneRes: row.phone_res || '',
    email: row.email || '',
    basicPay: row.basic_pay || '',
    payLevel: row.pay_level || '',
    entitlement: (row.entitlement || 'Pvt.') as any,
    status: (row.status || 'Govt. Servant') as any,
    bankName: row.bank_name || '',
    bankBranch: row.bank_branch || '',
    sbAccountNo: row.sb_account_no || '',
    micrCode: row.micr_code || '',
    ifsCode: row.ifs_code || '',
    bankPhone: row.bank_phone || ''
  };
}

// User Profile Queries
export async function getNeonUserProfile(email: string): Promise<CommonProfile | null> {
  const sql = getNeonClient();
  if (!sql) {
    const prof = localDb.getMockProfile();
    return { ...prof, email };
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      SELECT * FROM user_profiles WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      return mapRowToProfile(rows[0]);
    }
    return null;
  } catch (e) {
    console.warn('Error querying Neon user profile:', e);
    const prof = localDb.getMockProfile();
    return { ...prof, email };
  }
}

export async function upsertNeonUserProfile(email: string, profile: Partial<CommonProfile>): Promise<CommonProfile> {
  const sql = getNeonClient();
  const cleanEmail = email.trim().toLowerCase();

  if (!sql) {
    const mock = localDb.saveProfile({
      ...localDb.getMockProfile(),
      ...profile,
      email: cleanEmail
    });
    return mock;
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      INSERT INTO user_profiles (
        email, employee_name, employee_id, employee_code, designation,
        card_no, place_of_issue, valid_from, valid_to, residence_address,
        phone_mobile, phone_office, phone_res, basic_pay, pay_level,
        entitlement, status, bank_name, bank_branch, sb_account_no,
        micr_code, ifs_code, bank_phone, updated_at
      ) VALUES (
        ${cleanEmail},
        ${profile.employeeName || ''},
        ${profile.employeeId || ''},
        ${profile.employeeCode || ''},
        ${profile.designation || ''},
        ${profile.cardNo || ''},
        ${profile.placeOfIssue || ''},
        ${profile.validFrom || ''},
        ${profile.validTo || ''},
        ${profile.residenceAddress || ''},
        ${profile.phoneMobile || ''},
        ${profile.phoneOffice || ''},
        ${profile.phoneRes || ''},
        ${profile.basicPay || ''},
        ${profile.payLevel || ''},
        ${profile.entitlement || 'Pvt.'},
        ${profile.status || 'Govt. Servant'},
        ${profile.bankName || ''},
        ${profile.bankBranch || ''},
        ${profile.sbAccountNo || ''},
        ${profile.micrCode || ''},
        ${profile.ifsCode || ''},
        ${profile.bankPhone || ''},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) DO UPDATE SET
        employee_name = COALESCE(EXCLUDED.employee_name, user_profiles.employee_name),
        employee_id = COALESCE(EXCLUDED.employee_id, user_profiles.employee_id),
        employee_code = COALESCE(EXCLUDED.employee_code, user_profiles.employee_code),
        designation = COALESCE(EXCLUDED.designation, user_profiles.designation),
        card_no = COALESCE(EXCLUDED.card_no, user_profiles.card_no),
        place_of_issue = COALESCE(EXCLUDED.place_of_issue, user_profiles.place_of_issue),
        valid_from = COALESCE(EXCLUDED.valid_from, user_profiles.valid_from),
        valid_to = COALESCE(EXCLUDED.valid_to, user_profiles.valid_to),
        residence_address = COALESCE(EXCLUDED.residence_address, user_profiles.residence_address),
        phone_mobile = COALESCE(EXCLUDED.phone_mobile, user_profiles.phone_mobile),
        phone_office = COALESCE(EXCLUDED.phone_office, user_profiles.phone_office),
        phone_res = COALESCE(EXCLUDED.phone_res, user_profiles.phone_res),
        basic_pay = COALESCE(EXCLUDED.basic_pay, user_profiles.basic_pay),
        pay_level = COALESCE(EXCLUDED.pay_level, user_profiles.pay_level),
        entitlement = COALESCE(EXCLUDED.entitlement, user_profiles.entitlement),
        status = COALESCE(EXCLUDED.status, user_profiles.status),
        bank_name = COALESCE(EXCLUDED.bank_name, user_profiles.bank_name),
        bank_branch = COALESCE(EXCLUDED.bank_branch, user_profiles.bank_branch),
        sb_account_no = COALESCE(EXCLUDED.sb_account_no, user_profiles.sb_account_no),
        micr_code = COALESCE(EXCLUDED.micr_code, user_profiles.micr_code),
        ifs_code = COALESCE(EXCLUDED.ifs_code, user_profiles.ifs_code),
        bank_phone = COALESCE(EXCLUDED.bank_phone, user_profiles.bank_phone),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return mapRowToProfile(rows[0]);
  } catch (e) {
    console.error('Failed saving profile in Neon DB:', e);
    const mock = localDb.saveProfile({
      ...localDb.getMockProfile(),
      ...profile,
      email: cleanEmail
    });
    return mock;
  }
}

// Claims Queries
export async function getNeonUserClaims(email: string): Promise<any[]> {
  const sql = getNeonClient();
  if (!sql) {
    return [];
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      SELECT id as "_id", id, user_email as "userEmail", title, status, form_data as "formData", created_at as "createdAt", updated_at as "updatedAt"
      FROM claims
      WHERE LOWER(user_email) = LOWER(${email.trim()})
      ORDER BY updated_at DESC;
    `;
    return rows;
  } catch (e) {
    console.warn('Error fetching Neon claims:', e);
    return [];
  }
}

export async function saveNeonUserClaim(
  email: string,
  claim: { claimId?: string; title?: string; status?: string; formData: any }
): Promise<any> {
  const sql = getNeonClient();
  const id = claim.claimId || `claim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const title = claim.title || `Medical Claim - ${new Date().toLocaleDateString()}`;
  const status = claim.status || 'DRAFT';

  if (!sql) {
    return {
      _id: id,
      id,
      userEmail: email,
      title,
      status,
      formData: claim.formData,
      updatedAt: new Date().toISOString()
    };
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      INSERT INTO claims (id, user_email, title, status, form_data, updated_at)
      VALUES (${id}, ${email.trim().toLowerCase()}, ${title}, ${status}, ${JSON.stringify(claim.formData)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        form_data = EXCLUDED.form_data,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id as "_id", id, user_email as "userEmail", title, status, form_data as "formData", created_at as "createdAt", updated_at as "updatedAt";
    `;
    return rows[0];
  } catch (e) {
    console.error('Error saving Neon claim:', e);
    return {
      _id: id,
      id,
      userEmail: email,
      title,
      status,
      formData: claim.formData,
      updatedAt: new Date().toISOString()
    };
  }
}

// Hospitals Queries
export async function getNeonHospitals(): Promise<HospitalItem[]> {
  const sql = getNeonClient();
  if (!sql) {
    return DEFAULT_HOSPITALS;
  }

  await ensureNeonSchema();
  try {
    const countRes = await sql`SELECT count(*)::int as count FROM hospitals;`;
    if (countRes[0].count === 0) {
      for (const h of DEFAULT_HOSPITALS) {
        await sql`
          INSERT INTO hospitals (id, name, address, is_panel, type)
          VALUES (${h.id}, ${h.name}, ${h.address || ''}, ${h.isPanel}, ${h.type || 'NABH'})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    const rows = await sql`SELECT id, name, address, is_panel as "isPanel", type FROM hospitals ORDER BY name ASC;`;
    return rows as HospitalItem[];
  } catch (e) {
    console.warn('Error querying Neon hospitals:', e);
    return DEFAULT_HOSPITALS;
  }
}

// Rate Items Queries
export async function searchNeonRateItems(query: string, limit = 40): Promise<RateItem[]> {
  const sql = getNeonClient();
  if (!sql) {
    return localDb.searchRateList(query, limit);
  }

  await ensureNeonSchema();
  try {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      const rows = await sql`
        SELECT s_no, speciality_classification, alphanumeric_code, cghs_treatment_procedure_investigation_list, tier_i_nabh_general_ward
        FROM rate_items
        LIMIT ${limit};
      `;
      if (rows.length === 0) {
        return localDb.searchRateList(query, limit);
      }
      return rows as RateItem[];
    }

    const pattern = `%${cleanQuery}%`;
    const rows = await sql`
      SELECT s_no, speciality_classification, alphanumeric_code, cghs_treatment_procedure_investigation_list, tier_i_nabh_general_ward
      FROM rate_items
      WHERE alphanumeric_code ILIKE ${pattern}
         OR cghs_treatment_procedure_investigation_list ILIKE ${pattern}
         OR speciality_classification ILIKE ${pattern}
      LIMIT ${limit};
    `;

    if (rows.length === 0) {
      return localDb.searchRateList(query, limit);
    }
    return rows as RateItem[];
  } catch (e) {
    console.warn('Error querying Neon rate items, using local fallback:', e);
    return localDb.searchRateList(query, limit);
  }
}

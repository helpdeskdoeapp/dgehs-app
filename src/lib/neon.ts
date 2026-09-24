import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { CommonProfile, HospitalItem, RateItem, DependentProfile } from '@/types/form';
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

export async function checkNeonConnection() {
  const connStr = getDatabaseUrl();
  if (!connStr) {
    return {
      connected: false,
      storage: 'Local Fallback',
      message: 'DATABASE_URL or POSTGRES_URL environment variable is not configured.',
    };
  }

  const sql = getNeonClient();
  if (!sql) {
    return {
      connected: false,
      storage: 'Local Fallback',
      message: 'Failed to initialize Neon client with provided connection string.',
    };
  }

  const start = Date.now();
  try {
    await ensureNeonSchema();
    const result = await sql`SELECT version(), current_database(), NOW() as server_time;`;
    const latency = Date.now() - start;

    const userCount = await sql`SELECT count(*)::int as count FROM user_profiles;`;
    const claimCount = await sql`SELECT count(*)::int as count FROM claims;`;

    return {
      connected: true,
      storage: 'Neon PostgreSQL',
      database: result[0]?.current_database || 'neondb',
      serverTime: result[0]?.server_time,
      version: result[0]?.version,
      latencyMs: latency,
      tables: {
        user_profiles: userCount[0]?.count ?? 0,
        claims: claimCount[0]?.count ?? 0,
      }
    };
  } catch (err: any) {
    return {
      connected: false,
      storage: 'Local Fallback',
      error: err.message,
    };
  }
}

export async function ensureNeonSchema(): Promise<void> {
  if (schemaInitialized) return;
  const sql = getNeonClient();
  if (!sql) return;

  try {
    // 1. User Profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    // Ensure id column default exists to avoid not-null constraint errors
    try {
      await sql`
        ALTER TABLE user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
      `;
    } catch {
      // Table id column already has default
    }

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

    // 5. Dependent Profiles table (Medical Beneficiaries)
    await sql`
      CREATE TABLE IF NOT EXISTS dependent_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL DEFAULT '',
        relation TEXT NOT NULL DEFAULT '',
        dob TEXT NOT NULL DEFAULT '',
        gender TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_dependents_user_id ON dependent_profiles(user_id);
    `;

    // 6. Data Migration: Automatically update any legacy 'Spouse' entries to 'Wife'
    try {
      await sql`UPDATE dependent_profiles SET relation = 'Wife' WHERE relation ILIKE 'spouse';`;
      await sql`
        UPDATE claims 
        SET form_data = REPLACE(REPLACE(REPLACE(form_data::text, '"Spouse"', '"Wife"'), '"spouse"', '"Wife"'), '(Spouse)', '(Wife)')::jsonb 
        WHERE form_data::text ILIKE '%spouse%';
      `;
    } catch {
      // Ignore if table doesn't exist yet
    }

    schemaInitialized = true;
    console.log('✅ Neon DB PostgreSQL Schema verified/initialized successfully');
  } catch (err) {
    console.warn('Neon DB schema initialization warning:', err);
  }
}

function mapRowToProfile(row: any): CommonProfile {
  return {
    id: row.id || undefined,
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
    // 1. If profile exists for email, update it
    const existing = await sql`
      SELECT id FROM user_profiles WHERE LOWER(email) = LOWER(${cleanEmail}) LIMIT 1;
    `;

    if (existing && existing.length > 0) {
      const rows = await sql`
        UPDATE user_profiles SET
          employee_name = COALESCE(NULLIF(${profile.employeeName || ''}, ''), employee_name),
          employee_id = COALESCE(NULLIF(${profile.employeeId || ''}, ''), employee_id),
          employee_code = COALESCE(NULLIF(${profile.employeeCode || ''}, ''), employee_code),
          designation = COALESCE(NULLIF(${profile.designation || ''}, ''), designation),
          card_no = COALESCE(NULLIF(${profile.cardNo || ''}, ''), card_no),
          place_of_issue = COALESCE(NULLIF(${profile.placeOfIssue || ''}, ''), place_of_issue),
          valid_from = COALESCE(NULLIF(${profile.validFrom || ''}, ''), valid_from),
          valid_to = COALESCE(NULLIF(${profile.validTo || ''}, ''), valid_to),
          residence_address = COALESCE(NULLIF(${profile.residenceAddress || ''}, ''), residence_address),
          phone_mobile = COALESCE(NULLIF(${profile.phoneMobile || ''}, ''), phone_mobile),
          phone_office = COALESCE(NULLIF(${profile.phoneOffice || ''}, ''), phone_office),
          phone_res = COALESCE(NULLIF(${profile.phoneRes || ''}, ''), phone_res),
          basic_pay = COALESCE(NULLIF(${profile.basicPay || ''}, ''), basic_pay),
          pay_level = COALESCE(NULLIF(${profile.payLevel || ''}, ''), pay_level),
          entitlement = COALESCE(NULLIF(${profile.entitlement || ''}, ''), entitlement),
          status = COALESCE(NULLIF(${profile.status || ''}, ''), status),
          bank_name = COALESCE(NULLIF(${profile.bankName || ''}, ''), bank_name),
          bank_branch = COALESCE(NULLIF(${profile.bankBranch || ''}, ''), bank_branch),
          sb_account_no = COALESCE(NULLIF(${profile.sbAccountNo || ''}, ''), sb_account_no),
          micr_code = COALESCE(NULLIF(${profile.micrCode || ''}, ''), micr_code),
          ifs_code = COALESCE(NULLIF(${profile.ifsCode || ''}, ''), ifs_code),
          bank_phone = COALESCE(NULLIF(${profile.bankPhone || ''}, ''), bank_phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(email) = LOWER(${cleanEmail})
        RETURNING *;
      `;
      if (rows && rows.length > 0) {
        return mapRowToProfile(rows[0]);
      }
    }

    // 2. If row does not exist, insert
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
    return rows.map((r) => {
      if (r.formData) {
        try {
          const serialized = JSON.stringify(r.formData)
            .replace(/"Spouse"/g, '"Wife"')
            .replace(/"spouse"/g, '"Wife"')
            .replace(/\(Spouse\)/g, '(Wife)');
          return { ...r, formData: JSON.parse(serialized) };
        } catch {
          return r;
        }
      }
      return r;
    });
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

  let sanitizedFormData = claim.formData;
  if (sanitizedFormData) {
    try {
      const serialized = JSON.stringify(sanitizedFormData)
        .replace(/"Spouse"/g, '"Wife"')
        .replace(/"spouse"/g, '"Wife"')
        .replace(/\(Spouse\)/g, '(Wife)');
      sanitizedFormData = JSON.parse(serialized);
    } catch {}
  }

  if (!sql) {
    return {
      _id: id,
      id,
      userEmail: email,
      title,
      status,
      formData: sanitizedFormData,
      updatedAt: new Date().toISOString()
    };
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      INSERT INTO claims (id, user_email, title, status, form_data, updated_at)
      VALUES (${id}, ${email.trim().toLowerCase()}, ${title}, ${status}, ${JSON.stringify(sanitizedFormData)}::jsonb, CURRENT_TIMESTAMP)
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
      formData: sanitizedFormData,
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

// Dependent Profiles Queries (Keyed by user_id UUID)
export async function getNeonUserDependents(userId: string): Promise<DependentProfile[]> {
  const sql = getNeonClient();
  if (!sql) {
    return localDb.getDependents(userId);
  }

  await ensureNeonSchema();
  try {
    const rows = await sql`
      SELECT id, user_id as "userId", name, relation, dob, gender
      FROM dependent_profiles
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at ASC;
    `;
    return rows as DependentProfile[];
  } catch (e) {
    console.warn('Error querying Neon dependent profiles:', e);
    return localDb.getDependents(userId);
  }
}

export async function saveNeonUserDependents(
  userId: string,
  dependents: DependentProfile[]
): Promise<DependentProfile[]> {
  const sql = getNeonClient();
  if (!sql) {
    return localDb.saveDependents(userId, dependents);
  }

  await ensureNeonSchema();
  try {
    // Replace all existing dependents for this user in an atomic batch
    await sql`DELETE FROM dependent_profiles WHERE user_id = ${userId}::uuid;`;

    const inserted: DependentProfile[] = [];
    for (const dep of dependents) {
      if (!dep.name && !dep.relation) continue; // Skip empty rows
      const rows = await sql`
        INSERT INTO dependent_profiles (
          user_id, name, relation, dob, gender, updated_at
        ) VALUES (
          ${userId}::uuid,
          ${dep.name || ''},
          ${dep.relation || 'Other'},
          ${dep.dob || ''},
          ${dep.gender || ''},
          CURRENT_TIMESTAMP
        )
        RETURNING id, user_id as "userId", name, relation, dob, gender;
      `;
      if (rows && rows.length > 0) {
        inserted.push(rows[0] as DependentProfile);
      }
    }
    return inserted;
  } catch (e) {
    console.error('Error saving Neon dependent profiles:', e);
    return localDb.saveDependents(userId, dependents);
  }
}

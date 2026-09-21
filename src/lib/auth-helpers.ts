import { CommonProfile } from '@/types/form';

export interface ParsedGovEmail {
  isValid: boolean;
  email: string;
  employeeId: string;
  firstName: string;
  errorMessage?: string;
}

export function parseGovEmail(emailStr: string): ParsedGovEmail {
  const cleanEmail = (emailStr || '').trim().toLowerCase();

  if (!cleanEmail) {
    return { isValid: false, email: '', employeeId: '', firstName: '', errorMessage: 'Email address is required' };
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      email: cleanEmail,
      employeeId: '',
      firstName: '',
      errorMessage: 'Please enter a valid email address.'
    };
  }

  const prefix = cleanEmail.split('@')[0]; // e.g. "98241.rajesh" or "john.doe" or "alex"
  const parts = prefix.split(/[._-]+/);

  // Check if first part looks like numeric employee ID
  const isFirstPartNumeric = /^\d+$/.test(parts[0]);
  let employeeId = '';
  let firstName = 'Officer';

  if (isFirstPartNumeric) {
    employeeId = parts[0].toUpperCase();
    if (parts.length > 1) {
      const rawName = parts.slice(1).join(' ');
      firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
    } else {
      firstName = 'Employee ' + employeeId;
    }
  } else {
    // Standard user email (e.g., john.doe@gmail.com)
    // Deterministically generate a 5-digit employee ID from the email
    let hash = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      hash = ((hash << 5) - hash) + cleanEmail.charCodeAt(i);
      hash |= 0;
    }
    const numId = Math.abs(hash % 90000) + 10000;
    employeeId = `${numId}`;

    const rawFirst = parts[0] || 'User';
    firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  }

  return {
    isValid: true,
    email: cleanEmail,
    employeeId: employeeId,
    firstName: firstName
  };
}

export function createDefaultProfileFromGovEmail(parsed: ParsedGovEmail, customName?: string): CommonProfile {
  const fullName = customName
    ? customName.toUpperCase()
    : `${parsed.firstName.toUpperCase()} KUMAR`;

  const empId = parsed.employeeId || '98241';

  return {
    employeeName: fullName,
    employeeId: empId,
    employeeCode: `EC-${empId}`,
    designation: 'Senior Section Officer',
    cardNo: `DGEHS-DEL-${empId}`,
    placeOfIssue: 'Dispensary Gulabi Bagh, Delhi',
    validFrom: '2024-01-01',
    validTo: '2029-12-31',
    residenceAddress: 'H.No. 402, Block-C, Govt. Officers Colony, Gulabi Bagh, Delhi-110007',
    phoneMobile: '9876543210',
    phoneOffice: '011-23891042',
    phoneRes: '011-27459812',
    email: parsed.email,
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
}

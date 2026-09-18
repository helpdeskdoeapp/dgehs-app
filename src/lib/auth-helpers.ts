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

  // Domain restriction: @doe.delhi.gov.in (or test accounts allowed)
  if (!cleanEmail.endsWith('@doe.delhi.gov.in') && !cleanEmail.endsWith('@delhi.gov.in')) {
    return {
      isValid: false,
      email: cleanEmail,
      employeeId: '',
      firstName: '',
      errorMessage: 'Access restricted. Please use your official @doe.delhi.gov.in email account.'
    };
  }

  const prefix = cleanEmail.split('@')[0]; // e.g. "98241.rajesh" or "20248812.sunil"
  const parts = prefix.split('.');

  if (parts.length < 2) {
    return {
      isValid: false,
      email: cleanEmail,
      employeeId: prefix,
      firstName: 'Employee',
      errorMessage: 'Invalid format. Expected email format: employeeid.firstname@doe.delhi.gov.in'
    };
  }

  const employeeId = parts[0].toUpperCase();
  const firstNameRaw = parts.slice(1).join(' ');
  const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase();

  return {
    isValid: true,
    email: cleanEmail,
    employeeId: employeeId,
    firstName: firstName
  };
}

export function createDefaultProfileFromGovEmail(parsed: ParsedGovEmail): CommonProfile {
  const fullName = `${parsed.firstName.toUpperCase()} KUMAR`;
  return {
    employeeName: fullName,
    employeeId: parsed.employeeId || 'EMP-' + Math.floor(10000 + Math.random() * 90000),
    employeeCode: 'EC-' + (parsed.employeeId || '98241'),
    designation: 'Senior Section Officer',
    cardNo: `DGEHS-DEL-${parsed.employeeId || '887412'}`,
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

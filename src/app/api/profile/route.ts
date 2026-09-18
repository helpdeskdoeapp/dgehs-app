import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserProfile from '@/lib/models/UserProfile';
import { cookies } from 'next/headers';

const DEFAULT_EMAIL = '98241.rajesh@doe.delhi.gov.in';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');
    let email = DEFAULT_EMAIL;

    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.email) email = session.email;
      } catch (e) {
        // fallback
      }
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'MongoDB Atlas connection is required'
      }, { status: 500 });
    }

    let profile = await UserProfile.findOne({ email });
    if (!profile) {
      profile = await UserProfile.create({
        email,
        employeeName: 'RAJESH KUMAR SHARMA',
        employeeId: '98241',
        employeeCode: 'EC-98241',
        designation: 'Senior Section Officer',
        cardNo: 'DGEHS-DEL-98241',
        placeOfIssue: 'Dispensary Gulabi Bagh, Delhi',
        validFrom: '2024-01-01',
        validTo: '2029-12-31',
        residenceAddress: 'H.No. 402, Block-C, Govt. Officers Colony, Gulabi Bagh, Delhi-110007',
        phoneMobile: '9876543210',
        phoneOffice: '011-23891042',
        phoneRes: '011-27459812',
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
      });
    }

    return NextResponse.json({
      success: true,
      data: profile.toObject()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const updatedProfile = await request.json();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');
    let email = updatedProfile.email || DEFAULT_EMAIL;

    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.email) email = session.email;
      } catch (e) {
        // fallback
      }
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'MongoDB Atlas connection is required'
      }, { status: 500 });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { email },
      { ...updatedProfile, email },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Employee profile updated in MongoDB Atlas!',
      data: profile.toObject()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

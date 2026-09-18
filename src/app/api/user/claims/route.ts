import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ClaimDocument from '@/lib/models/ClaimDocument';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({ success: true, data: [] });
    }

    const claims = await ClaimDocument.find({ userEmail: session.email }).sort({ updatedAt: -1 });
    return NextResponse.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dgehs_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { claimId, title, status, formData } = await request.json();
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Saved to local session',
        data: { title, status, formData }
      });
    }

    let claim;
    if (claimId) {
      claim = await ClaimDocument.findOneAndUpdate(
        { _id: claimId, userEmail: session.email },
        { title, status, formData, updatedAt: new Date() },
        { new: true }
      );
    } else {
      claim = await ClaimDocument.create({
        userEmail: session.email,
        title: title || `Medical Claim - ${new Date().toLocaleDateString()}`,
        status: status || 'DRAFT',
        formData
      });
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${status === 'SUBMITTED' ? 'submitted' : 'draft saved'} to MongoDB Atlas!`,
      data: claim
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

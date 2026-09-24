import { NextResponse } from 'next/server';
import { getNeonUserProfile, upsertNeonUserProfile, getNeonUserDependents, saveNeonUserDependents } from '@/lib/neon';
import { getCurrentUserSession } from '@/lib/auth-server';
import { parseGovEmail, createDefaultProfileFromGovEmail } from '@/lib/auth-helpers';
import { DependentProfile } from '@/types/form';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user?.email) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        data: [
          {
            name: 'RAJESH KUMAR SHARMA',
            relation: 'Self',
            dob: '1980-05-15',
            gender: 'Male'
          },
          {
            name: 'SUNITA SHARMA',
            relation: 'Wife',
            dob: '1984-08-20',
            gender: 'Female'
          },
          {
            name: 'ROHAN SHARMA',
            relation: 'Son',
            dob: '2010-11-12',
            gender: 'Male'
          }
        ],
        message: 'No active session. Returning standard default dependents.'
      });
    }

    const email = auth.user.email;
    let profile = await getNeonUserProfile(email);

    if (!profile) {
      const parsed = parseGovEmail(email);
      const defaultProf = createDefaultProfileFromGovEmail(parsed, auth.user.name || undefined);
      profile = await upsertNeonUserProfile(email, defaultProf);
    }

    const userId = profile.id || email;
    let dependents = await getNeonUserDependents(userId);

    // If no dependents are in DB, pre-seed with Self row
    if (!dependents || dependents.length === 0) {
      dependents = [
        {
          name: profile.employeeName || '',
          relation: 'Self',
          dob: '',
          gender: ''
        }
      ];
    }

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      userId: profile.id,
      data: dependents
    });
  } catch (error) {
    console.error('Error fetching dependents:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUserSession();

    if (!auth.isLoggedIn || !auth.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to save dependent details.' },
        { status: 401 }
      );
    }

    const email = auth.user.email;
    let profile = await getNeonUserProfile(email);

    if (!profile) {
      const parsed = parseGovEmail(email);
      const defaultProf = createDefaultProfileFromGovEmail(parsed, auth.user.name || undefined);
      profile = await upsertNeonUserProfile(email, defaultProf);
    }

    const userId = profile.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User account UUID could not be resolved.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const dependents: DependentProfile[] = Array.isArray(body)
      ? body
      : body.dependents || [];

    // Server-side validation
    for (let i = 0; i < dependents.length; i++) {
      const dep = dependents[i];
      if (!dep.name?.trim() || !dep.relation?.trim() || !dep.dob?.trim() || !dep.gender?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: `Dependent row #${i + 1} is missing required fields (Name, Relation, Date of Birth, or Gender).`
          },
          { status: 400 }
        );
      }
    }

    const saved = await saveNeonUserDependents(userId, dependents);

    return NextResponse.json({
      success: true,
      message: 'Dependent details saved successfully to database (dependent_profiles table)!',
      userId,
      data: saved
    });
  } catch (error) {
    console.error('Error saving dependents:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

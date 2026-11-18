import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, getUserState, saveUserState, sanitizeProfile } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { profileId, direction } = await req.json();

    if (!profileId || !['like', 'pass'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid swipe payload' }, { status: 400 });
    }

    const profiles = getAllProfiles();
    const target = profiles.find((p) => p.id === profileId);

    if (!target) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const state = getUserState();

    // Prevent duplicate swipes on the same profile
    if (!state.swipedIds.includes(profileId)) {
      state.swipedIds.push(profileId);
    }

    let isMatch = false;

    if (direction === 'like') {
      if (!state.likedIds.includes(profileId)) {
        state.likedIds.push(profileId);
      }
      if (target.likedCurrentUser) {
        isMatch = true;
        if (!state.matchedIds.includes(profileId)) {
          state.matchedIds.push(profileId);
        }
      }
    }

    saveUserState(state);

    return NextResponse.json({
      success: true,
      isMatch,
      matchedProfile: isMatch ? sanitizeProfile(target) : null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 });
  }
}
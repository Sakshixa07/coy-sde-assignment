import { NextResponse } from 'next/server';
import { getAllProfiles, getUserState, sanitizeProfile } from '@/lib/db';

export async function GET() {
  const profiles = getAllProfiles();
  const state = getUserState();

  const swipedSet = new Set(state.swipedIds);
  const unseen = profiles
    .filter((p) => !swipedSet.has(p.id))
    .map(sanitizeProfile);

  return NextResponse.json({ profiles: unseen });
}
import { NextResponse } from 'next/server';
import { getAllProfiles, getUserState, sanitizeProfile } from '@/lib/db';

export async function GET() {
  const profiles = getAllProfiles();
  const state = getUserState();

  const matchedSet = new Set(state.matchedIds);
  const matches = profiles
    .filter((p) => matchedSet.has(p.id))
    .map(sanitizeProfile);

  return NextResponse.json({ matches });
}
import { NextResponse } from 'next/server';
import { resetUserState } from '@/lib/db';

export async function POST() {
  resetUserState();
  return NextResponse.json({ success: true });
}
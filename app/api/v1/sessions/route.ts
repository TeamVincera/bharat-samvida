import { NextRequest, NextResponse } from 'next/server';
import { createSession, deleteSession, validateSessionToken } from '@/lib/sessions';

export async function POST(req: NextRequest) {
  const { sessionId, token } = createSession();

  const response = NextResponse.json({
    success: true,
    sessionId,
    createdAt: new Date().toISOString()
  });

  // Set secure cookie
  response.cookies.set('bs_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7200 // 2 hours hard limit
  });

  return response;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('bs_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = validateSessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false, message: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    sessionId: session.sessionId,
    createdAt: session.createdAt
  });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('bs_session')?.value;
  if (token) {
    deleteSession(token);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Session and temporary drafts deleted'
  });

  response.cookies.delete('bs_session');
  return response;
}

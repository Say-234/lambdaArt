import { NextResponse, NextRequest } from 'next/server';
import { auth } from './lib/firebase'; // Note: version admin pour le backend
import { getToken } from 'next-auth/jwt'; // or the correct path to your getToken function

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request }); // adjust arguments if needed
  
  if (request.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
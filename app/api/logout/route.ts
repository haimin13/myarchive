import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    
    return NextResponse.json({ message: '로그아웃 성공!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

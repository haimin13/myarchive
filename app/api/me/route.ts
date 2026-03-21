import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return NextResponse.json({
        user: {
          id: decoded.id,
          user_id: decoded.user_id,
          nickname: decoded.nickname,
          email: decoded.email || null, // 기존 토큰에 이메일이 없을 경우를 대비
        }
      });
    } catch (err) {
      // 토큰이 올바르지 않거나 만료된 경우
      return NextResponse.json({ user: null }, { status: 200 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러', error: error.message }, { status: 500 });
  }
}

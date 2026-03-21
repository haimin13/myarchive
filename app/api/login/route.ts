import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, password, rememberMe } = body;

    const sql = `SELECT * FROM users WHERE user_id = $1`;
    const results = await executeQuery(sql, [user_id]);

    const users = results as any[];
    if (users.length === 0) {
      return NextResponse.json({ message: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    const user = users[0];

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    // JWT 생성
    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, nickname: user.nickname, email: user.email },
      JWT_SECRET,
      { expiresIn: rememberMe ? '7d' : '1d' } // 토큰 자체의 유효기간도 고려
    );

    // 쿠키 설정
    const cookieStore = await cookies();
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    if (rememberMe) {
      cookieOptions.maxAge = 60 * 60 * 24 * 7; // 7일
    }
    // rememberMe가 false이면 maxAge를 지정하지 않음 -> 세션 쿠키 (브라우저 종료시 삭제)

    cookieStore.set('session', token, cookieOptions);

    // 로그인 성공
    return NextResponse.json({
      message: '로그인 성공!',
      user: {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(request: Request) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ message: '필수 정보가 부족합니다.' }, { status: 400 });
    }

    // 1. 유저 확인
    const sql = `SELECT * FROM users WHERE email = $1`;
    const results = await executeQuery(sql, [email]) as any[];

    if (results.length === 0) {
      return NextResponse.json({ message: '유효하지 않은 요청입니다.' }, { status: 400 });
    }

    const user = results[0];

    // 2. 토큰 검증
    // 시크릿은 생성 시와 동일하게 JWT_SECRET + user.password (기존 해시)
    const secret = JWT_SECRET + user.password;
    
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: '링크가 만료되었거나 올바르지 않습니다.' }, { status: 400 });
    }

    // 3. 새 비밀번호 해싱 및 업데이트
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = `UPDATE users SET password = $1 WHERE id = $2`;
    await executeQuery(updateSql, [newHashedPassword, user.id]);

    console.log(`Password reset success for user: ${email}`);

    return NextResponse.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

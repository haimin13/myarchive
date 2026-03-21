
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, password, nickname, email } = body;

    if (!user_id || !password || !nickname || !email) {
      return NextResponse.json(
        { message: '필수 정보가 부족합니다.' },
        { status: 400 }
      );
    }

    // 1. 중복 확인 (ID, Nickname, Email)
    const checkSql = `SELECT user_id, nickname, email FROM users WHERE user_id = $1 OR nickname = $2 OR email = $3`;
    const existingUsers = await executeQuery(checkSql, [user_id, nickname, email]) as any[];

    if (existingUsers.length > 0) {
      const isDuplicateId = existingUsers.some(u => u.user_id === user_id);
      const isDuplicateNickname = existingUsers.some(u => u.nickname === nickname);
      const isDuplicateEmail = existingUsers.some(u => u.email === email);
      
      if (isDuplicateId) return NextResponse.json({ message: '이미 사용 중인 아이디입니다.' }, { status: 400 });
      if (isDuplicateNickname) return NextResponse.json({ message: '이미 사용 중인 닉네임입니다.' }, { status: 400 });
      if (isDuplicateEmail) return NextResponse.json({ message: '이미 등록된 이메일입니다.' }, { status: 400 });
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 데이터 저장
    const sql = `INSERT INTO users (user_id, password, nickname, email) VALUES ($1, $2, $3, $4)`;
    await executeQuery(sql, [user_id, hashedPassword, nickname, email]);

    return NextResponse.json({ message: '회원가입 성공!' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
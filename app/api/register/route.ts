import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, password, nickname } = body;

    if (!user_id || !password || !nickname) {
      return NextResponse.json(
        { message: '필수 정보가 부족합니다.' },
        { status: 400 }
      );
    }

    const sql = `INSERT INTO users (user_id, password, nickname) VALUES (?,?,?)`;
    await executeQuery(sql, [user_id, password, nickname]);

    return NextResponse.json({ message: '회원가입 성공!' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, password } = body;

    const sql = `SELECT * FROM users WHERE user_id = ?`;
    const results = await executeQuery(sql, [user_id]);

    const users = results as any[];
    if (users.length === 0) {
      return NextResponse.json({ message: '없는 아이디입니다.' }, {status: 401});
    }

    const user = users[0];
    if (user.password !== password) {
      return NextResponse.json({message: '비밀번호가 틀렸습니다.'}, {status:401});
    }

    // 로그인 성공
    return NextResponse.json({
      message: '로그인 성공!',
      user: {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}
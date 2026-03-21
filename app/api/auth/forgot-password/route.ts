import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: '이메일을 입력해주세요.' }, { status: 400 });
    }

    // 1. 유저 확인
    const sql = `SELECT * FROM users WHERE email = $1`;
    const results = await executeQuery(sql, [email]) as any[];

    if (results.length === 0) {
      // 보안을 위해 유저가 없어도 성공 메시지를 보낼 수도 있지만, 
      // 현재는 편리함을 위해 에러를 보냅니다.
      return NextResponse.json({ message: '해당 이메일로 등록된 유저가 없습니다.' }, { status: 404 });
    }

    const user = results[0];

    // 2. 재설정용 토큰 생성
    // 보안 팁: 유저의 현재 비밀번호 해시를 시크릿에 포함하면, 비밀번호 변경 시 토큰이 자동 만료됨
    const secret = JWT_SECRET + user.password;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '15m' }
    );

    // 3. 재설정 링크 생성
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // 4. 이메일 발송 (현재는 로그로 대체)
    console.log('--- PASSWORD RESET LINK ---');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log('---------------------------');

    return NextResponse.json({ 
      success: true, 
      message: '비밀번호 재설정 링크가 생성되었습니다.',
      // 테스트 편의를 위해 링크를 응답에 포함 (실제 운영 시에는 이메일로만 발송)
      debugLink: resetLink 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // 모든 유저 가져오기
    const results = await executeQuery('SELECT id, user_id, password FROM users');
    const users = results as any[];
    
    let migrateCount = 0;
    
    for (const user of users) {
      // bcrypt 해시의 특징: 보통 $2a$, $2b$, $2y$ 등으로 시작함
      const isAlreadyHashed = user.password.startsWith('$2a$') || 
                              user.password.startsWith('$2b$') || 
                              user.password.startsWith('$2y$');
      
      if (!isAlreadyHashed) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await executeQuery(
          'UPDATE users SET password = $1 WHERE id = $2',
          [hashedPassword, user.id]
        );
        migrateCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${migrateCount} 명의 유저 비밀번호가 해시로 변환되었습니다.`,
      totalProcessed: users.length 
    });
  } catch (error) {
    console.error('Password migration error:', error);
    return NextResponse.json({ success: false, message: '마이그레이션 중 에러 발생' }, { status: 500 });
  }
}

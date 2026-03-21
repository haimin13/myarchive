import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const sql = 'SELECT * FROM users ORDER BY id ASC';
    const results = await executeQuery(sql);

    return NextResponse.json({ message: '성공!', data: results });
  } catch (error: any) {
    return NextResponse.json({ message: '서버 에러', error: error.message }, { status: 500 });
  }
}
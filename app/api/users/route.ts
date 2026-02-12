import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const sql = 'SELECT * FROM users';
    const results = await executeQuery(sql);

    return NextResponse.json({ message: '성공!', data: results });
  } catch (error) {
    return NextResponse.json({ error: '에러남 ㅠㅠ' }, { status: 500 });
  }
}
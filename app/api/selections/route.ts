import { NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/utility';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const query = searchParams.get('q');

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ message: '유저 ID가 필요합니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];
    let sql = '';
    let values: any[] = [];

    if (query) {
      sql = `
        SELECT
          s.id as selection_id,
          s.selected_date,
          m.*
        FROM ${config.selectedTable} s
        JOIN ${config.masterTable} m ON s.item_id = m.id
        WHERE s.user_id = $1
        AND (m.title ILIKE $2 OR m.creator ILIKE $3)
        ORDER By s.selected_date DESC
      `;
      const likeQuery = `%${query}%`;
      values = [userId, likeQuery, likeQuery];
    } else {
      sql = `
        SELECT
          s.id as selection_id,
          s.selected_date,
          m.*
        FROM ${config.selectedTable} s
        JOIN ${config.masterTable} m ON s.item_id = m.id
        WHERE s.user_id = $1
        ORDER BY s.selected_date DESC
      `;
      values = [userId];
    }

    const results = await executeQuery(sql, values);
    return NextResponse.json({ items: results });
  } catch (error) {
    console.error('GET Selections Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, user_id, item_id, selected_date = new Date() } = body;

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!user_id || !item_id) {
      return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];
    const formattedDate = getLocalDateString(selected_date);

    const insertRelationSql = `
      INSERT INTO ${config.selectedTable} (user_id, item_id, selected_date) 
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const res = await executeQuery(insertRelationSql, [user_id, item_id, formattedDate]) as any[];

    return NextResponse.json({ message: '저장 완료!', selection_id: res[0].id }, { status: 201 });
  } catch (error) {
    console.error('POST Selections Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { category, selection_id, selected_date } = body;

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!selection_id) {
      return NextResponse.json({ message: '선택 ID가 없습니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];

    if (selected_date) {
      const formattedDate = getLocalDateString(selected_date);
      const updateDateSql = `UPDATE ${config.selectedTable} SET selected_date = $1 WHERE id = $2`;
      await executeQuery(updateDateSql, [formattedDate, selection_id]);
    }

    // Future user-specific fields like `favorite`, `rate` can be handled here

    return NextResponse.json({ message: '수정 완료' });
  } catch (error) {
    console.error('PUT Selections Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ message: '삭제할 ID가 없습니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];
    const sql = `DELETE FROM ${config.selectedTable} WHERE id = $1`;
    await executeQuery(sql, [id]);

    return NextResponse.json({ message: '삭제됨' });
  } catch (error) {
    console.error('DELETE Selections Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

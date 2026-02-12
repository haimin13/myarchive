import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { pool } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';

export async function POST(
  request: Request,
  { params }: { params: Promise<{category: string }> }
) {
  try {
    const { category } = await params;
    const config = CATEGORY_CONFIG[category];
    if (!config) {
      return NextResponse.json({message: '지원하지 않는 카테고리입니다.'}, {status: 400});
    }

    const body = await request.json();
    const { item_id, title, img_dir, user_id, creator, selected_date = new Date(), ...others } = body;

    if (!item_id) {
      if (!title || !title.trim()) {
        return NextResponse.json({ message: '제목을 입력해주세요.' }, { status: 400 });
      }
      if (!creator || !creator.trim()) {
        return NextResponse.json({ message: '창작자를 입력해주세요.' }, { status: 400 });
      }
    }
    if (!user_id) {
      return NextResponse.json({ message: '로그인 정보가 없습니다.' }, { status: 401 });
    }
    
    const conn = await pool.getConnection()
    // 동적 SQL 만들기
    try {
      await conn.beginTransaction()

      let finalItemId = item_id;

      if (!finalItemId) {
        const keys = ['title', 'creator', 'img_dir', ...Object.keys(others)];
        const values = [title, creator, img_dir || '', ...Object.values(others)];
        const placeholders = values.map(() => '?').join(', ');

        const insertMasterSql = `INSERT INTO ${config.masterTable} (${keys.join(', ')}) VALUES (${placeholders})`;
        const [masterResult] = await conn.query(insertMasterSql, values);

        finalItemId = (masterResult as any).insertId;
      }
      
      const insertRelationSql = `
        INSERT INTO ${config.selectedTable} (user_id, item_id, selected_date) 
        VALUES (?, ?, ?)
      `;
      await conn.query(insertRelationSql, [user_id, finalItemId, selected_date]);
      await conn.commit();
   
      return NextResponse.json({message:'저장 완료!', id: finalItemId}, { status: 201 });

    } catch (dbError) {
      console.error('DB Error:', dbError);
      await conn.rollback();

      return NextResponse.json({ message: '데이터베이스 저장 중 오류가 발생했습니다.' }, { status: 500 });
    } finally {
      conn.release();
    }

  } catch (serverError) {
    console.error('API Error:', serverError);
    return NextResponse.json({message: '서버 에러가 발생했습니다.'}, {status: 500});
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise< {category: string }> }
) {
  try {
    const { category } = await params;
    const config = CATEGORY_CONFIG[category];

    if (!config) {
      return NextResponse.json({message: '지원하지 않는 카테고리입니다.'}, {status: 400});
    }
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');
    
    let sql = '';
    let values: any[] = [];


    if (!userId) {
      return NextResponse.json({message: '유저 ID가 필요합니다.'}, {status:400});
    }
    if (query) {
      sql = `
        SELECT
          s.id as selection_id,
          s.selected_date,
          m.title,
          m.creator,
          m.img_dir
        FROM ${config.selectedTable} s
        JOIN ${config.masterTable} m ON s.item_id = m.id
        WHERE s.user_id = ?
        AND (m.title LIKE ? OR m.creator LIKE ?)
        ORDER By s.selected_date DESC
      `;
      const likeQuery = `%${query}%`;
      values = [userId, likeQuery, likeQuery];
    }
    else {
      sql = `
        SELECT
          s.id as selection_id,
          s.selected_date,
          m.title,
          m.creator,
          m.img_dir
        FROM ${config.selectedTable} s
        JOIN ${config.masterTable} m ON s.item_id = m.id
        WHERE s.user_id = ?
        ORDER BY s.selected_date DESC
      `;
      values = [userId]
    }
    
    const results = await executeQuery(sql, values);
    return NextResponse.json({items:results});
  } catch (error) {
    console.error(error);
    return NextResponse.json({message:'서버 에러'}, {status:500});
  }
}
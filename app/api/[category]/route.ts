import { NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';

export async function POST(
  request: Request,
  { params }: { params: Promise<{category: string }> }
) {

  const client = await pool.connect();
  try {
    const { category } = await params;
    const config = CATEGORY_CONFIG[category];
    if (!config) {
      return NextResponse.json({message: '지원하지 않는 카테고리입니다.'}, {status: 400});
    }

    const body = await request.json();
    let { item_id, title, img_dir, user_id, creator, selected_date = new Date(), ...others } = body;

    // selected_date를 KST 문자열로 변환
    selected_date = getLocalDateString(selected_date);

    if (!item_id) {
      if (!title || !title.trim()) return NextResponse.json({ message: '제목을 입력해주세요.' }, { status: 400 });
      if (!creator || !creator.trim()) return NextResponse.json({ message: '창작자를 입력해주세요.' }, { status: 400 });
    }
    if (!user_id) return NextResponse.json({ message: '로그인 정보가 없습니다.' }, { status: 401 });
    
    
    let final
    // 동적 SQL 만들기
    try {
      await client.query('BEGIN');

      let finalItemId = item_id;

      if (!finalItemId) {
        const keys = ['title', 'creator', 'img_dir', ...Object.keys(others)];
        const values = [title, creator, img_dir || '', ...Object.values(others)];
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const insertMasterSql = `INSERT INTO ${config.masterTable} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
        const res = await client.query(insertMasterSql, values);

        finalItemId = res.rows[0].id;
      }
      
      const insertRelationSql = `
        INSERT INTO ${config.selectedTable} (user_id, item_id, selected_date) 
        VALUES ($1, $2, $3)
      `;
      await client.query(insertRelationSql, [user_id, finalItemId, selected_date]);
      await client.query('COMMIT');
   
      return NextResponse.json({message:'저장 완료!', id: finalItemId}, { status: 201 });

    } catch (dbError) {
      console.error('DB Error:', dbError);
      await client.query('ROLLBACK');

      return NextResponse.json({ message: '데이터베이스 저장 중 오류가 발생했습니다.' }, { status: 500 });
    } finally {
      client.release();
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
        WHERE s.user_id = $1
        AND (m.title ILIKE $2 OR m.creator ILIKE $3)
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
        WHERE s.user_id = $1
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
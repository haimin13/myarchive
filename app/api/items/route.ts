import { NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';

// GET: 마스터 테이블 검색 (DB 검색)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '지원하지 않는 카테고리입니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];

    if (query) {
      const sql = `
        SELECT *
        FROM ${config.masterTable}
        WHERE title ILIKE $1 OR creator ILIKE $2
        ORDER BY title ASC 
        LIMIT 50
      `;
      const likeQuery = `%${query}%`;
      const values = [likeQuery, likeQuery];

      const results = await executeQuery(sql, values);
      return NextResponse.json({ items: results });
    } else {
      return NextResponse.json({ items: [] });
    }
  } catch (error) {
    console.error('검색 에러:', error);
    return NextResponse.json({ message: '서버 내부 에러' }, { status: 500 });
  }
}

// POST: 마스터 데이터 생성 (새로운 마스터 레코드 추가)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, creator, img_dir, user_id, selected_date, ...others } = body;

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!title || !title.trim()) return NextResponse.json({ message: '제목을 입력해주세요.' }, { status: 400 });
    if (!creator || !creator.trim()) return NextResponse.json({ message: '창작자를 입력해주세요.' }, { status: 400 });

    const config = CATEGORY_CONFIG[category];

    // 중복 체크: 이미 동일한(title, creator) 레코드가 있는지 확인
    const checkSql = `SELECT id FROM ${config.masterTable} WHERE title = $1 AND creator = $2 LIMIT 1`;
    const rows = await executeQuery(checkSql, [title, creator]) as any[];

    if (rows.length > 0) {
      // 이미 존재한다면 기존 ID 반환
      return NextResponse.json({ message: '이미 존재하는 항목입니다.', id: rows[0].id }, { status: 200 });
    }

    // 없다면 새로 삽입
    const keys = ['title', 'creator', 'img_dir', ...Object.keys(others)];
    const values = [title, creator, img_dir || '', ...Object.values(others)];
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const insertMasterSql = `INSERT INTO ${config.masterTable} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    const res = await executeQuery(insertMasterSql, values) as any[];

    return NextResponse.json({ message: '마스터 항목 생성 완료', id: res[0].id }, { status: 201 });
  } catch (error) {
    console.error('POST Items Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}


// PUT: 마스터 데이터 수정 (정보 업데이트 및 중복 방지 연결)
export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { category, item_id, selection_id, user_id, selected_date, ...masterData } = body;

    if (!category || !CATEGORY_CONFIG[category]) {
      return NextResponse.json({ message: '유효하지 않은 카테고리입니다.' }, { status: 400 });
    }
    if (!item_id) {
      return NextResponse.json({ message: '아이템 ID가 필요합니다.' }, { status: 400 });
    }

    const config = CATEGORY_CONFIG[category];

    if (Object.keys(masterData).length > 0) {
      await client.query('BEGIN');

      // 1. 수정하려는 항목이 현재 어떤 title/creator인지 파악 (넘어온 값이 없으면 기존 값 유지)
      const currentMasterSql = `SELECT * FROM ${config.masterTable} WHERE id = $1 LIMIT 1`;
      const currentRes = await client.query(currentMasterSql, [item_id]);
      const currentMaster = currentRes.rows[0];

      if (!currentMaster) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: '존재하지 않는 항목입니다.' }, { status: 404 });
      }

      const targetTitle = masterData.title || currentMaster.title;
      const targetCreator = masterData.creator || currentMaster.creator;

      // 2. 다른 ID 중에 똑같은 title, creator를 가진 레코드가 있는지 확인
      const checkSql = `SELECT id FROM ${config.masterTable} WHERE title = $1 AND creator = $2 AND id != $3 LIMIT 1`;
      const existingRes = await client.query(checkSql, [targetTitle, targetCreator, item_id]);

      if (existingRes.rows.length > 0 && selection_id) {
        // 이미 다른 레코드로 존재하는 항목으로 이름을 바꾸려고 함 (중복 발생!)
        // -> 현재 마스터 레코드를 수정하는 대신, 사용자의 연결(selection)을 기존에 있던 레코드로 바꿔줍니다.
        const existingItemId = existingRes.rows[0].id;
        const reLinkSql = `UPDATE ${config.selectedTable} SET item_id = $1 WHERE id = $2`;
        await client.query(reLinkSql, [existingItemId, selection_id]);
        await client.query('COMMIT');
        return NextResponse.json({ message: '기존 항목으로 자동 병합(연결)되었습니다.' });
      }

       // 3. 중복되지 않는다면 정상적으로 마스터 데이터 업데이트
       const keys = Object.keys(masterData);
       const values = Object.values(masterData);
       const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
       const idIndex = keys.length + 1;

       const updateMasterSql = `UPDATE ${config.masterTable} SET ${setClause} WHERE id = $${idIndex}`;
       await client.query(updateMasterSql, [...values, item_id]);
       
       await client.query('COMMIT');
       return NextResponse.json({ message: '아이템 수정 완료' });
    }
    
    return NextResponse.json({ message: '수정할 데이터가 없습니다.' }, { status: 400 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PUT Items Error:', error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  } finally {
    client.release();
  }
}

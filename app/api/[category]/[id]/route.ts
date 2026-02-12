import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';

export async function GET(
  request: Request,
  {params}: {params: Promise<{category:string; id:string}>}
) {
  try {
    const {category, id} = await params;
    const config = CATEGORY_CONFIG[category];

    if(!config) {
      return NextResponse.json({message:"카테고리 없음"}, {status: 400});
    }
    const sql = `
      SELECT 
        s.id as selection_id, 
        s.selected_date,
        m.*
      FROM ${config.selectedTable} s
      JOIN ${config.masterTable} m ON s.item_id = m.id
      WHERE s.id = ?
      LIMIT 1
      `;

    const results = await executeQuery(sql, [id]);
    const items = results as any[];

    if (items.length === 0) {
      return NextResponse.json({ message: '데이터가 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ item: items[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  {params}: {params: Promise<{category: string, id: string}>}
) {
  const {category, id} = await params;
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return NextResponse.json({message: "카테고리 없음"}, {status: 400});
  }
  const sql = `DELETE FROM ${config.selectedTable} WHERE id = ?`;
  await executeQuery(sql, [id]);

  return NextResponse.json({ message: '삭제됨' });
}

export async function PUT(
  request: Request,
    { params }: {params: Promise<{ category: string, id: string}>}
) {
  const { category, id } = await params;
  const config = CATEGORY_CONFIG[category];
  const body = await request.json();
  const { 
    selected_date, 
    user_id, 
    id: bodyId,
    selection_id,
    ...masterData
  } = body;

  try {
    // 1️⃣ 날짜 수정 (상세 페이지에서 요청)
    if (selected_date) {
      const formattedDate = selected_date.toString().split('T')[0];
      const updateDateSql = `UPDATE ${config.selectedTable} SET selected_date = ? WHERE id = ?`;
      await executeQuery(updateDateSql, [formattedDate, id]);
    }

    // 2️⃣ 내용 수정 (수정 페이지에서 요청)
    if (Object.keys(masterData).length > 0) {
      const findSql = `SELECT item_id FROM ${config.selectedTable} WHERE id = ?`;
      const rows = await executeQuery(findSql, [id]) as any[];

      if (rows.length > 0) {
        const masterId = rows[0].item_id;
        const keys = Object.keys(masterData);
        const values = Object.values(masterData);
        
        const setClause = keys.map(key => `${key} = ?`).join(', ');

        const updateMasterSql = `UPDATE ${config.masterTable} SET ${setClause} WHERE id = ?`;
        await executeQuery(updateMasterSql, [...values, masterId]);
      }
    }
    return NextResponse.json({ message: '수정 완료' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '서버 에러' }, { status: 500 });
  }
}

  // const {title, creator, img_dir, user_id, ...others } = body;

  // if (!title || !title.trim()) {
  //     return NextResponse.json({ message: '제목을 입력해주세요.' }, { status: 400 });
  //   }
  // if (!creator || !creator.trim()) {
  //   return NextResponse.json({ message: '창작자를 입력해주세요.' }, { status: 400 });
  // }

  // const findSql = `SELECT item_id FROM ${config.selectedTable} WHERE id = ?`;
  // const findResult = await executeQuery(findSql, [id]);
  // const rows = findResult as any[];

  // if (rows.length === 0) {
  //   return NextResponse.json({ message: '데이터 없음' }, { status: 404 });
  // }

  // const masterId = rows[0].item_id;

  // const keys = ['title', 'creator', 'img_dir', ...Object.keys(others)];
  // const values = [title, creator, img_dir || '', ...Object.values(others)];

  // const setClause = keys.map(key => `${key} = ?`).join(', ');

  // const updateSql = `UPDATE ${config.masterTable} SET ${setClause} WHERE id = ?`;
  // await executeQuery(updateSql, [...values, masterId]);
  // return NextResponse.json({ message: '수정 완료' });
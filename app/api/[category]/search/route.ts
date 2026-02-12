import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  
  // 1️⃣ [수정] 해당 카테고리의 설정만 가져오기
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return NextResponse.json({ message: '지원하지 않는 카테고리입니다.' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (query) {
    try {
      // 2️⃣ [개선] release_date 추가 및 LIMIT 설정
      const sql = `
        SELECT 
          *
        FROM ${config.masterTable}
        WHERE title LIKE ? OR creator LIKE ?
        ORDER BY title ASC 
        LIMIT 50
      `;
      // creator DESC보다는 title ASC(가나다순)가 검색엔 더 자연스러울 수 있습니다.
      
      const likeQuery = `%${query}%`;
      const values = [likeQuery, likeQuery];

      const results = await executeQuery(sql, values);
      return NextResponse.json({ items: results });

    } catch (error) {
      // 3️⃣ [개선] 에러 처리 추가
      console.error('검색 에러:', error);
      return NextResponse.json({ message: '서버 내부 에러' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ items: [] });
  }
}
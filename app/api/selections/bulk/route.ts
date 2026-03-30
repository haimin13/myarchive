import { NextResponse } from 'next/server';
import { CATEGORY_CONFIG } from '@/app/constants';
import { supabase } from '@/lib/supabase';

// POST: 다수의 항목을 유저의 컬렉션에 추가 (Bulk)
export async function POST(request: Request) {
  const { category, items, userId } = await request.json();
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return NextResponse.json({ message: '지원하지 않는 카테고리입니다.' }, { status: 400 });
  }
  
  // 1. 데이터 분류: DB MATCHED vs NEW
  const dbMatchedItems = items.filter((item: any) => item.matchStatus === 'db');
  const newItems = items.filter((item: any) => item.matchStatus === 'api' || item.matchStatus === 'manual');

  let newlyInsertedMasters: any[] = [];
  // 2. 새로운 놈들만 master table에 삽입
  if (newItems.length > 0) {
    const masterPayload = newItems.map((item: any) => {
      const baseData: any = {
        title: item.matchedItem.title,
        img_dir: item.matchedItem.img_dir
      };

      config.fields.forEach((field: any) => {
        if (item.matchedItem[field.name] !== undefined) {
          baseData[field.name] = item.matchedItem[field.name];
        }
      });

      return baseData;
    });

    const { data: insertedData, error: masterError } = await supabase
      .from(config.masterTable)
      .upsert(masterPayload, { onConflict: 'title, creator'}) // Need to be careful here if 'title, creator' is indeed the unique constraint in Supabase for all categories
      .select('id, title, creator');

    if (masterError) {
      console.error("Supabase 마스터 테이블 에러:", masterError);
      return NextResponse.json({ error: masterError.message }, { status: 500 });
    }
    newlyInsertedMasters = insertedData || [];
  }

  // 3. selected table에 넣을 놈들 정리
  const finalSelectedPayload: any[] = [];

  dbMatchedItems.forEach((item: any) => {
    finalSelectedPayload.push({
      user_id: userId,
      item_id: item.itemId,
      selected_date: item.selectedDate
    });
  });

  newItems.forEach((item: any) => {
    const matched = newlyInsertedMasters.find(
      (m) => m.title === item.matchedItem.title && m.creator === item.matchedItem.creator
    );
    if (matched) {
      finalSelectedPayload.push({
        user_id: userId,
        item_id: matched.id,
        selected_date: item.selectedDate
      });
    }
  });

  // 4. selected 테이블에 최종 일괄 삽입
  if (finalSelectedPayload.length > 0) {
    const { error: selectedError } = await supabase
      .from(config.selectedTable)
      .insert(finalSelectedPayload);
    
    if (selectedError) {
      console.error("Supabase 선택 테이블 에러:", selectedError);

      // --- 🚨 롤백(수동 삭제) 로직 시작 ---
      if (newlyInsertedMasters.length > 0) {
        const idsToDelete = newlyInsertedMasters.map(m => m.id);
        
        const { error: rollbackError } = await supabase
          .from(config.masterTable)
          .delete()
          .in('id', idsToDelete);

        if (rollbackError) {
          console.error("마스터 테이블 롤백 실패 (고아 데이터 확인 필요):", rollbackError);
        } else {
          console.log("마스터 테이블 데이터 롤백(삭제) 완료");
        }
      }
      return NextResponse.json({ error: selectedError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, count: finalSelectedPayload.length });
};

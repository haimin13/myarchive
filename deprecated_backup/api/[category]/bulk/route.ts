// /app/api/[category]/bulk/route.ts

import { NextResponse } from 'next/server';
import { CATEGORY_CONFIG } from '@/app/constants';
import { supabase } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  
  const { items, userId } = await request.json();
  
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
      .from(`${category}`)
      .upsert(masterPayload, { onConflict: 'title, creator'})
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
      .from(`selected_${category}`)
      .insert(finalSelectedPayload);
    
    if (selectedError) {
      console.error("Supabase 선택 테이블 에러:", selectedError);

      // --- 🚨 롤백(수동 삭제) 로직 시작 ---
      if (newlyInsertedMasters.length > 0) {
        const idsToDelete = newlyInsertedMasters.map(m => m.id);
        
        const { error: rollbackError } = await supabase
          .from(`${category}`)
          .delete()
          .in('id', idsToDelete);

        if (rollbackError) {
          // 롤백마저 실패한 최악의 경우 (고아 데이터 발생)
          console.error("마스터 테이블 롤백 실패 (고아 데이터 확인 필요):", rollbackError);
        } else {
          console.log("마스터 테이블 데이터 롤백(삭제) 완료");
        }
      }
      // --- 롤백 로직 끝 ---

      return NextResponse.json({ error: selectedError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, count: finalSelectedPayload.length });
};
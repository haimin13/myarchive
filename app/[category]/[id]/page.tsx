// app/[category]/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';
import ItemDetail from '@/components/item/ItemDetail';

export default function DetailPage() {
  const params = useParams();
  const category = params.category as string;
  const id = params.id as string;
  const config = CATEGORY_CONFIG[category];

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const router = useRouter();

  const handleDateUpdate = async () => {
    if (!tempDate) return;
    const res = await fetch(`/api/${category}/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_date: tempDate }),
    });

    if (res.ok) {
      setItem((prev: any) => ({ ...prev, selected_date: tempDate }));
      setIsEditingDate(false);
      alert('날짜가 변경되었습니다.');
    } else {
      alert('날짜 수정 실패');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/${category}/${id}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        router.push(`/${category}`);
    } else {
        alert('삭제 실패');
    }
  };

  useEffect(() => {
    if (!config) return;
    fetch(`/api/${category}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('데이터 없음');
        return res.json();
      })
      .then((data) => {
        setItem(data.item);
        setLoading(false);
      })
      .catch(() => {
        alert('데이터를 찾을 수 없습니다.');
        router.back();
      })
  }, [category, id, config, router]);

  if (!config || loading) return <div className="p-10 text-center">로딩 중...</div>
  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <ItemDetail 
        item={item}
        config={config}
        onBack={() => router.push(`/${category}`)}
        onEdit={() => router.push(`/${category}/${id}/edit`)}
        onDelete={handleDelete}
        
        isEditingDate={isEditingDate}
        tempDate={tempDate}
        onTempDateChange={setTempDate}
        onDateEditStart={() => {
          setTempDate(getLocalDateString(item.selected_date));
          setIsEditingDate(true);
        }}
        onDateEditCancel={() => setIsEditingDate(false)}
        onDateSubmit={handleDateUpdate}
      />
    </div>
    );
}
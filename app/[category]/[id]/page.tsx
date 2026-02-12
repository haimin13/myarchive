'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';

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
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* ✨ 1. 상단 툴바 (버튼 영역) ✨ */}
        {/* 이미지를 가리지 않도록 밖으로 뺐습니다. */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <button 
            onClick={() => router.push(`/${category}`)}
            className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm font-bold"
          >
            ← 목록으로
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/${category}/${id}/edit`)}
              className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition text-sm font-bold"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition text-sm font-bold"
            >
              삭제
            </button>
          </div>
        </div>

        {/* ✨ 2. 이미지 영역 (버튼 없음, 크기 키움) ✨ */}
        {/* w-72 -> w-80 (약 320px)으로 키움 */}
        <div className="w-80 aspect-square mx-auto mt-8 bg-gray-200 rounded-xl overflow-hidden shadow-md">
          {item.img_dir ? (
          <img 
            src={item.img_dir} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          ) : (
          <div className="flex items-center justify-center h-full text-gray-400">NO IMAGE</div>
          )}
        </div>
  
        {/* 3. 내용 영역 */}
        <div className="p-8 pt-6"> {/* pt-6으로 이미지와 간격 조정 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{item.title}</h1>
          
          {/* 등록일 섹션 */}
          <div className="text-sm text-gray-500 mb-8 border-b pb-4 flex items-center justify-center h-8">
            <span className="mr-2">등록일:</span>
  
            {isEditingDate ? (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="border border-gray-300 p-1 rounded text-sm bg-white"
                />
                <button 
                  onClick={handleDateUpdate} 
                  className="text-blue-600 font-bold hover:underline"
                >
                  저장
                </button>
                <button 
                  onClick={() => setIsEditingDate(false)} 
                  className="text-gray-400 hover:text-gray-600 hover:underline"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <span>{new Date(item.selected_date).toLocaleDateString()}</span>
                <button 
                  onClick={() => {
                    setTempDate(getLocalDateString(item.selected_date));
                    setIsEditingDate(true);
                  }}
                  className="ml-2 text-gray-400 hover:text-blue-500 transition"
                  title="날짜 수정"
                >
                  ✎
                </button>
              </>
            )}
          </div>
  
          {/* 4. 동적 필드 표시 */}
          <div className="space-y-4">
          {config.fields.map((field: any) => (
            <div key={field.name} className="flex border-b border-gray-100 pb-2">
            <span className="w-32 font-bold text-gray-600 flex-shrink-0">
              {field.label}
            </span>
            <span className="text-gray-800">
              {field.name === 'release_date' && item[field.name]
                ? getLocalDateString(item[field.name])
                : (item[field.name] || '-')}
            </span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
    );
}
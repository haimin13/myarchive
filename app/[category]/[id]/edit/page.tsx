// app/[category]/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';
import ItemForm from '@/components/item/ItemForm';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const id = params.id as string;
  const config = CATEGORY_CONFIG[category];

  const [formData, setFormData] = useState<any>({
    title: '',
    img_dir:'',
    creator:'',
  });
  const [loading, setLoading] = useState(true);

  const allFields = config ? [
    { name: 'title', label: '제목', required: true },
    ...config.fields,
    { name: 'img_dir', label: '이미지 주소 (URL)', placeholder: 'https://...' }
  ] : [];

  useEffect(() => {
    if (!config) return;

    fetch(`/api/${category}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.item) {
          // DB 데이터를 폼에 넣을 때 날짜 포맷팅 수행
          const others = { ...data.item };
          
          // release_date가 있으면 YYYY-MM-DD로 변환해서 인풋창에 보여줌
          if (others.release_date) {
            others.release_date = getLocalDateString(others.release_date)
          }

          setFormData({
            title: data.item.title,
            img_dir: data.item.img_dir,
            creator: data.item.creator,
            ...others // 변환된 날짜 포함된 객체
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alert('데이터를 불러오지 못했습니다.');
        router.back();
      });
  }, [category, id, config, router]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/${category}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert('수정 완료!');
      router.push(`/${category}/${id}`); // 상세 페이지로 복귀
    } else {
      alert('수정 실패');
    }
  };

  if (!config || loading) return <div>로딩 중...</div>;
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <ItemForm 
        config={config}
        formData={formData}
        allFields={allFields}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => router.back()} // 부모가 취소 동작을 결정
        submitText="수정 완료"
      />
    </div>
  );
}
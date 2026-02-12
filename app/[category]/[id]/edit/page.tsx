'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';
import InputField from '@/components/InputField';

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
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6 text-gray-800">
          {config.koreanName} 수정하기 ✏️
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ✨ [추가됨] 이미지 미리보기 (AddPage와 동일한 위치) */}
          <div>
            {formData.img_dir && (
              <div className="mb-4 text-center">
                <img 
                  src={formData.img_dir} 
                  alt="미리보기" 
                  className="h-32 object-contain mx-auto rounded border"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
          
          {/* ✨ InputField 컴포넌트로 반복문 처리! 코드가 정말 깔끔해졌죠? */}
          {allFields.map((field: any) => (
            <InputField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              // 수정 페이지에서는 기본적으로 다 수정 가능하게 둡니다.
              // 만약 특정 필드(예: creator)를 못 고치게 하려면 조건을 넣으세요.
              isReadOnly={false} 
            />
          ))}

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
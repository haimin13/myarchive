// /app/[category]/add/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString, createInitialFormData } from '@/lib/utility';
import InputField from '@/components/auth/InputField';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

export default function AddPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [formData, setFormData] = useState<any>(() => config ? createInitialFormData(config.fields) : {});
  const creatorLabel = config?.fields?.find((f: any) => f.name === 'creator')?.label || '항목';

  const userId = user?.id;

  // 검색 관련 상태
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchMode, setSearchMode] = useState<'internal' | 'external'>('external');

  // 화면전환 상태
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState<number | null>(null);




  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const endpoint = searchMode === 'internal'
        ? `/api/${category}/search?q=${keyword}`
        : `/api/external/${category}?q=${keyword}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || '검색 중 오류가 발생했습니다.');
        setSearchResults([]);
        return;
      }
      setSearchResults(data.items || []);
      console.log(data.items);


    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (mode: 'internal' | 'external') => {
    setSearchMode(mode);
    setSearchResults([]);
  }

  const handleSelect = (item: any) => {
    // 1️⃣ 기본 필드 먼저 채우기
    const newFormData: any = {
      ...formData,
      title: item.title,
      creator: item.creator,
      img_dir: item.img_dir || '',
    };

    // 2️⃣ ✨ 설정 파일(config.fields)을 보고 나머지 동적 필드도 채우기
    config.fields.forEach((field: any) => {
      const dbValue = item[field.name];

      if (dbValue) {
        if (field.name === 'release_date') {
          newFormData[field.name] = getLocalDateString(dbValue);
        }
        // (B) 일반 필드인 경우: 값 그대로 넣기 (genre, platform 등)
        else {
          newFormData[field.name] = dbValue;
        }
      }
    });

    setFormData(newFormData);
    setItemId(item.id || null); // ID 저장
    setShowForm(true);  // 폼 화면으로 이동
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDirectEntry = () => {
    setFormData(createInitialFormData(config.fields));
    setItemId(null); // ID 초기화 (신규 등록임)
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    e.preventDefault();
    if (!userId) return;

    try {
      const res = await fetch(`/api/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
          item_id: itemId
        }),
      });

      if (res.ok) {
        alert(`${config.koreanName} 저장 완료!`);
        router.push(`/${category}`);
      } else {
        alert('저장 실패;')
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!config) {
      alert('존재하지 않는 카테고리입니다.');
      router.push('/');
      return;
    }
    if (!isAuthLoading && !user) {
      alert('로그인이 필요합니다!');
      router.push('/login');
    }
  }, [user, isAuthLoading, config, router]);

  if (!config) return <div className="p-10 text-center">로딩 중...</div>

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">

        {!showForm ? (
          /* 검색 화면 (SCENE 1) */
          <div>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/${category}`)}
                  className="mr-3 text-gray-500 hover:text-black"
                  aria-label="뒤로 가기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">
                  🔎 {config.koreanName} 검색
                </h1>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/${category}/add/bulk`)}
                className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-none shadow-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                일괄 등록
              </Button>
            </div>

            <div className="flex border-b mb-6">
              <Button
                variant="ghost"
                onClick={() => handleTabChange('internal')}
                className={`flex-1 pb-3 font-bold transition rounded-none border-b-2 shadow-none ${searchMode === 'internal'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
              >
                DB 검색
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleTabChange('external')}
                className={`flex-1 pb-3 font-bold transition rounded-none border-b-2 shadow-none ${searchMode === 'external'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
              >
                온라인 검색
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder={`제목 또는 ${creatorLabel} 검색`}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                autoFocus
              />
              <Button
                type="submit"
                isLoading={loading}
                className="px-4"
              >
                검색
              </Button>
            </form>

            <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
              {loading && <div className="text-center text-gray-500">검색 중...</div>}

              {!loading && searchResults.length > 0 && searchResults.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  onClick={() => handleSelect(item)}
                  className="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition gap-3"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                    {item.img_dir ? (
                      <img src={item.img_dir} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.creator}</div>
                  </div>
                </div>
              ))}

              {!loading && keyword && searchResults.length === 0 && (
                <div className="text-center text-gray-500 py-4">검색 결과가 없습니다.</div>
              )}
            </div>

            <div className="border-t pt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">원하는 결과가 없나요?</p>
              <Button
                variant="ghost"
                onClick={handleDirectEntry}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                + 직접 입력해서 추가하기
              </Button>
            </div>
          </div>
        ) : (

          /* 입력 폼 (SCENE 2) */
          <div>
            <div className="flex items-center mb-6 border-b pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                className="mr-3 text-gray-500 hover:text-black"
                aria-label="뒤로 가기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                {config.koreanName} 정보 입력 📝
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {config.fields.map((field: any) => (
                <InputField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleChange}
                  isReadOnly={!!itemId && field.name !== 'selected_date'}
                />
              ))}


              {/* 저장 버튼 */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full mt-4"
              >
                저장하기
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
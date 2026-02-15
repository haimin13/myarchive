'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';
import InputField from '@/components/InputField';

export default function AddPage() {
  const router = useRouter();
  const params = useParams();

  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [formData, setFormData] = useState<any>(() => ({
    title: '',
    img_dir: '',
    selected_date: getLocalDateString(new Date()),
    creator: ''
  }));
  const [userId, setUserId] = useState<number | null>(null);

  // 검색 관련 상태
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchMode, setSearchMode] = useState<'internal' | 'external'>('external');

  // 화면전환 상태
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState<number | null>(null);


  const allFields = [
    { name: 'title', label: '제목', required: true, placeholder: `${config.koreanName} 제목을 입력하세요` },
    ...config.fields, // DB 설정에서 가져온 필드들
    { name: 'img_dir', label: '이미지 주소 (URL)', placeholder: 'https://...' }
  ];

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
    
          
    } catch(err)  {
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
    setFormData({
      title: '',
      img_dir: '',
      creator: '',
      selected_date: getLocalDateString(new Date())
    });
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
        headers: {'Content-Type': 'application/json'},
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
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      alert('로그인이 필요합니다!');
      router.push('/login');
      return;
    }
    setUserId(JSON.parse(storedUser).id);
  }, []);

  if (!config) return <div className="p-10 text-center">로딩 중...</div>

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        
        {!showForm ? (
          /* 검색 화면 (SCENE 1) */
          <div>
            <div className="flex items-center mb-6 border-b pb-4">
               <button 
                 onClick={() => router.push(`/${category}`)} 
                 className="mr-3 text-gray-500 hover:text-black"
                 aria-label="뒤로 가기"
               >
                 ←
               </button>
               <h1 className="text-2xl font-bold text-gray-800">
                 🔎 {config.koreanName} 검색
               </h1>
            </div>

            {/* 검색 모드 탭 (Internal vs External) */}
            <div className="flex border-b mb-6">
              <button
                onClick={() => handleTabChange('internal')}
                className={`flex-1 pb-3 font-bold transition ${
                  searchMode === 'internal' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                DB 검색
              </button>
              <button
                onClick={() => handleTabChange('external')}
                className={`flex-1 pb-3 font-bold transition ${
                  searchMode === 'external' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                온라인 검색
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder={`제목 또는 ${config.fields[0].label} 검색`}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700"
              >
                검색
              </button>
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
              <button 
                onClick={handleDirectEntry}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
              >
                + 직접 입력해서 추가하기
              </button>
            </div>
          </div>
        ) : (
          
          /* 입력 폼 (SCENE 2) */
          <div>
            <div className="flex items-center mb-6 border-b pb-4">
               <button onClick={() => setShowForm(false)} className="mr-3 text-gray-500 hover:text-black">
                 ←
               </button>
               <h1 className="text-2xl font-bold text-gray-800">
                 {config.koreanName} 정보 입력 📝
               </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                {formData.img_dir && (
                  <div className="mt-2 text-center">
                    <img 
                      src={formData.img_dir} 
                      alt="미리보기" 
                      className="h-32 object-contain mx-auto rounded border"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
              {allFields.map((field) => (
               <InputField
                 key={field.name}
                 field={field}
                 value={formData[field.name]}
                 onChange={handleChange}
                 // itemId가 있으면(검색선택) 수정 불가. 단, isReadOnly 예외 조건이 필요하면 여기서 추가
                 isReadOnly={!!itemId} 
               />
             ))}
              
              {/* [공통 필드 3] 날짜 선택 (이건 항상 내 기록이므로 수정 가능!) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  등록 날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="selected_date"
                  value={formData.selected_date}
                  onChange={(e) => handleChange('selected_date', e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 저장 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 mt-4 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? '저장 중...' : '저장하기'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
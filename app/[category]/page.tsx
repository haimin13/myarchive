'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';
import Link from 'next/link';

export default function ListPage() {
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // ✨ 1. 뷰 모드 상태 추가 ('list' 또는 'grid')
  // 기본값은 'list'로 하되, 원하시면 'grid'로 바꿔도 됩니다.
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!storedUser) {
      alert('로그인이 필요합니다!');
      router.push('/login');
    } else {
      setUserId(JSON.parse(storedUser).id);
    }
  }, [router]);

  const fetchData = (currentUserId: string, searchQuery: string = '') => {
    setLoading(true);
    let url = `/api/${category}?userId=${currentUserId}`;

    if (searchQuery) {
      url += `&q=${searchQuery}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      fetchData(userId, keyword);
    }
  };

  useEffect(() => {
    if (config && userId) {
      fetchData(userId);
    }
  }, [category, config, userId]);
  
  if (!config) return <div>잘못된 접근</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* 하단 여백 추가 (FAB 버튼 가림 방지) */}
       
       {/* 상단 헤더 영역 */}
       <div className="bg-white p-4 shadow-sm sticky top-14 z-10"> {/* 네비게이션바 높이(14)만큼 띄움 */}
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {config.koreanName} 보관함 🗂️
            </h1>
            
            {/* 추가 버튼 (우측 상단) */}
            <Link 
              href={`/${category}/add`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm"
            >
              + 추가
            </Link>
         </div>

         {/* 검색창 + 뷰 토글 버튼 행 */}
         <div className="flex gap-2">
            {/* 검색창 */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="검색어 입력..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition"
              >
                🔍
              </button>
            </form>

            {/* ✨ 2. 뷰 모드 토글 버튼들 */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                title="리스트 보기"
              >
                {/* 리스트 아이콘 (가로줄 3개) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                title="그리드 보기"
              >
                {/* 그리드 아이콘 (네모 4개) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
            </div>
         </div>
       </div>

       {/* 컨텐츠 영역 (로딩중, 없음, 리스트/그리드) */}
       <div className="p-4">
         {loading ? (
           <div className="text-center py-10 text-gray-500">로딩 중...</div>
         ) : items.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             아직 수집한 아이템이 없습니다.<br/>
             우측 상단 버튼을 눌러 추가해보세요!
           </div>
         ) : (
           <>
             {/* ✨ 3. 조건부 렌더링: 리스트 모드 */}
             {viewMode === 'list' && (
               <div className="space-y-3">
                 {items.map((item) => (
                   <Link 
                     key={item.selection_id} 
                     href={`/${category}/${item.selection_id}`}
                     className="flex items-center bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                   >
                     {/* 썸네일 (작은 정사각형) */}
                     <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                       {item.img_dir ? (
                         <img src={item.img_dir} alt={item.title} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                       )}
                     </div>
                     
                     {/* 텍스트 정보 */}
                     <div className="ml-4 flex-1 min-w-0">
                       <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                       <p className="text-sm text-gray-500 truncate">{item.creator}</p>
                       <p className="text-xs text-gray-400 mt-1">
                         {getLocalDateString(item.selected_date)}
                       </p>
                     </div>
                   </Link>
                 ))}
               </div>
             )}

             {/* ✨ 4. 조건부 렌더링: 그리드 모드 */}
             {viewMode === 'grid' && (
               <div className="grid grid-cols-4 gap-4"> {/* 2열 그리드 */}
                 {items.map((item) => (
                   <Link 
                     key={item.selection_id} 
                     href={`/${category}/${item.selection_id}`}
                     className="block group"
                   >
                     {/* 이미지 영역 (정사각형 강제: aspect-square) */}
                     <div className="aspect-square w-full bg-white rounded-xl shadow-sm overflow-hidden mb-2 relative border border-gray-100">
                       {item.img_dir ? (
                         <img 
                           src={item.img_dir} 
                           alt={item.title} 
                           className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                           No Image
                         </div>
                       )}
                       {/* 날짜 뱃지 (이미지 위에 살짝 얹기) */}
                       <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                         {getLocalDateString(item.selected_date)}
                       </div>
                     </div>

                     {/* 텍스트 영역 (이미지 아래) */}
                     <div className="px-1">
                       <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                       <p className="text-xs text-gray-500 truncate">{item.creator}</p>
                     </div>
                   </Link>
                 ))}
               </div>
             )}
           </>
         )}
       </div>
    </div>
  )
}
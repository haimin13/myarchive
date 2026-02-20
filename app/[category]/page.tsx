'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import ListHeader from '@/components/list/ListHeader';
import { ItemListView, ItemGridView } from '@/components/list/ItemViews';

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
    <div className="min-h-screen bg-gray-50 pb-20">
       <ListHeader 
         category={category}
         koreanName={config.koreanName}
         keyword={keyword}
         setKeyword={setKeyword}
         onSearch={handleSearch}
         viewMode={viewMode}
         setViewMode={setViewMode}
       />

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
             {viewMode === 'list' && <ItemListView items={items} category={category} />}
             {viewMode === 'grid' && <ItemGridView items={items} category={category} />}
           </>
         )}
       </div>
    </div>
  );
}
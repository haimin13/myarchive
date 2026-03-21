// 위치: /components/item/ItemSearch.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { getLocalDateString, createInitialFormData } from '@/lib/utility';

interface Props {
  config: any;
  initialKeyword?: string;
  onSelect: (item: any) => void;
}

export default function ItemSearch({
  config, initialKeyword, onSelect
}: Props) {
  const category = config.name;

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'internal' | 'external'>('external');

  const [formData, setFormData] = useState<any>(() => config ? createInitialFormData(config.fields) : {});

  useEffect(() => {
    if (initialKeyword) {
      executeSearch(initialKeyword, searchMode);
    }
  });

  const executeSearch = async (searchQuery: string, mode: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword, searchMode);
  };

  const handleTabChange = (mode: 'internal' | 'external') => {
    setSearchMode(mode);
    setSearchResults([]);
  };


  return (
    <div>
      {/* 검색 모드 탭 (Internal vs External) */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => handleTabChange('internal')}
          className={`flex-1 pb-3 font-bold transition ${searchMode === 'internal'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          DB 검색
        </button>
        <button
          onClick={() => handleTabChange('external')}
          className={`flex-1 pb-3 font-bold transition ${searchMode === 'external'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          온라인 검색
        </button>
      </div>
      {/* 검색창 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder={`제목 또는 ${config.fields[0].label} 검색`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700"
        >
          검색
        </button>
      </form>

      {/* 검색 결과 리스트 */}
      <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
        {loading && <div className="text-center text-gray-500">검색 중...</div>}

        {!loading && searchResults.length > 0 && searchResults.map((item: any, index: number) => (
          <div
            key={item.id || index}
            onClick={() => onSelect(item)}
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
    </div>
  );
}
import Button from '@/components/common/Button';

interface Props {
  category: string;
  koreanName: string;
  keyword: string;
  setKeyword: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onAddClick: () => void;
}

export default function ListHeader({
  category, koreanName, keyword, setKeyword, onSearch, viewMode, setViewMode, onAddClick
}: Props) {
  return (
    <div className="bg-white p-4 shadow-sm sticky top-14 z-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {koreanName} 보관함 🗂️
        </h1>
        <Button 
          onClick={onAddClick}
          size="sm"
        >
          + 추가
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={onSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="검색어 입력..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          />
          <Button
            type="submit"
            className="bg-gray-800 text-white rounded-lg hover:bg-black transition"
            size="sm"
          >
            🔍
          </Button>
        </form>

        <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`px-2 py-2 rounded-md transition border-none shadow-none ${viewMode === 'list' ? 'bg-white text-blue-600' : 'text-gray-500 hover:bg-gray-300'}`}
            title="리스트 보기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`px-2 py-2 rounded-md transition border-none shadow-none ${viewMode === 'grid' ? 'bg-white text-blue-600' : 'text-gray-500 hover:bg-gray-300'}`}
            title="그리드 보기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORY_CONFIG } from '../constants';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    alert('로그아웃 되었습니다.');
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault(); // 페이지 이동 차단
      alert('로그인이 필요한 서비스입니다.');
    }
  };

  return (
    // 💡 relative를 추가하여 내부의 absolute 요소들의 기준점이 되게 함
    <div className="relative flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden">

      {/* ✨ 헤더 대신 우측 상단에 플로팅 되는 로그인/로그아웃 영역 */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        {isLoading ? (
          <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg" />
        ) : user ? (
          <>
            <span className="font-medium text-gray-700 bg-white/80 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
              <b className="text-blue-600">{user.nickname}</b>님
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-white text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm border border-gray-200"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm px-4 py-2 bg-white text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition shadow-sm border border-blue-100"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              회원가입
            </Link>
          </>
        )}
      </div>

      {/* 메인 콘텐츠 영역 (h-screen 내에서 수직 중앙 정렬) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-5xl space-y-8 mt-12 md:mt-0"> {/* 모바일에서 플로팅 버튼과 겹치지 않게 여백 추가 */}

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-gray-900">My Archive</h1>
            <p className="text-gray-500 font-medium text-lg">어떤 기록을 남기시겠어요?</p>
          </div>

          {/* 3x2 그리드 타일 UI */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {Object.entries(CATEGORY_CONFIG).map(([catId, catConfig]: [string, any]) => (
              <Link
                href={`/${catId}`}
                key={catId}
                onClick={handleCategoryClick}
                className="group relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-md transition-all duration-300 
                  hover:-translate-y-1 hover:shadow-xl flex items-center justify-center bg-gray-900"
              >
                {/* 1. 배경 이미지 */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 blur-[3px] scale-105 transition-all duration-500
                    group-hover:blur-0 group-hover:scale-110 group-hover:opacity-80"
                  style={{ backgroundImage: `url(${catConfig.bgImage || 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=800'})` }}
                />

                {/* 2. 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300
                  group-hover:opacity-80" />

                {/* 3. 카테고리 텍스트 */}
                <h2 className="relative text-white text-3xl font-black drop-shadow-lg transform transition-transform duration-300
                  group-hover:scale-110">
                  {catConfig.koreanName}
                </h2>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
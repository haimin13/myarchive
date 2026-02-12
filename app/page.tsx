'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  user_id: string;
  nickname: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    alert('로그아웃 되었습니다.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-blue-600">My Archive</h1>
        <p className="text-gray-600">내가 좋아하는 모든 것을 기록하세요.</p>

        {/* 조건부 렌더링: 유저가 있으면? 없으면? */}
        {user ? (
        // 로그인 했을 때 보이는 화면
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-xl font-bold mb-4">
            👋 안녕하세요, <span className="text-blue-600">{user.nickname}</span>님!
            </p>
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 bg-green-500 text-white rounded-lg font-bold">
                내 보관함 가기 (준비중)
              </button>
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500"
              >
                로그아웃
              </button>
            </div>
          </div>
          ) : (
          // 로그인 안 했을 때 보이는 화면
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >로그인</Link>
            <Link 
              href="/register" 
              className="w-full py-3 bg-white border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
            >회원가입</Link>
          </div>
        )}
      </div>
    </div>
  );
}
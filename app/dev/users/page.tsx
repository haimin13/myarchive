'use client'

import {useState, useEffect} from 'react';

interface User {
  id: number;
  user_id: string;
  nickname: string;
  img_dir: string;
  created_at: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📂 유저 목록 (DB 연동)</h1>

      {/* 로딩 중일 때 보여줄 화면 */}
      {isLoading ? (
        <p>데이터를 불러오는 중...</p>
      ) : (
        /* 데이터가 있을 때 보여줄 화면 */
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-lg font-bold text-gray-800">{user.nickname}</p>
              <p className="text-sm text-gray-500">ID: {user.user_id}</p>
              <p className="text-xs text-gray-400 mt-2">{user.created_at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
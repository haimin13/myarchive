'use client'

import {useState, useEffect} from 'react';

interface User {
  id: number;
  user_id: string;
  nickname: string;
  password: string;
  img_dir: string;
  created_at: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMigrate = async () => {
    if (!confirm('정말 모든 유저의 비밀번호를 해쉬화하시겠습니까? (이미 성료된 유저는 건너뜁니다)')) return;
    
    setIsMigrating(true);
    try {
      const res = await fetch('/api/dev/migrate-passwords', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      fetchUsers(); // 업데이트된 목록 다시 불러오기
    } catch (err) {
      alert('에러 발생');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📂 유저 목록 (DB 연동)</h1>
        <button
          onClick={handleMigrate}
          disabled={isMigrating}
          className={`px-4 py-2 rounded-lg font-bold text-white transition shadow-md ${
            isMigrating ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isMigrating ? '변환 중...' : '비밀번호 일괄 해쉬화'}
        </button>
      </div>

      {/* 로딩 중일 때 보여줄 화면 */}
      {isLoading ? (
        <p>데이터를 불러오는 중...</p>
      ) : (
        /* 데이터가 있을 때 보여줄 화면 */
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-md">
              <span className="flex items-center gap-2">
                <p className="text-lg font-bold text-gray-800">{user.id}. {user.nickname}</p>
                <p className="text-xs text-gray-400 mt-2">{user.created_at}</p>
              </span>
              <p className="text-sm text-gray-500">ID: {user.user_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client"

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다. (실제 발송은 준비 중이므로 응답을 확인해 주세요)');
      } else {
        setError(data.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">비밀번호 찾기</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
        </p>

        {message && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-100 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              임시 비밀번호 발급 요청
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}


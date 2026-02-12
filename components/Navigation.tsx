'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isHidden = 
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.endsWith('/add') ||
    pathname.endsWith('/edit');

  if (isHidden) return null;
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white h-14 shadow-sm flex items-center px-4 z-40">
        <button
          onClick={()=>setIsOpen(true)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-3 font-bold text-gray-800 text-lg">My Archive</span>
      </header>
      <div className="h-14" />
      {isOpen && (
        <div
         className="fixed inset-0 bg-black/50 z-50 transition-opacity"
         onClick={closeMenu}
        />
      )}
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-xl text-gray-800">메뉴</span>
          <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-2">
          <Link
            href='/'
            onClick={closeMenu}
            className="block px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
          >
            🏠 홈
          </Link>
          <div className="my-2 border-t border-gray-100"></div>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]: [string, any]) => (
            <Link
              key={key}
              href={`/${key}`}
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-medium transition ${
                pathname.startsWith(`/${key}`)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📂 {config.koreanName}
            </Link>
          ))}
          <div className="my-2 border-t border-gray-100"></div>

          <button
            onClick={() => {
              if(confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                location.href = '/login';
              }
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-500 font-medium"
          >
           🚪 로그아웃
          </button>
        </div>
      </nav>
    </>
  )
}
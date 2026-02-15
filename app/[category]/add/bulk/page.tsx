'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString, parseCSV } from '@/lib/simple';

export default function AddBulkPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [userId, setUserId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<string[][]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
    else setFile(null);
  }

  const handleParseClick = async () => {
    let result: string[][] = [];
    try {
      if (file) {
        result = await parseCSV(file);
      } else if (textInput) {
        result = await parseCSV(textInput);
      }
      setParsedList(result);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  useEffect(() => {
    if (!config) {
      alert('존재하지 않는 카테고리입니다.');
      router.push('/');
      return;
    }
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      alert('로그인이 필요합니다!');
      router.push('/login');
      return;
    }
    setUserId(JSON.parse(storedUser).id);
  }, []);



  if (!config) return <div className="p-10 text-center">로딩 중...</div>

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        
        {/* 상단 컨트롤 영역 */}
        <div className="flex flex-col gap-4 mb-6 border-b pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* 1. 파일 업로드 */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">1. CSV 파일 업로드</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* 파싱 버튼 */}
            <button 
              onClick={handleParseClick} 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shrink-0 shadow-sm"
            >
              파싱!
            </button>
          </div>

          {/* 2. 텍스트 직접 입력 (파일이 없을 때만 활성화) */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. 또는 텍스트 직접 입력 <span className="text-gray-400 font-normal">(파일이 선택되면 비활성화됩니다)</span>
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!!file} // ✨ 핵심: file 객체가 있으면 textarea 비활성화
              placeholder={
                file 
                  ? "파일이 선택되어 텍스트 입력이 비활성화되었습니다. (텍스트를 쓰려면 파일을 취소해주세요)" 
                  : `아티스트명; 앨범명; 2024-01-01\n아티스트명2; 앨범명2; 2024-01-02`
              }
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            />
          </div>
        </div>
        
        {/* 하단 데이터 렌더링 영역 */}
        {!parsedList || parsedList.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            CSV 파일을 업로드하거나 텍스트를 입력한 뒤 <b>파싱!</b> 버튼을 눌러주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              파싱 결과 미리보기 ({parsedList.length}건)
            </h2>
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg w-12">#</th>
                  <th className="px-4 py-3">{config.fields[0].label}</th>
                  <th className="px-4 py-3">{config.koreanName} 제목</th>
                  <th className="px-4 py-3 rounded-tr-lg">발매일</th>
                </tr>
              </thead>
              <tbody>
                {parsedList.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
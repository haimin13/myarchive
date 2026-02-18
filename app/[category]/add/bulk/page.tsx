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
  const [matchedList, setMatchedList] = useState<any[]>([]);
  
  // ✨ 추가: 파싱 결과 테이블을 접고 펴는 상태
  const [isParsedOpen, setIsParsedOpen] = useState(true);

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
      setMatchedList([]); // 다시 파싱하면 이전 매칭 결과는 초기화
      setIsParsedOpen(true); // 파싱하면 다시 펼치기
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleMatchClick = async () => {
    setMatchedList([]);
    if (!parsedList || parsedList.length === 0) return;
    let result: any[] = [];
    try {
      for (const [index, item] of parsedList.entries()) {
        let matchData = {
          original: item,
          matchedItem: null,
          matchStatus: 'failed'
        };

        let query = item[1];
        let endpoint = `/api/${category}/search?q=${query}`;

        let res = await fetch(endpoint);
        let data = await res.json();
        if (res.ok && data.items && data.items.length > 0) {
          matchData.matchedItem = data.items[0];
          matchData.matchStatus = 'db';
          result.push(matchData);
          continue;
        }

        if (category === 'albums') query = `${item[0]} ${item[1]}`;
        endpoint = `/api/external/${category}?q=${query}`;
        res = await fetch(endpoint);
        data = await res.json();
        if (res.ok && data.items && data.items.length > 0) {
          matchData.matchedItem = data.items[0];
          matchData.matchStatus = 'api';
          result.push(matchData);
          continue;
        }

        result.push(matchData);
      }
      setMatchedList(result);
      setIsParsedOpen(false); // ✨ 센스 추가: 매칭이 끝나면 파싱 리스트는 자동으로 접기
    } catch (error) {
      console.error("매칭 중 에러 발생:", error); // 오타 수정
      return;
    }
  }

  // (임시) 클릭 시 팝업 띄울 자리
  const handleItemClick = (index: number) => {
    alert(`${index + 1}번 항목 수정 팝업 띄우기! (추후 구현)`);
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
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-md">
        
        {/* --- 상단 컨트롤 영역 --- */}
        <div className="flex flex-col gap-4 mb-6 border-b pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">1. CSV 파일 업로드</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <button 
              onClick={handleParseClick} 
              disabled={!file && !textInput.trim()}
              className="px-8 py-3 mt-5 sm:mt-0 rounded-lg font-bold transition shrink-0 shadow-sm text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none bg-blue-600 hover:bg-blue-700"
            >
              파싱!
            </button>
            
            <button
              onClick={handleMatchClick}
              disabled={!parsedList || parsedList.length === 0} 
              className="px-8 py-3 mt-5 sm:mt-0 rounded-lg font-bold transition shrink-0 shadow-sm text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none bg-indigo-600 hover:bg-indigo-700"
            >
              매칭!
            </button>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. 또는 텍스트 직접 입력 <span className="text-gray-400 font-normal">(파일이 선택되면 비활성화됩니다)</span>
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!!file} 
              placeholder={
                file 
                  ? "파일이 선택되어 텍스트 입력이 비활성화되었습니다." 
                  : `아티스트명; 앨범명; 2024-01-01\n아티스트명2; 앨범명2; 2024-01-02`
              }
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* --- 데이터 렌더링 영역 --- */}
        {!parsedList || parsedList.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            CSV 파일을 업로드하거나 텍스트를 입력한 뒤 <b>파싱!</b> 버튼을 눌러주세요.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* 1️⃣ 파싱 결과 (접기/펴기 가능) */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsParsedOpen(!isParsedOpen)}
                className="w-full bg-gray-100 px-4 py-3 flex justify-between items-center hover:bg-gray-200 transition"
              >
                <h2 className="text-lg font-bold text-gray-800">
                  파싱 결과 확인 ({parsedList.length}건)
                </h2>
                <span className="text-gray-500">{isParsedOpen ? '▲ 접기' : '▼ 펼치기'}</span>
              </button>
              
              {isParsedOpen && (
                <div className="overflow-x-auto p-4 bg-white">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase border-b border-gray-300">
                      <tr>
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">{config.fields[0].label}</th>
                        <th className="py-2 pr-4">{config.koreanName} 제목</th>
                        <th className="py-2">발매일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedList.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 font-medium text-gray-900">{rowIndex + 1}</td>
                          <td className="py-2">{row[0]}</td>
                          <td className="py-2">{row[1]}</td>
                          <td className="py-2">{row[2] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2️⃣ 매칭 결과 리스트 */}
            {matchedList.length > 0 && (
              <div className="border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-indigo-900">
                    자동 매칭 결과 ({matchedList.length}건)
                  </h2>
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-bold">
                    수정하려면 클릭하세요
                  </span>
                </div>
                
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 w-16">상태</th>
                        <th className="px-4 py-3 w-1/3">입력된 원본 데이터</th>
                        <th className="px-4 py-3">매칭된 정보 (미리보기)</th>
                        <th className="px-4 py-3 w-24 text-center">선택 날짜</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedList.map((item, index) => (
                        <tr 
                          key={index} 
                          onClick={() => handleItemClick(index)} // ✨ 팝업 클릭 이벤트 예약
                          className="border-b hover:bg-indigo-50 cursor-pointer transition"
                        >
                          {/* 상태 뱃지 */}
                          <td className="px-4 py-3">
                            {item.matchStatus === 'db' && <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">DB</span>}
                            {item.matchStatus === 'api' && <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">API</span>}
                            {item.matchStatus === 'failed' && <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">Fail</span>}
                          </td>
                          
                          {/* 원본 텍스트 */}
                          <td className="px-4 py-3 text-gray-500">
                            <div className="font-semibold">{item.original[1]}</div>
                            <div className="text-xs">{item.original[0]}</div>
                          </td>
                          
                          {/* 매칭된 썸네일 & 정보 */}
                          <td className="px-4 py-3">
                            {item.matchedItem ? (
                              <div className="flex items-center gap-3">
                                {item.matchedItem.img_dir ? (
                                  <img 
                                    src={item.matchedItem.img_dir} 
                                    alt="thumbnail" 
                                    className="w-10 h-10 object-cover rounded shadow-sm border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                                )}
                                <div>
                                  <div className="font-bold text-gray-900 line-clamp-1">{item.matchedItem.title}</div>
                                  <div className="text-xs text-gray-600 line-clamp-1">{item.matchedItem.creator}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-red-400 font-medium">일치하는 결과 없음</span>
                            )}
                          </td>
                          
                          {/* 날짜 */}
                          <td className="px-4 py-3 text-center text-gray-700 font-medium">
                            {item.original[2] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
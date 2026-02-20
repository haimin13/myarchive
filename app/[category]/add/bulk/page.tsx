'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { CATEGORY_CONFIG } from '@/app/constants';
import { parseCSV } from '@/lib/simple';
import { useBulkMatch } from '@/hooks/useBulkMatch';

import BulkInputForm from '@/components/bulk/BulkInputForm';
import ParsedTable from '@/components/bulk/ParsedTable';
import MatchedTable from '@/components/bulk/MatchedTable';

export default function AddBulkPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [userId, setUserId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<string[][]>([]);
  const [isParsedOpen, setIsParsedOpen] = useState(true);

  const { 
    matchedList, 
    isMatching, 
    matchProgress, 
    startMatching 
  } = useBulkMatch(category);


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
      setIsParsedOpen(true); // 파싱하면 다시 펼치기
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleMatchClick = async () => {
    setIsParsedOpen(false); // 파싱 리스트 접기
    startMatching(parsedList);
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
        {/* 1. 입력 폼 컴포넌트 */}
        <BulkInputForm 
          file={file}
          onFileChange={handleFileChange}
          textInput={textInput}
          onTextInputChange={setTextInput}
          onParse={handleParseClick}
          onMatch={handleMatchClick}
          isParseDisabled={!file && !textInput.trim()}
          isMatchDisabled={!parsedList || parsedList.length === 0 || isMatching}
          isMatching={isMatching}
          matchProgress={matchProgress}
        />
        
        {!parsedList || parsedList.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            CSV 파일을 업로드하거나 텍스트를 입력한 뒤 <b>파싱!</b> 버튼을 눌러주세요.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 2. 파싱 테이블 컴포넌트 */}
            <ParsedTable 
              data={parsedList} 
              config={config} 
              isOpen={isParsedOpen} 
              onToggle={() => setIsParsedOpen(!isParsedOpen)} 
            />

            {/* 3. 매칭 결과 컴포넌트 */}
            <MatchedTable 
              data={matchedList} 
              isMatching={isMatching} 
              matchProgress={matchProgress} 
              onItemClick={handleItemClick} 
            />
          </div>
        )}
      </div>
    </div>
       
  );
}
// app/[category]/add/bulk/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { CATEGORY_CONFIG } from '@/app/constants';
import { parseCSV } from '@/lib/simple';
import { useBulkMatch } from '@/hooks/useBulkMatch';
import { getLocalDateString } from '@/lib/simple';
import { useAuth } from '@/components/AuthProvider';

import BulkInputForm from '@/components/bulk/BulkInputForm';
import ParsedTable from '@/components/bulk/ParsedTable';
import MatchedTable from '@/components/bulk/MatchedTable';
import BaseModal from '@/components/item/BaseModal';
import ItemSearch from '@/components/item/ItemSearch';
import ItemForm from '@/components/item/ItemForm';


export default function AddBulkPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];
  const { user, isLoading: isAuthLoading } = useAuth();

  const userId = user?.id;
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<string[][]>([]);
  const [isParsedOpen, setIsParsedOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const { 
    matchedList,
    setMatchedList,
    isMatching,
    matchProgress,
    startMatching 
  } = useBulkMatch(category);

  const [formData, setFormData] = useState<any>(() => ({
    title: '',
    img_dir: '',
    creator: ''
  }));

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev: any) => ({...prev, [name]: value}));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetIndex === null) return;
    if (matchedList[targetIndex].matchedItem.title === formData.title &&
        matchedList[targetIndex].matchedItem.creator === formData.creator){
      console.log('unchanged');
      closeModal();
      return;
    }
    
    setMatchedList(prev => {
      const newList = [...prev];
      newList[targetIndex] = {
        ...newList[targetIndex],
        matchedItem: {...formData },
        matchStatus: 'manual'
      };

      return newList;
    });

    closeModal();
  }

  const closeModal = () => {
    setTargetIndex(null);
    setFormData({title: '', img_dir: '', creator: ''});
    setIsModalOpen(false);
  }

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

  const handleMatchedItemClick = (index: number) => {
    setTargetIndex(index);
    const clickedItem = matchedList[index];
    if (clickedItem && clickedItem.matchedItem) {
      handleSearchResultSelect(clickedItem.matchedItem);
    }
    else {
      setFormData({title: '', img_dir: '', creator: ''});
    }
    setIsModalOpen(true);
  }

  const handleSearchResultSelect = (item: any) => {
    const newFormData: any = {
      ...formData,
      title: item.title,
      creator: item.creator,
      img_dir: item.img_dir || '',
    };

    config.fields.forEach((field: any) => {
      const dbValue = item[field.name];

      if (dbValue) {
        if (field.name === 'release_date') {
          newFormData[field.name] = getLocalDateString(dbValue);
        }
        else {
          newFormData[field.name] = dbValue;
        }
      }
    });
    setFormData(newFormData);
  }

  const handleBulkSave = async () => {
    const itemsToSave = matchedList
      .filter(item => item.matchStatus === 'api' || item.matchStatus === 'db' || item.matchStatus === 'manual')
      .map(item => ({
        matchStatus: item.matchStatus,
        itemId: item.matchedItem.id || null,
        selectedDate: item.original.at(-1),
        matchedItem: item.matchedItem
      }));
    if (itemsToSave.length === 0) {
      alert('저장할 항목이 없습니다.');
      return;
    }
    console.log(itemsToSave);
    try {
      const res = await fetch(`/api/${category}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: itemsToSave }),
      });

      if (res.ok) {
        const data = await res.json();

        alert(`총 ${data.count} 개 ${config.koreanName} 일괄 저장 완료!`);
        router.push(`/${category}`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (!config) {
      alert('존재하지 않는 카테고리입니다.');
      router.push('/');
      return;
    }
    if (!isAuthLoading && !user) {
      alert('로그인이 필요합니다!');
      router.push('/login');
    }
  }, [user, isAuthLoading, config, router]);

  if (!config) return <div className="p-10 text-center">로딩 중...</div>

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-md">
      {/*상단 헤더 영역*/}
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center">
            <button 
              onClick={() => router.push(`/${category}/add`)} 
              className="mr-4 text-gray-500 hover:text-black transition-colors p-1"
              aria-label="일반 등록으로 돌아가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              📦 {config.koreanName} 일괄 등록
            </h1>
          </div>
        </div>
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
              onItemClick={handleMatchedItemClick}
            />
          </div>
        )}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleBulkSave}
            disabled={isMatching || !matchedList.some(item => ['db', 'api', 'manual'].includes(item.matchStatus))}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg 
              hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            일괄 등록하기
          </button>
        </div>
      </div>
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="항목 재검색 및 수정"
      >
        <div className="flex flex-col gap-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-bold text-gray-500 mb-3">1. 검색해서 가져오기</h3>
            <ItemSearch
              config={config}
              initialKeyword={undefined}
              onSelect={handleSearchResultSelect}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">2. 상세 정보 확인 및 확정</h3>
            <ItemForm
              config={config}
              formData={formData}
              onChange={handleFormChange}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              submitText="업데이트"
            />
          </div>
        </div>
      </BaseModal>
    </div>
       
  );
}
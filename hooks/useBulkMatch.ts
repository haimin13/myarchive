import { useState } from 'react';

export function useBulkMatch(category: string) {
  const [matchedList, setMatchedList] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);

  const startMatching = async (parsedList: string[][]) => {
    if (!parsedList || parsedList.length === 0) return;

    setIsMatching(true);
    setMatchProgress(0);
    
    // 초기 뼈대 리스트 세팅
    const initialList = parsedList.map(item => ({
      original: item,
      matchedItem: null,
      matchStatus: 'loading'
    }));
    setMatchedList(initialList);

    try {
      for (const [i, item] of parsedList.entries()) {
        let matchData = {...initialList[i]};

        let query = item[1];
        let endpoint = `/api/${category}/search?q=${query}`;
        let res = await fetch(endpoint);
        let data = await res.json();
        let dbMatched = false;

        // DB 검색
        if (res.ok && data.items && data.items.length > 0) {
          for (const result of data.items) {
            if (matchData.original[1].trim().toLowerCase() === result.title.trim().toLowerCase()) {
              matchData.matchedItem = result;
              matchData.matchStatus = 'db';
              dbMatched = true;
              break;
            }
          }
        }

        // 외부 API 검색 및 재시도 로직
        if (!dbMatched) {
          if (category === 'albums') query = `${item[0]} ${item[1]}`;
          endpoint = `/api/external/${category}?q=${query}`;

          let retryCount = 0;
          const maxRetries = 3;
          let apiSuccess = false;

          while (retryCount < maxRetries && !apiSuccess) {
            try {
              res = await fetch(endpoint);
              if (!res.ok) throw new Error(`API Error: ${res.status}`);
              data = await res.json();

              if (data.items && data.items.length > 0) {
                matchData.matchedItem = data.items[0];
                matchData.matchStatus = 'api';
              } else {
                matchData.matchStatus = 'failed';
              }
              apiSuccess = true;

            } catch (apiError) {
              retryCount++;
              console.warn(`[API 제한 감지] ${retryCount}회 실패. 3초 대기 후 재시도...`);
              
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 3000));
              } else {
                matchData.matchedItem = null;
                matchData.matchStatus = 'failed';
              }
            }
          }
        }

        // 상태 업데이트
        setMatchedList(prev => {
          const newList = [...prev];
          newList[i] = matchData;
          return newList;
        });

        setMatchProgress(Math.round(((i + 1) / parsedList.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("매칭 중 에러 발생:", error);
    } finally {
      setIsMatching(false);
    }
  };

  // UI 컴포넌트에서 쓸 수 있도록 필요한 상태와 함수를 반환합니다.
  return { 
    matchedList, 
    setMatchedList, 
    isMatching, 
    matchProgress, 
    startMatching 
  };
}
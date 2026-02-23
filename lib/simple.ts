import Papa from 'papaparse';

export function getLocalDateString(date: any): string {
  if (!date) return '';

  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(d)
    .replace(/\. /g, '-')
    .replace(/\./g, '');
}

export const formatToISODate = (dateStr: string) => {
  if (!dateStr) return null;
  
  // 1. 공백 제거 및 마침표(.)나 슬래시(/)를 하이픈(-)으로 변경
  let cleaned = dateStr.replace(/[\.\/]/g, '-').replace(/\s/g, '');
  
  // 2. 년/월/일 분리
  const parts = cleaned.split('-');
  if (parts.length === 3) {
    // 연도가 2자리(24)면 2024로, 월/일이 1자리(2)면 02로 맞춤
    const year = parts[0].length === 2 ? `20${parts[0]}` : parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

export function parseCSV(input: string | File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    // 공통 데이터 가공 로직: 각 행의 마지막 날짜 형식을 미리 정리
    const sanitizeData = (raw: string[][]) => {
      return raw.map(row => {
        if (row.length === 0) return row;
        const newRow = [...row];
        const lastIdx = newRow.length - 1;
        const formattedDate = formatToISODate(newRow[lastIdx]);
        newRow[lastIdx] = formattedDate || newRow[lastIdx]; 
        return newRow;
      });
    };

    // 1. 문자열 처리
    if (typeof input === 'string') {
      try {
        const data = input
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.split(';').map(cell => cell.trim()));
        
        resolve(sanitizeData(data));
      } catch (error) {
        reject(error);
      }
    } 
    // 2. CSV 파일 처리
    else if (input instanceof File) {
      Papa.parse(input, {
        header: false,
        skipEmptyLines: true,
        complete: (results: any) => {
          const data = (results.data as string[][]).slice(1);
          resolve(sanitizeData(data));
        },
        error: (error: any) => reject(error)
      });
    } else {
      resolve([]);
    }
  });
}
import Papa from 'papaparse';

export function getLocalDateString(date: any): string {
  if (!date) return '';
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

export function parseCSV(input: string | File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    // 문자열 처리
    if (typeof input === 'string') {
      console.log("문자열 처리");
      try {
        const data = input
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => 
            line.split(';').map(cell => cell.trim())
          );
        console.log("파싱완료");
        resolve(data);
      } catch (error) {
        console.error("문자열 파싱 에러:", error);
        reject(error);
      }
    }
    if (input instanceof File && input.name.endsWith('.csv')) {
      console.log("CSV 파일 처리");
      Papa.parse(input, {
        header: false,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<string[]>) => {
          const data = (results.data as string[][]).slice(1);
          console.log("파싱 완료");
          resolve(data);
        },
        error: (error: any) => {
          console.error("에러 발생:", error.message);
          reject(error);
        }
      });
    } else {
      console.warn("지원하지 않는 형식입니다.");
      resolve([]);
    }
  });
}
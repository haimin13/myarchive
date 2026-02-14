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

export function parseAlbumList(input: string | File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const isFile = input instanceof File;
    const config = {
      header: false,
      skipEmptyLines: true,
      ...(typeof input === 'string' && { delimiter: ';'}),
      complete: (results: Papa.ParseResult<string[]>) => {
        let data = results.data as string[][];
        if (isFile) {
          data = data.slice(1);
        }
        console.log("파싱완료", data);
        resolve(data);
      },
      error: (error: any) => {
        console.error("에러 발생:", error.message);
        reject(error);
      }
    };

    if (typeof input === 'string') {
      console.log("문자열 처리");
      Papa.parse(input, config);
    } else if (input instanceof File && input.name.endsWith('.csv')) {
      console.log("CSV 파일 처리");
      Papa.parse(input as File, config);
    } else {
      console.warn("지원하지 않는 형식입니다.")
      resolve([]);
    }
  });
}
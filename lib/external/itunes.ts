// lib/external/itunes.ts

export async function searchITunes(query: string) {
  try {
    const term = encodeURIComponent(query).replace(/%20/g, '+');
    
    const endpoint = `https://itunes.apple.com/search?term=${term}&media=music&limit=50&country=KR&lang=ko_kr`;
    
    const res = await fetch(endpoint);
    const data = await res.json();

    const bestAlbums = new Map<string, any>();

    data.results.forEach((item: any) => {
      if (!item.collectionName || !item.artistName) return;

      // 키: 가수이름_앨범제목 (대소문자 무시 등을 위해 소문자 변환 추천)
      const key = `${item.artistName}_${item.collectionName}`;
      const existing = bestAlbums.get(key);

      if (!existing) {
        // 1. 없으면 등록
        bestAlbums.set(key, item);
      } else {
        const currentCount = item.trackCount || 0;
        const existingCount = existing.trackCount || 0;

        // 2. [트랙 수 대결] 더 많은 트랙을 가진 게 진짜 앨범 (싱글 vs 정규)
        if (currentCount > existingCount) {
          bestAlbums.set(key, item);
        } 
        // 3. [날짜 대결] 트랙 수가 같다면? (같은 앨범 내 수록곡들끼리의 싸움)
        else if (currentCount === existingCount) {
          // ✨ 더 '최신' 날짜를 가진 놈이 승리!
          // 이유: 선공개 곡(1월) vs 일반 곡(6월) -> 앨범 발매일은 6월이어야 함
          if (item.releaseDate > existing.releaseDate) {
            bestAlbums.set(key, item);
          }
        }
      }
    });

    const formattedItems = Array.from(bestAlbums.values()).map((item: any) => {
      const highResImage = item.artworkUrl100 
        ? item.artworkUrl100.replace('100x100bb', '600x600bb') 
        : '';

      return {
        id: null,
        title: item.collectionName,
        creator: item.artistName,
        img_dir: highResImage,
        release_date: item.releaseDate,
      };
    });

    return formattedItems;

  } catch (error) {
    console.error('iTunes Search Error:', error);
    return [];
  }
}
// lib/external/itunes.ts
import { getLocalDateString } from "../utility";

export async function searchITunes(query: string) {
  const term = encodeURIComponent(query).replace(/%20/g, '+');

  // 1. entity=album으로 앨범 단위 검색을 명시하여 곡(track) 검색 시 발생하는 노이즈 제거
  const endpoint = `https://itunes.apple.com/search?term=${term}&entity=album&media=music&limit=50&country=KR&lang=ko_kr`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`iTunes_API_ERROR:${res.status}`);
  }

  const data = await res.json();

  const bestAlbums = new Map<string, any>();

  // 2. 검색 결과 정제: 동일한 가수+앨범명이 있을 경우 가장 먼저 발매된(original) 앨범 우선
  data.results.forEach((item: any) => {
    if (!item.collectionName || !item.artistName) return;

    const key = `${item.artistName.toLowerCase()}_${item.collectionName.toLowerCase()}`.trim();
    const existing = bestAlbums.get(key);

    if (!existing) {
      bestAlbums.set(key, item);
    } else {
      // 앨범 단위 검색에서는 trackCount보다 releaseDate가 중요 (최초 발매 앨범 찾기)
      if (item.releaseDate < existing.releaseDate) {
        bestAlbums.set(key, item);
      }
    }
  });

  const formattedItems = Array.from(bestAlbums.values()).map((item: any) => {
    const highResImageUrl = item.artworkUrl100
      ? item.artworkUrl100.replace('100x100bb', '600x600bb')
      : '';

    return {
      id: null,
      title: item.collectionName,
      creator: item.artistName,
      img_dir: highResImageUrl,
      release_date: item.releaseDate ? getLocalDateString(item.releaseDate) : '',
    };
  });

  // 날짜순으로 정렬해서 반환 (최신순)
  return formattedItems.sort((a, b) => b.release_date.localeCompare(a.release_date));
}

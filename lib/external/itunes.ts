// lib/external/itunes.ts
import { getLocalDateString } from "../utility";

export async function searchITunes(query: string) {
  const term = encodeURIComponent(query).replace(/%20/g, '+');

  const endpoint = `https://itunes.apple.com/search?media=music&country=kr&term=${term}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`iTunes_API_ERROR:${res.status}`);
  }

  const data = await res.json();

  const bestAlbums = new Map<number, any>();

  data.results.forEach((item: any) => {
    if (!item.collectionId) return;

    const key = item.collectionId;
    const existing = bestAlbums.get(key);

    if (!existing) {
      bestAlbums.set(key, item);
    } else if (item.releaseDate > existing.releaseDate) {
      bestAlbums.set(key, item);
    }
  });

  const formattedItems = Array.from(bestAlbums.values()).map((item: any) => {
    const highResImageUrl = item.artworkUrl100
      ? item.artworkUrl100.replace('100x100bb', '600x600bb')
      : '';

    return {
      id: null,
      title: item.collectionName,
      creator: item.collectionArtistName || item.artistName,
      img_dir: highResImageUrl,
      release_date: item.releaseDate ? getLocalDateString(item.releaseDate) : '',
    };
  });

  // 날짜순으로 정렬해서 반환 (최신순)
  return formattedItems.sort((a, b) => b.release_date.localeCompare(a.release_date));
}

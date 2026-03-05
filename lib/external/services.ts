import { searchITunes } from "./itunes";
import { searchIGDB } from "./igdb";

export async function searchExternalContent(category: string, query: string) {
  if (category === 'albums') {
    return await searchITunes(query);
  } else if (category === 'games') {
    return await searchIGDB(query);
  }

  return [];
}
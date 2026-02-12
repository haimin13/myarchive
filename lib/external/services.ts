import { searchITunes } from "./itunes";

export async function searchExternalContent(category: string, query: string) {
  if (category === 'albums') {
    return await searchITunes(query);
  }
  return [];
}
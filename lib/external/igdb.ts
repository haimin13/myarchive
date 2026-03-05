// lib/external/igdb.ts
import { getLocalDateString } from "../simple";

export async function searchIGDB(query: string) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_SECRET_TOKEN;
  const authEndpoint = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  const authRes = await fetch(authEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!authRes.ok) {
    throw new Error(`External API responded with ${authRes.status}`);
  }
  const authResult = await authRes.json();
  const accessToken = authResult.access_token;
  const endpoint = 'https://api.igdb.com/v4/games'


  const res = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "text/plain",
      "Client-ID": `${clientId}`,
      "Authorization": `Bearer ${accessToken}`
    },
    body: `
      search "${query}";
      fields name, involved_companies.company.name, involved_companies.developer
        ,cover.url, genres.name, platforms.name, first_release_date, aggregated_rating, rating; 
      where game_type = (0,2,4,8,9,10) & aggregated_rating_count > 0;
      limit 20;
      `
    // 0: main_game, 2: expansion, 4: standalone_expansion, 8: remake, 9: remaster, 10: expanded_game
  })
  if (!res.ok) {
    const errorData = await res.json(); // API가 보내준 에러 메시지 읽기
    console.error("IGDB API Error Details:", errorData);
    
    // 에러 메시지를 포함해서 에러 던지기
    throw new Error(
      `IGDB API Error: ${res.status} - ${errorData[0]?.cause || errorData.message || JSON.stringify(errorData)}`
    );
  }
  const result = await res.json();
  // const fullResultString = JSON.stringify(result, null, 2);
  // console.log(fullResultString);

  const formattedItems = result.map((item: any) => {
    const developers = item.involved_companies
      ?.filter((c: any) => c.developer === true)
      .map((c: any) => c.company.name)
      .join(', ') || 'No Info';

    const releaseDate = item.first_release_date
      ? getLocalDateString(new Date(item.first_release_date * 1000))
      : '';
    
    
    return {
      id: null,
      title: item.name,
      creator: developers,
      img_dir: item.cover?.url ? `https:${item.cover.url.replace('t_thumb','t_720p')}` : '',
      platforms: item.platforms?.map((p: any) => p.name).join(', ') || '',
      //critic_rating: item.aggregated_rating ? Number(item.aggregated_rating.toFixed(1)) : null,
      //user_rating: item.rating ? Number(item.rating.toFixed(1)) : null,
      genres: item.genres?.map((g: any) => g.name).join(', ') || '',
      release_date: releaseDate
    };
  });

  return formattedItems;
}
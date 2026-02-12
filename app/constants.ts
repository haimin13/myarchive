export const CATEGORY_CONFIG: any = {
  albums: {
    koreanName: '앨범',
    masterTable: 'albums',
    selectedTable: 'selected_albums',
    fields: [
      { name: 'creator', label: '아티스트', placeholder: '예: 아이유', required: true },
      { name: 'release_date', label: '발매일', placeholder: 'YYYY-MM-DD' },
    ],
  },
  games: {
    koreanName: '게임',
    masterTable: 'games',
    selectedTable: 'selected_games',
    fields: [
      { name: 'creator', label: '개발사', placeholder: '예: Larian Studio', required: true },
      { name: 'release_date', label: '발매일', placeholder: 'YYYY-MM-DD' },
    ],
  },
};
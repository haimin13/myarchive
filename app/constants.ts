export const CATEGORY_CONFIG: any = {
  albums: {
    name: 'albums',
    koreanName: '앨범',
    masterTable: 'albums',
    selectedTable: 'selected_albums',
    bgImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    fields: [
      { name: 'creator', label: '아티스트', placeholder: '예: 아이유', required: true },
      { name: 'release_date', label: '발매일', placeholder: 'YYYY-MM-DD' },
    ],
  },
  games: {
    name: 'games',
    koreanName: '게임',
    masterTable: 'games',
    selectedTable: 'selected_games',
    bgImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
    fields: [
      { name: 'creator', label: '개발사', placeholder: '예: Larian Studio', required: true },
      { name: 'release_date', label: '출시일', placeholder: 'YYYY-MM-DD' },
    ],
  },
  movies: {
    name: 'movies',
    koreanName: '영화',
    masterTable: 'movies',
    selectedTable: 'selected_movies',
    bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    fields: [
      { name: 'creator', label: '감독', placeholder: '', required: true },
      { name: 'release_date', label: '개봉일', placeholder: 'YYYY-MM-DD' },
    ]
  },
  books: {
    name: 'books',
    koreanName: '책',
    masterTable: 'books',
    selectedTable: 'selected_books',
    bgImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    fields: [
      { name: 'creator', label: '작가', placeholder: '', required: true },
      { name: 'release_date', label: '출시일', placeholder: 'YYYY-MM-DD' },
    ]
  },
  anime: {
    name: 'anime',
    koreanName: '만화',
    masterTable: 'anime',
    selectedTable: 'selected_anime',
    bgImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80',
    fields: [
      { name: 'creator', label: '작가', placeholder: '', required: true },
      { name: 'release_date', label: '연재 시작일', placeholder: 'YYYY-MM-DD' },
    ]
  }


};
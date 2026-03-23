import { CategoryConfig, FieldConfig } from '@/types';

export const COMMON_FIELDS: FieldConfig[] = [
  { name: 'img_dir', label: '대표 이미지', type: 'image' },
  { name: 'title', label: '제목', type: 'text', placeholder: '제목을 입력하세요', required: true },
  { name: 'selected_date', label: '수집한 날짜', type: 'date', required: true },
];

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  albums: {
    name: 'albums',
    koreanName: '앨범',
    masterTable: 'albums',
    selectedTable: 'selected_albums',
    bgImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '아티스트', type: 'text', placeholder: '예: 아이유', required: true },
      { name: 'release_date', label: '발매일', type: 'date', placeholder: 'YYYY-MM-DD' },
    ],
  },
  games: {
    name: 'games',
    koreanName: '게임',
    masterTable: 'games',
    selectedTable: 'selected_games',
    bgImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '개발사', type: 'text', placeholder: '예: Larian Studio', required: true },
      { name: 'platforms', label: '플랫폼', type: 'text', placeholder: '예: PS5, PC, NSW2'},
      { name: 'release_date', label: '출시일', type: 'date', placeholder: 'YYYY-MM-DD' },
      { name: 'genres', label: '장르', type: 'text'},
    ],
  },
  movies: {
    name: 'movies',
    koreanName: '영화',
    masterTable: 'movies',
    selectedTable: 'selected_movies',
    bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '감독', type: 'text', placeholder: '예: 봉준호', required: true },
      { name: 'release_date', label: '개봉일', type: 'date', placeholder: 'YYYY-MM-DD' },
    ]
  },
  books: {
    name: 'books',
    koreanName: '책',
    masterTable: 'books',
    selectedTable: 'selected_books',
    bgImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '작가', type: 'text', placeholder: '예: 한강', required: true },
      { name: 'release_date', label: '출판년도', type: 'text', placeholder: 'YYYY' },
    ]
  },
  anime: {
    name: 'anime',
    koreanName: '만화',
    masterTable: 'anime',
    selectedTable: 'selected_anime',
    bgImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '작가', type: 'text', placeholder: '예: 오다 에이이치로', required: true },
      { name: 'release_date', label: '연재년도', type: 'text', placeholder: 'YYYY' },
    ]
  },
  tvshows: {
    name: 'tvshows',
    koreanName: '시리즈',
    masterTable: 'tvshows',
    selectedTable: 'selected_tvshows',
    bgImage: 'https://dnm.nflximg.net/api/v6/BvVbc2Wxr2w6QuoANoSpJKEIWjQ/AAAAQavW2NsPoRMpRHtA9QrkRartIDbya5GDWj9uAjmtlkC7PSIMKoQ5QJ3k8SnlnKScjniyV7H0Owxjd7-CVxX3BCawy4K-8b0z_h8sEqbi4Rh1nMGhqVWa1RLbUXlW3SzGLnruqO1sjjiw5oeLqri7MtL3HDU.jpg?r=de5',
    fields: [
      ...COMMON_FIELDS,
      { name: 'creator', label: '제작자', type: 'text', placeholder: '', required: true },
      { name: 'release_date', label: '방영년도', type: 'text', placeholder: 'YYYY' },
    ]
  },
};
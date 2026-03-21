export type FieldType = 'text' | 'date' | 'image' | 'number' | 'textarea' | 'checkbox';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
}

export interface CategoryConfig {
  name: string;
  koreanName: string;
  masterTable: string;
  selectedTable: string;
  bgImage: string;
  fields: FieldConfig[];
}

// ------ Database Interfaces ------ //

export interface BaseItem {
  id?: number;
  title: string;
  img_dir?: string;
  creator: string; // 공통: 아티스트, 감독, 작가 등
  release_date?: string; // 공통: 발매일, 개봉일 등
}

export interface GameItem extends BaseItem {
  platforms?: string;
  genres?: string;
}

export interface SelectedItem<T = BaseItem> {
  id?: number;
  user_id: number;
  item_id: number;
  selected_date: string;
  item?: T; // DB 조인(JOIN)을 통해 가져오는 마스터 데이터
}

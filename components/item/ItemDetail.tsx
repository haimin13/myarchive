// 위치: /components/item/ItemDetail.tsx
import React from 'react';
import { getLocalDateString } from '@/lib/simple';

interface Props {
  item: any;
  config: any;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  
  // 날짜 수정 관련 Props
  isEditingDate: boolean;
  tempDate: string;
  onTempDateChange: (val: string) => void;
  onDateEditStart: () => void;
  onDateEditCancel: () => void;
  onDateSubmit: () => void;
}

export default function ItemDetail({
  item, config, onBack, onEdit, onDelete,
  isEditingDate, tempDate, onTempDateChange, onDateEditStart, onDateEditCancel, onDateSubmit
}: Props) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm font-bold"
        >
          ← 목록으로
        </button>
        
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition text-sm font-bold">
            수정
          </button>
          <button onClick={onDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition text-sm font-bold">
            삭제
          </button>
        </div>
      </div>

      {/* 이미지 영역 */}
      <div className="w-80 aspect-square mx-auto mt-8 bg-gray-200 rounded-xl overflow-hidden shadow-md">
        {item.img_dir ? (
          <img src={item.img_dir} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">NO IMAGE</div>
        )}
      </div>

      {/* 내용 영역 */}
      <div className="p-8 pt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{item.title}</h1>
        
        {/* 등록일 섹션 */}
        <div className="text-sm text-gray-500 mb-8 border-b pb-4 flex items-center justify-center h-8">
          <span className="mr-2">등록일:</span>

          {isEditingDate ? (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={tempDate}
                onChange={(e) => onTempDateChange(e.target.value)}
                className="border border-gray-300 p-1 rounded text-sm bg-white"
              />
              <button onClick={onDateSubmit} className="text-blue-600 font-bold hover:underline">저장</button>
              <button onClick={onDateEditCancel} className="text-gray-400 hover:text-gray-600 hover:underline">취소</button>
            </div>
          ) : (
            <>
              <span>{getLocalDateString(item.selected_date)}</span>
              <button 
                onClick={onDateEditStart}
                className="ml-2 text-gray-400 hover:text-blue-500 transition"
                title="날짜 수정"
              >
                ✎
              </button>
            </>
          )}
        </div>

        {/* 동적 필드 표시 */}
        <div className="space-y-4">
          {config.fields.map((field: any) => (
            <div key={field.name} className="flex border-b border-gray-100 pb-2">
              <span className="w-32 font-bold text-gray-600 flex-shrink-0">{field.label}</span>
              <span className="text-gray-800">
                {field.name === 'release_date' && item[field.name]
                  ? getLocalDateString(item[field.name])
                  : (item[field.name] || '-')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// 위치: /components/item/ItemDetail.tsx
import Button from '@/components/common/Button';
import { getLocalDateString } from '@/lib/utility';

interface Props {
  item: any;
  config: any;
  onEdit: () => void;
  onDelete: () => void;

  // 날짜 수정 관련 Props
  isEditingDate: boolean;
  tempDate: string;
  onTempDateChange: (val: string) => void;
  onDateEditStart: () => void;
  onDateEditCancel: () => void;
  onDateSubmit: () => void;
  isLoading?: boolean;
}

export default function ItemDetail({
  item, config, onEdit, onDelete,
  isEditingDate, tempDate, onTempDateChange, onDateEditStart, onDateEditCancel, onDateSubmit,
  isLoading = false
}: Props) {
  return (
    <div>
      {/* 상단 툴바 */}
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onEdit} className="text-blue-600 px-3 py-2 text-sm">
            수정
          </Button>
          <Button variant="ghost" onClick={onDelete} isLoading={isLoading} className="text-red-500 px-3 py-2 text-sm">
            삭제
          </Button>
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
                disabled={isLoading}
              />
              <Button 
                variant="ghost" onClick={onDateSubmit} isLoading={isLoading}
                className="text-blue-600 px-2 py-1 text-xs"
              >
                저장
              </Button>
              <Button 
                variant="ghost" onClick={onDateEditCancel} disabled={isLoading}
                className="text-gray-400 px-2 py-1 text-xs"
              >
                취소
              </Button>
            </div>
          ) : (
            <>
              <span>{getLocalDateString(item.selected_date)}</span>
              <Button
                variant="ghost" size="sm" onClick={onDateEditStart} 
                className="ml-2 px-1 py-1 text-gray-400 hover:text-blue-500 border-none shadow-none"
                title="날짜 수정" disabled={isLoading}
              >
                ✎
              </Button>
            </>
          )}
        </div>

        <div className="space-y-4">
          {config.fields
            .filter((f: any) => !['title', 'img_dir', 'selected_date'].includes(f.name))
            .map((field: any) => (
            <div key={field.name} className="flex border-b border-gray-100 pb-2">
              <span className="w-32 font-bold text-gray-600 flex-shrink-0">{field.label}</span>
              <span className="text-gray-800">
                {field.type === 'date' && item[field.name]
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

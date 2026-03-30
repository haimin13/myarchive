import { getLocalDateString } from '@/lib/utility';
import { CategoryConfig } from '@/types';

interface Props {
  items: any[];
  config: CategoryConfig;
  onItemClick: (item: any) => void;
}

// 카테고리에 따른 이미지 비율 결정
const getImageRatioClass = (config: CategoryConfig) => {
  return config.imageAspectRatio ? `aspect-[${config.imageAspectRatio}]` : 'aspect-square';
};

export function ItemListView({ items, config, onItemClick }: Props) {
  const ratioClass = getImageRatioClass(config);

  return (
    <div className="space-y-2"> {/* 간격 축소: space-y-3 -> space-y-2 */}
      {items.map((item) => (
        <div
          key={item.selection_id}
          onClick={() => onItemClick(item)}
          className="flex items-center bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100" // 패딩 축소: p-3 -> p-2
        >
          {/* 이미지 크기 축소: w-16 -> w-10 */}
          <div className={`w-10 ${ratioClass} bg-gray-200 rounded-md overflow-hidden flex-shrink-0`}>
            {item.img_dir ? (
              <img src={item.img_dir} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="ml-3 flex-1 min-w-0 flex flex-col justify-center">
            {/* 제목과 아티스트 한 줄 배치 및 truncate 적용 */}
            <div className="flex items-baseline gap-2 w-full">
              <h3 className="font-bold text-sm text-gray-900 truncate">{item.title}</h3>
              <span className="text-xs text-gray-500 truncate">{item.creator}</span>
            </div>

            {/* 날짜를 아래에 배치 */}
            <p className="text-[10px] text-gray-400 mt-0.5">
              {getLocalDateString(item.selected_date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
export function ItemGridView({ items, config, onItemClick }: Props) {
  const ratioClass = getImageRatioClass(config);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 
      lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-x-3 gap-y-6">
      {items.map((item) => (
        <div
          key={item.selection_id}
          onClick={() => onItemClick(item)}
          className="block group"
        >
          {/* 기존 aspect-square 대신 동적 비율 클래스 적용 */}
          <div className={`${ratioClass} w-full bg-white rounded-xl shadow-sm overflow-hidden mb-2 relative border border-gray-100`}>
            {item.img_dir ? (
              <img
                src={item.img_dir}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                No Image
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {getLocalDateString(item.selected_date)}
            </div>
          </div>

          <div className="px-1">
            <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 truncate">{item.creator}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
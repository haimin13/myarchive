import Link from 'next/link';
import { getLocalDateString } from '@/lib/simple';

interface Props {
  items: any[];
  category: string;
}

export function ItemListView({ items, category }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link 
          key={item.selection_id} 
          href={`/${category}/${item.selection_id}`}
          className="flex items-center bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {item.img_dir ? (
              <img src={item.img_dir} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
            )}
          </div>
          
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
            <p className="text-sm text-gray-500 truncate">{item.creator}</p>
            <p className="text-xs text-gray-400 mt-1">
              {getLocalDateString(item.selected_date)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ItemGridView({ items, category }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => (
        <Link 
          key={item.selection_id} 
          href={`/${category}/${item.selection_id}`}
          className="block group"
        >
          <div className="aspect-square w-full bg-white rounded-xl shadow-sm overflow-hidden mb-2 relative border border-gray-100">
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
        </Link>
      ))}
    </div>
  );
}
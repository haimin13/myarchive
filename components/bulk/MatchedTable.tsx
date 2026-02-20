import React from 'react';

interface Props {
  data: any[];
  isMatching: boolean;
  matchProgress: number;
  onItemClick: (index: number) => void;
}

export default function MatchedTable({ data, isMatching, matchProgress, onItemClick }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-indigo-900">
            자동 매칭 결과 ({data.length}건)
          </h2>
          {!isMatching && (
            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full font-bold">
              수정하려면 클릭하세요
            </span>
          )}
        </div>
        
        {isMatching && (
          <div className="w-full bg-indigo-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${matchProgress}%` }}></div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-16">상태</th>
              <th className="px-4 py-3 w-1/3">입력된 원본 데이터</th>
              <th className="px-4 py-3">매칭된 정보 (미리보기)</th>
              <th className="px-4 py-3 w-24 text-center">선택 날짜</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                onClick={() => !isMatching && onItemClick(index)} 
                className={`border-b transition ${isMatching ? 'opacity-70' : 'hover:bg-indigo-50 cursor-pointer'}`}
              >
                <td className="px-4 py-3">
                  {item.matchStatus === 'loading' && <span className="inline-block bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold border border-gray-200 animate-pulse">WAIT</span>}
                  {item.matchStatus === 'db' && <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">DB</span>}
                  {item.matchStatus === 'api' && <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">API</span>}
                  {item.matchStatus === 'failed' && <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">FAIL</span>}
                </td>
                
                <td className="px-4 py-3 text-gray-500">
                  <div className="font-semibold">{item.original[1]}</div>
                  <div className="text-xs">{item.original[0]}</div>
                </td>
                
                <td className="px-4 py-3">
                  {item.matchStatus === 'loading' ? (
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ) : item.matchedItem ? (
                    <div className="flex items-center gap-3">
                      {item.matchedItem.img_dir ? (
                        <img src={item.matchedItem.img_dir} alt="thumbnail" className="w-10 h-10 object-cover rounded shadow-sm border" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{item.matchedItem.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-1">{item.matchedItem.creator}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-red-400 font-medium">일치하는 결과 없음</span>
                  )}
                </td>
                
                <td className="px-4 py-3 text-center text-gray-700 font-medium">
                  {item.original[2] || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
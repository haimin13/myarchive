import React from 'react';

interface Props {
  data: string[][];
  config: any;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ParsedTable({ data, config, isOpen, onToggle }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full bg-gray-100 px-4 py-3 flex justify-between items-center hover:bg-gray-200 transition"
      >
        <h2 className="text-lg font-bold text-gray-800">
          파싱 결과 확인 ({data.length}건)
        </h2>
        <span className="text-gray-500">{isOpen ? '▲ 접기' : '▼ 펼치기'}</span>
      </button>
      
      {isOpen && (
        <div className="overflow-x-auto p-4 bg-white">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase border-b border-gray-300">
              <tr>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">{config?.fields?.[0]?.label || '필드1'}</th>
                <th className="py-2 pr-4">{config?.koreanName || '항목'} 제목</th>
                <th className="py-2">발매일</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium text-gray-900">{rowIndex + 1}</td>
                  <td className="py-2">{row[0]}</td>
                  <td className="py-2">{row[1]}</td>
                  <td className="py-2">{row[2] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
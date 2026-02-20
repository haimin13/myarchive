import React from 'react';

interface Props {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  textInput: string;
  onTextInputChange: (val: string) => void;
  onParse: () => void;
  onMatch: () => void;
  isParseDisabled: boolean;
  isMatchDisabled: boolean;
  isMatching: boolean;
  matchProgress: number;
}

export default function BulkInputForm({
  file, onFileChange, textInput, onTextInputChange, 
  onParse, onMatch, isParseDisabled, isMatchDisabled, isMatching, matchProgress
}: Props) {
  return (
    <div className="flex flex-col gap-4 mb-6 border-b pb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">1. CSV 파일 업로드</label>
          <input
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button 
          onClick={onParse} 
          disabled={isParseDisabled}
          className="px-8 py-3 mt-5 sm:mt-0 rounded-lg font-bold transition shrink-0 shadow-sm text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none bg-blue-600 hover:bg-blue-700"
        >
          파싱!
        </button>
        <button
          onClick={onMatch}
          disabled={isMatchDisabled} 
          className="px-8 py-3 mt-5 sm:mt-0 rounded-lg font-bold transition shrink-0 shadow-sm text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none bg-indigo-600 hover:bg-indigo-700"
        >
          {isMatching ? `매칭 중... (${matchProgress}%)` : '매칭!'}
        </button>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          2. 또는 텍스트 직접 입력 <span className="text-gray-400 font-normal">(파일이 선택되면 비활성화됩니다)</span>
        </label>
        <textarea
          value={textInput}
          onChange={(e) => onTextInputChange(e.target.value)}
          disabled={!!file} 
          placeholder={file ? "파일이 선택되어 텍스트 입력이 비활성화되었습니다." : `아티스트명; 앨범명; 2024-01-01\n아티스트명2; 앨범명2; 2024-01-02`}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm text-gray-900 placeholder-gray-400"
        />
      </div>
    </div>
  );
}
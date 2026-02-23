// 위치: /components/item/ItemForm.tsx
import React from 'react';
import InputField from '@/components/InputField';

interface Props {
  config: any;
  formData: any;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText?: string; // '수정 완료'인지 '추가'인지 부모가 정하게 함
}

export default function ItemForm({ 
  config, formData, onChange, onSubmit, onCancel, submitText = "저장" 
}: Props) {
  const allFields = config ? [
    { name: 'title', label: '제목', required: true },
    ...config.fields,
    { name: 'img_dir', label: '이미지 주소 (URL)', placeholder: 'https://...' }
  ] : [];

  

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-6 text-gray-800">
        {config.koreanName} {submitText === '수정 완료' ? '수정하기 ✏️' : '추가하기 ➕'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          {formData.img_dir && (
            <div className="mb-4 text-center">
              <img 
                src={formData.img_dir} 
                alt="미리보기" 
                className="h-32 object-contain mx-auto rounded border"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>
        
        {allFields.map((field: any) => (
          <InputField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={onChange}
            isReadOnly={false} 
          />
        ))}

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel} // 🚀 핵심: 내가 직접 뒤로 안 가고, 부모가 준 onCancel 실행!
            className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}
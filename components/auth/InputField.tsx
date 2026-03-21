// 반복되는 디자인을 한방에 해결해주는 컴포넌트
import { getLocalDateString } from '@/lib/utility';
import { FieldConfig } from '@/types';

export default function InputField({ field, value, onChange, isReadOnly }: { field: FieldConfig, value: any, onChange: any, isReadOnly?: boolean }) {
  const isDate = field.type === 'date';
  const inputType = field.type === 'image' ? 'text' : field.type;

  return (
    <div>
      {field.type === 'image' && value && (
        <div className="mb-4 text-center">
          <img
            src={value}
            alt="미리보기"
            className="h-32 object-contain mx-auto rounded border"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={inputType}
        value={isDate && value ? getLocalDateString(value) : (value || '')}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder || ''}
        required={field.required}
        readOnly={isReadOnly}
        className={`
          w-full p-3 border rounded-lg outline-none
          ${isReadOnly
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400'
          }
        `}
      />
    </div>
  );
};
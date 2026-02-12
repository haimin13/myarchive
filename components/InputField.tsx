// 반복되는 디자인을 한방에 해결해주는 컴포넌트
export default function InputField ({ field, value, onChange, isReadOnly }: any) {
  // 1. 날짜 필드인지 확인
  const isDate = field.name === 'release_date' || field.name === 'selected_date';
  
  // 2. 입력창 타입 결정
  const inputType = isDate ? 'date' : (field.type || 'text');

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder || ''}
        required={field.required}
        readOnly={isReadOnly}
        // ✨ 스타일 로직 한 곳으로 통합!
        className={`
          w-full p-3 border rounded-lg outline-none
          ${isReadOnly 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'focus:ring-2 focus:ring-blue-500 bg-white'
          }
        `}
      />
    </div>
  );
};
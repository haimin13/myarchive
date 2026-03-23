import React from 'react';
import InputField from '@/components/auth/InputField';
import Button from '@/components/common/Button';
import { getLocalDateString } from '@/lib/utility';

interface Props {
  config: any;
  formData: any;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText?: string;
  isAdding?: boolean;
  isLoading?: boolean;
}

export default function ItemForm({
  config, formData, onChange, onSubmit, onCancel, submitText = "저장", isAdding = false, isLoading = false
}: Props) {
  const fieldsToRender = config?.fields 
    ? (isAdding ? config.fields : config.fields.filter((f: any) => f.name !== 'selected_date'))
    : [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-gray-800">
        {config.koreanName} {submitText === '수정 완료' ? '수정하기 ✏️' : '추가하기 ➕'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {fieldsToRender.map((field: any) => (
          <InputField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={onChange}
            isReadOnly={false}
          />
        ))}

        <div className="flex gap-2 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            {submitText}
          </Button>
        </div>
      </form>
    </div>
  );
}
import Button from '@/components/common/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BaseModal({
  isOpen, onClose, title="title", children
}: Props) {
  if (!isOpen) return null;
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  return (
    // 1. 반투명 배경
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      // onClick={handleBackdropClick}
    >
      {/* 모달 컨텐츠 박스*/}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-xl px-2">
            ✕
          </Button>
        </div>
        {/* children 들어가는 곳 */}
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
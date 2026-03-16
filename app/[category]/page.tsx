// app/[category]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import ListHeader from '@/components/list/ListHeader';
import { ItemListView, ItemGridView } from '@/components/list/ItemViews';
import BaseModal from '@/components/item/BaseModal';
import ItemDetail from '@/components/item/ItemDetail';
import ItemForm from '@/components/item/ItemForm';
import ItemSearch from '@/components/item/ItemSearch';
import { getLocalDateString } from '@/lib/simple';

export default function ListPage() {
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState<'search' | 'form'>('search');
  
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  
  const initialFormData = {
    title: '',
    img_dir: '',
    creator: '',
    selected_date: getLocalDateString(new Date())
  };
  const [formData, setFormData] = useState<any>(initialFormData);
  const [addItemId, setAddItemId] = useState<number | null>(null);
  
  const router = useRouter();

  // ✨ 1. 뷰 모드 상태 추가 ('list' 또는 'grid')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!storedUser) {
      alert('로그인이 필요합니다!');
      router.push('/login');
    } else {
      setUserId(JSON.parse(storedUser).id);
    }
  }, [router]);

  const fetchData = (currentUserId: string, searchQuery: string = '') => {
    setLoading(true);
    let url = `/api/${category}?userId=${currentUserId}`;

    if (searchQuery) {
      url += `&q=${searchQuery}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/${category}/${selectedItem.id}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        setDetailModalOpen(false);
        fetchData(userId!);
    } else {
        alert('삭제 실패');
    }
  };

  const handleDateUpdate = async () => {
    if (!tempDate || !selectedItem) return;
    const res = await fetch(`/api/${category}/${selectedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_date: tempDate }),
    });

    if (res.ok) {
      setSelectedItem((prev: any) => ({ ...prev, selected_date: tempDate }));
      setIsEditingDate(false);
      fetchData(userId!);
      alert('날짜가 변경되었습니다.');
    } else {
      alert('날짜 수정 실패');
    }
  };

  const handleEditClick = () => {
    if (!selectedItem) return;
    setFormData({
      ...selectedItem,
    });
    setEditModalOpen(true);
  };

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev: any) => ({...prev, [name]: value}));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const res = await fetch(`/api/${category}/${selectedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setEditModalOpen(false);
      fetchData(userId!);
      alert('수정되었습니다.');
    } else {
      alert('수정 실패');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const res = await fetch(`/api/${category}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...formData,
          user_id: userId,
          item_id: addItemId
        }),
      });

      if (res.ok) {
        setAddModalOpen(false);
        fetchData(userId!);
        alert(`${config.koreanName} 저장 완료!`);
      } else {
        alert('저장 실패;');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      fetchData(userId, keyword);
    }
  };
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsEditingDate(false);
    setTempDate('');
    setFormData(initialFormData);
    setSelectedItem(null);
    setDetailModalOpen(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    setFormData(initialFormData);
    setAddStep('search');
    setAddItemId(null);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setFormData(initialFormData);
  };

  const handleAddSelect = (item: any) => {
    const newFormData: any = {
      ...formData,
      title: item.title,
      creator: item.creator,
      img_dir: item.img_dir || '',
    };

    config.fields.forEach((field: any) => {
      const dbValue = item[field.name];
      if (dbValue) {
        if (field.name === 'release_date') {
          newFormData[field.name] = getLocalDateString(dbValue);
        } else {
          newFormData[field.name] = dbValue;
        }
      }
    });

    setFormData(newFormData);
    setAddItemId(item.id || null);
    setAddStep('form');
  };

  const handleDirectEntry = () => {
    setFormData(initialFormData);
    setAddItemId(null);
    setAddStep('form');
  };

  useEffect(() => {
    if (config && userId) {
      fetchData(userId);
    }
  }, [category, config, userId]);
  
  if (!config) return <div>잘못된 접근</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <ListHeader 
         category={category}
         koreanName={config.koreanName}
         keyword={keyword}
         setKeyword={setKeyword}
         onSearch={handleSearch}
         viewMode={viewMode}
         setViewMode={setViewMode}
         onAddClick={openAddModal}
       />

       <div className="p-4">
         {loading ? (
           <div className="text-center py-10 text-gray-500">로딩 중...</div>
         ) : items.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             아직 수집한 아이템이 없습니다.<br/>
             우측 상단 버튼을 눌러 추가해보세요!
           </div>
         ) : (
           <>
             {viewMode === 'list' && <ItemListView items={items} category={category} onItemClick={handleItemClick} />}
             {viewMode === 'grid' && <ItemGridView items={items} category={category} onItemClick={handleItemClick} />}
           </>
         )}
       </div>
       <BaseModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="상세 보기"
       >
        {selectedItem &&
          <ItemDetail
            item={selectedItem}
            config={config}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            isEditingDate={isEditingDate}
            tempDate={tempDate}
            onTempDateChange={setTempDate}
            onDateEditStart={() => {
              setTempDate(getLocalDateString(selectedItem.selected_date));
              setIsEditingDate(true);
            }}
            onDateEditCancel={() => setIsEditingDate(false)}
            onDateSubmit={handleDateUpdate}
          />
        }
       </BaseModal>
       <BaseModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="수정하기"
       >
        {selectedItem && <ItemForm
          formData={formData}
          config={config}
          onChange={handleFormChange}
          onSubmit={handleEditSubmit}
          onCancel={closeEditModal}
          submitText="수정 완료"
         />}
       </BaseModal>
       <BaseModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={addStep === 'search' ? `${config.koreanName} 검색 🔎` : `${config.koreanName} 추가 ➕`}
       >
         {addStep === 'search' ? (
           <div>
             <div className="flex justify-end mb-4">
               <button
                 onClick={() => router.push(`/${category}/add/bulk`)}
                 className="flex items-center gap-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-bold transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 일괄 등록
               </button>
             </div>
             <ItemSearch 
               config={config} 
               onSelect={handleAddSelect} 
             />
             <div className="border-t pt-4 text-center mt-4">
              <p className="text-sm text-gray-500 mb-2">원하는 결과가 없나요?</p>
              <button 
                onClick={handleDirectEntry}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
              >
                + 직접 입력해서 추가하기
              </button>
            </div>
           </div>
         ) : (
           <div className="p-4">
             <ItemForm
               formData={formData}
               config={config}
               onChange={handleFormChange}
               onSubmit={handleAddSubmit}
               onCancel={() => setAddStep('search')}
               submitText="추가 완료"
               isAdding={true}
             />
           </div>
         )}
       </BaseModal>
    </div>
  );
}
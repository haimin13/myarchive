"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORY_CONFIG } from '@/app/constants';
import ListHeader from '@/components/list/ListHeader';
import { ItemListView, ItemGridView } from '@/components/list/ItemViews';
import BaseModal from '@/components/item/BaseModal';
import ItemDetail from '@/components/item/ItemDetail';
import ItemForm from '@/components/item/ItemForm';
import ItemSearch from '@/components/item/ItemSearch';
import { getLocalDateString, createInitialFormData } from '@/lib/utility';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

export default function ListPage() {
  const params = useParams();
  const category = params.category as string;
  const config = CATEGORY_CONFIG[category];
  const { user, isLoading: isAuthLoading } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState<'search' | 'form'>('search');

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');

  const initialFormData = config ? createInitialFormData(config.fields) : {};
  const [formData, setFormData] = useState<any>(initialFormData);
  const [addItemId, setAddItemId] = useState<number | null>(null);

  const router = useRouter();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      alert('로그인이 필요합니다!');
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const fetchData = (currentUserId: string | number, searchQuery: string = '') => {
    setLoading(true);
    let url = `/api/selections?category=${category}&userId=${currentUserId}`;

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
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/selections?category=${category}&id=${selectedItem.selection_id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDetailModalOpen(false);
        fetchData(userId!);
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateUpdate = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // 인라인 수정 중이면 tempDate를, 모달 수정 중이면 formData.selected_date를 사용합니다.
    const dateToUse = isEditingDate ? tempDate : formData.selected_date;

    if (!dateToUse || !selectedItem) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/selections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category,
          selection_id: selectedItem.selection_id,
          selected_date: dateToUse
        }),
      });

      if (res.ok) {
        setSelectedItem((prev: any) => ({ ...prev, selected_date: dateToUse }));
        setIsEditingDate(false);
        fetchData(userId!);
      } else {
        alert('저장 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
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
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);

    // 마스터 정보 수정 시에는 개인 속성 제외
    const { selected_date, user_id, selection_id, id: ignoreId, ...onlyMasterData } = formData;

    try {
      const res = await fetch(`/api/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category,
          item_id: selectedItem.id, // Master ID
          selection_id: selectedItem.selection_id,
          ...onlyMasterData
        }),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchData(userId!);
        alert('수정되었습니다.');
      } else {
        alert('수정 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    try {
      let finalItemId = addItemId;

      if (!finalItemId) {
        // Create master item
        const masterRes = await fetch(`/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: category,
            ...formData,
          }),
        });

        if (!masterRes.ok) {
          alert('마스터 정보 생성 실패');
          setIsSubmitting(false);
          return;
        }
        const masterData = await masterRes.json();
        finalItemId = masterData.id;
      }

      // Create selection link
      const res = await fetch(`/api/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category,
          user_id: userId,
          item_id: finalItemId,
          selected_date: formData.selected_date
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
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
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
            아직 수집한 아이템이 없습니다.<br />
            우측 상단 버튼을 눌러 추가해보세요!
          </div>
        ) : (
          <>
            {viewMode === 'list' && <ItemListView items={items} config={config} onItemClick={handleItemClick} />}
            {viewMode === 'grid' && <ItemGridView items={items} config={config} onItemClick={handleItemClick} />}
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
            isLoading={isSubmitting}
          />
        }
      </BaseModal>
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="수정하기"
      >
        {selectedItem && (
          <ItemForm
            fields={config.fields}
            formData={formData}
            config={config}
            onChange={handleFormChange}
            onSubmit={handleEditSubmit}
            onCancel={closeEditModal}
            submitText="정보 수정"
            isLoading={isSubmitting}
          />
        )}
      </BaseModal>
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={addStep === 'search' ? `${config.koreanName} 검색 🔎` : `${config.koreanName} 추가 ➕`}
      >
        {addStep === 'search' ? (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/${category}/bulk`)}
                className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-none shadow-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                일괄 등록
              </Button>
            </div>
            <ItemSearch
              config={config}
              onSelect={handleAddSelect}
            />
            <div className="border-t pt-4 text-center mt-4">
              <p className="text-sm text-gray-500 mb-2">원하는 결과가 없나요?</p>
              <Button
                variant="ghost"
                onClick={handleDirectEntry}
                className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                + 직접 입력해서 추가하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ItemForm
              fields={[...config.fields, ...config.selectionFields]}
              formData={formData}
              config={config}
              onChange={handleFormChange}
              onSubmit={handleAddSubmit}
              onCancel={() => setAddStep('search')}
              submitText="추가 완료"
              isLoading={isSubmitting}
            />
          </div>
        )}
      </BaseModal>
    </div>
  );
}
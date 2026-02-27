import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { emoticonService } from '../../services/emoticonService';
import { fileService } from '../../services/fileService';
import type { EmoticonResponse, CreateEmoticonRequest } from '../../services/emoticonService';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Tabs } from '../../components/common/Tabs';
import type { ColumnDef } from '../../components/common/DataTable';

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'inactive', label: '비활성' },
];

const EMPTY_FORM: CreateEmoticonRequest = {
  name: '',
  packId: 0,
  imageUrl: '',
  sortOrder: 0,
};

export default function EmoticonManagementPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEmoticon, setEditingEmoticon] = useState<EmoticonResponse | null>(null);
  const [form, setForm] = useState<CreateEmoticonRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: emoticons = [], isLoading } = useQuery({
    queryKey: ['emoticons'],
    queryFn: emoticonService.getAll,
  });

  const { data: packs = [] } = useQuery({
    queryKey: ['emoticon-packs'],
    queryFn: emoticonService.getPacks,
  });

  const filteredEmoticons = emoticons.filter((e) => {
    if (activeFilter === 'active') return e.isActive;
    if (activeFilter === 'inactive') return !e.isActive;
    return true;
  });

  const openCreateForm = () => {
    setEditingEmoticon(null);
    setForm({ ...EMPTY_FORM, packId: packs[0]?.id ?? 0 });
    setShowForm(true);
  };

  const openEditForm = (emoticon: EmoticonResponse) => {
    setEditingEmoticon(emoticon);
    setForm({
      name: emoticon.name,
      packId: emoticon.packId,
      imageUrl: emoticon.imageUrl,
      sortOrder: emoticon.sortOrder,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEmoticon(null);
    setForm(EMPTY_FORM);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    setUploading(true);
    try {
      const result = await fileService.uploadFile(file);
      setForm({ ...form, imageUrl: result.url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!form.imageUrl.trim()) {
      alert('이미지 URL을 입력해주세요.');
      return;
    }
    if (!form.packId) {
      alert('팩을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingEmoticon) {
        await emoticonService.update(editingEmoticon.id, form);
      } else {
        await emoticonService.create(form);
      }
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['emoticons'] });
    } catch (error) {
      console.error('Failed to save emoticon:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 이모티콘을 삭제하시겠습니까?`)) return;
    try {
      await emoticonService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['emoticons'] });
    } catch (error) {
      console.error('Failed to delete emoticon:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id: number, name: string, currentActive: boolean) => {
    const msg = currentActive ? '비활성화하시겠습니까?' : '활성화하시겠습니까?';
    if (!confirm(`"${name}" 이모티콘을 ${msg}`)) return;
    try {
      await emoticonService.toggleActive(id);
      queryClient.invalidateQueries({ queryKey: ['emoticons'] });
    } catch (error) {
      console.error('Failed to toggle emoticon status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const columns: ColumnDef<EmoticonResponse>[] = [
    {
      key: 'imageUrl',
      header: '이미지',
      width: '80px',
      align: 'center',
      render: (value, row) => (
        <img
          src={value}
          alt={row.name}
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', margin: '0 auto' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      ),
    },
    {
      key: 'name',
      header: '이름',
      className: 'font-medium',
    },
    {
      key: 'category',
      header: '팩 (카테고리)',
      render: (value) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: '정렬 순서',
      align: 'center',
    },
    {
      key: 'isActive',
      header: '상태',
      align: 'center',
      render: (value, row) => (
        <button
          type="button"
          className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${value ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          onClick={() => handleToggleActive(row.id, row.name, value)}
          title="클릭하여 상태 변경"
        >
          {value ? '활성' : '비활성'}
        </button>
      ),
    },
    {
      key: 'id',
      header: '액션',
      align: 'right',
      render: (_value, row) => (
        <div className="flex gap-3 justify-end">
          <Button variant="link" size="sm" onClick={() => openEditForm(row)}>수정</Button>
          <Button
            variant="link"
            size="sm"
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDelete(row.id, row.name)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">이모티콘 관리</h1>
        <Button variant="primary" onClick={openCreateForm}>+ 이모티콘 추가</Button>
      </div>

      <Tabs tabs={FILTER_TABS} activeTab={activeFilter} onTabChange={setActiveFilter} />

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingEmoticon ? '이모티콘 수정' : '새 이모티콘 추가'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="이모티콘 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팩 *</label>
              <select
                value={form.packId}
                onChange={(e) => setForm({ ...form, packId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={0} disabled>팩을 선택하세요</option>
                {packs.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지 *</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <label className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {uploading ? '업로드 중...' : '이미지 업로드'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-400 self-center">또는 URL 직접 입력</span>
                  </div>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="https://..."
                  />
                </div>
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="미리보기"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              {editingEmoticon ? '수정' : '생성'}
            </Button>
            <Button variant="secondary" onClick={closeForm}>취소</Button>
          </div>
        </div>
      )}

      {/* Emoticon table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <DataTable<EmoticonResponse>
          columns={columns}
          data={filteredEmoticons}
          loading={isLoading}
          emptyMessage="이모티콘이 없습니다."
        />
      </div>
    </div>
  );
}

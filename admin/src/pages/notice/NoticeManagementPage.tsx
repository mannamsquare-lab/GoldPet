import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { noticeService } from '../../services/noticeService';
import type { AppNoticeResponse, CreateAppNoticeRequest } from '../../services/noticeService';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Tabs } from '../../components/common/Tabs';
import type { ColumnDef } from '../../components/common/DataTable';

const TYPE_LABELS: Record<string, string> = {
  POPUP_MODAL: '팝업 모달',
  MAINTENANCE: '점검 공지',
  EVENT_BANNER: '이벤트 배너',
};

const SCREEN_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'HOME', label: '홈' },
  { value: 'WALK', label: '산책' },
  { value: 'COMMUNITY', label: '커뮤니티' },
];

const EMPTY_FORM: CreateAppNoticeRequest = {
  type: 'POPUP_MODAL',
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  targetScreen: 'ALL',
  priority: 0,
  isDismissible: true,
  startAt: '',
  endAt: '',
};

const FILTER_TABS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'inactive', label: '비활성' },
];

function formatDateTime(dt: string) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function NoticeManagementPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<AppNoticeResponse | null>(null);
  const [form, setForm] = useState<CreateAppNoticeRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: noticeService.getAllNotices,
  });

  const filteredNotices = notices.filter((n) => {
    if (activeFilter === 'active') return n.isActive;
    if (activeFilter === 'inactive') return !n.isActive;
    return true;
  });

  const openCreateForm = () => {
    setEditingNotice(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (notice: AppNoticeResponse) => {
    setEditingNotice(notice);
    setForm({
      type: notice.type,
      title: notice.title,
      content: notice.content || '',
      imageUrl: notice.imageUrl || '',
      linkUrl: notice.linkUrl || '',
      targetScreen: notice.targetScreen || 'ALL',
      priority: notice.priority,
      isDismissible: notice.isDismissible,
      startAt: notice.startAt ? notice.startAt.slice(0, 16) : '',
      endAt: notice.endAt ? notice.endAt.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNotice(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!form.startAt) {
      alert('시작일시를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateAppNoticeRequest = {
        ...form,
        content: form.content || undefined,
        imageUrl: form.imageUrl || undefined,
        linkUrl: form.linkUrl || undefined,
        endAt: form.endAt || undefined,
      };
      if (editingNotice) {
        await noticeService.updateNotice(editingNotice.id, payload);
      } else {
        await noticeService.createNotice(payload);
      }
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await noticeService.deleteNotice(id);
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      POPUP_MODAL: 'bg-purple-100 text-purple-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800',
      EVENT_BANNER: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {TYPE_LABELS[type] || type}
      </span>
    );
  };

  const columns: ColumnDef<AppNoticeResponse>[] = [
    {
      key: 'type',
      header: '유형',
      render: (value) => getTypeBadge(value),
    },
    {
      key: 'title',
      header: '제목',
      className: 'font-medium max-w-xs truncate',
    },
    {
      key: 'targetScreen',
      header: '대상',
      render: (value) => SCREEN_OPTIONS.find((o) => o.value === value)?.label || value || '-',
    },
    {
      key: 'priority',
      header: '우선순위',
      align: 'center',
    },
    {
      key: 'isActive',
      header: '상태',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'startAt',
      header: '시작일시',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'endAt',
      header: '종료일시',
      render: (value) => (value ? formatDateTime(value) : '-'),
    },
    {
      key: 'id',
      header: '액션',
      align: 'right',
      render: (_value, row) => (
        <div className="flex gap-3 justify-end">
          <Button variant="link" size="sm" onClick={() => openEditForm(row)}>수정</Button>
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-900" onClick={() => handleDelete(row.id)}>삭제</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지/팝업 관리</h1>
        <Button variant="primary" onClick={openCreateForm}>+ 공지 추가</Button>
      </div>

      <Tabs tabs={FILTER_TABS} activeTab={activeFilter} onTabChange={setActiveFilter} />

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingNotice ? '공지 수정' : '새 공지 추가'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="POPUP_MODAL">팝업 모달</option>
                <option value="MAINTENANCE">점검 공지</option>
                <option value="EVENT_BANNER">이벤트 배너</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상 화면</label>
              <select
                value={form.targetScreen}
                onChange={(e) => setForm({ ...form, targetScreen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {SCREEN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="제목을 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="내용을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL</label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isDismissible"
                checked={form.isDismissible}
                onChange={(e) => setForm({ ...form, isDismissible: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isDismissible" className="text-sm font-medium text-gray-700">
                오늘 하루 보지 않기 허용
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일시 *</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일시 (선택)</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              {editingNotice ? '수정' : '생성'}
            </Button>
            <Button variant="secondary" onClick={closeForm}>취소</Button>
          </div>
        </div>
      )}

      {/* Notice table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <DataTable<AppNoticeResponse>
          columns={columns}
          data={filteredNotices}
          loading={isLoading}
          emptyMessage="공지가 없습니다."
        />
      </div>
    </div>
  );
}

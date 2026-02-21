import { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import type { AppNoticeResponse, CreateAppNoticeRequest } from '../../services/noticeService';

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

function formatDateTime(dt: string) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function NoticeManagementPage() {
  const [notices, setNotices] = useState<AppNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<AppNoticeResponse | null>(null);
  const [form, setForm] = useState<CreateAppNoticeRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getAllNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to load notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

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
      loadNotices();
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
      loadNotices();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">공지/팝업 관리</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          + 공지 추가
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b">
        {(['all', 'active', 'inactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 font-medium text-sm ${
              activeFilter === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500'
            }`}
          >
            {tab === 'all' ? '전체' : tab === 'active' ? '활성' : '비활성'}
          </button>
        ))}
      </div>

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
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? '저장 중...' : editingNotice ? '수정' : '생성'}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Notice table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">공지가 없습니다.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">우선순위</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시작일시</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">종료일시</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">{getTypeBadge(notice.type)}</td>
                  <td className="px-4 py-4 font-medium text-sm max-w-xs truncate">{notice.title}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {SCREEN_OPTIONS.find((o) => o.value === notice.targetScreen)?.label || notice.targetScreen || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">{notice.priority}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${notice.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {notice.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(notice.startAt)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{notice.endAt ? formatDateTime(notice.endAt) : '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditForm(notice)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

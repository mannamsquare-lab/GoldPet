import { useState, useEffect, useRef } from 'react';
import { gamificationService } from '../../services/gamificationService';
import { fileService } from '../../services/fileService';
import type { Badge } from '../../services/gamificationService';

const CONDITION_TYPE_LABELS: Record<string, string> = {
  PET_REGISTER: '반려동물 등록',
  WALK_COUNT: '산책 횟수',
  WALK_DISTANCE_TOTAL: '총 산책 거리(km)',
  COMMUNITY_POST: '게시글 작성',
  COMMUNITY_COMMENT: '댓글 작성',
  CHECK_IN: '체크인',
  FRIEND_MATCH: '친구 매칭',
};

const CONDITION_TYPES = Object.keys(CONDITION_TYPE_LABELS);

const REPEAT_CYCLES = [
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKLY', label: '매주' },
  { value: 'MONTHLY', label: '매월' },
];

interface BadgeFormData {
  name: string;
  description: string;
  imageUrl: string;
  conditionType: string;
  conditionValue: string;
  rewardGold: string;
  startDate: string;
  endDate: string;
  isRepeatable: boolean;
  repeatCycle: string;
  isActive: boolean;
}

const emptyForm: BadgeFormData = {
  name: '',
  description: '',
  imageUrl: '',
  conditionType: '',
  conditionValue: '',
  rewardGold: '',
  startDate: '',
  endDate: '',
  isRepeatable: false,
  repeatCycle: '',
  isActive: true,
};

export default function GamificationPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [form, setForm] = useState<BadgeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await gamificationService.getBadges();
      setBadges(data);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBadge(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (badge: Badge) => {
    setEditingBadge(badge);
    setForm({
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl || '',
      conditionType: badge.conditionType || '',
      conditionValue: badge.conditionValue?.toString() || '',
      rewardGold: badge.rewardGold?.toString() || '',
      startDate: badge.startDate || '',
      endDate: badge.endDate || '',
      isRepeatable: badge.isRepeatable,
      repeatCycle: badge.repeatCycle || '',
      isActive: badge.isActive,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        conditionType: form.conditionType || undefined,
        conditionValue: form.conditionValue ? parseInt(form.conditionValue) : undefined,
        rewardGold: form.rewardGold ? parseInt(form.rewardGold) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isRepeatable: form.isRepeatable || undefined,
        repeatCycle: form.isRepeatable ? form.repeatCycle || undefined : undefined,
      };

      if (editingBadge) {
        await gamificationService.updateBadge(editingBadge.id, {
          ...payload,
          isActive: form.isActive,
        });
      } else {
        await gamificationService.createBadge(payload as Parameters<typeof gamificationService.createBadge>[0]);
      }
      setShowModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save badge:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getMissionTypeLabel = (badge: Badge) => {
    if (badge.isRepeatable && badge.startDate) return '기간+반복';
    if (badge.isRepeatable) return '반복';
    if (badge.startDate) return '기간 한정';
    return '상시';
  };

  const getMissionTypeColor = (badge: Badge) => {
    if (badge.isRepeatable) return 'bg-purple-100 text-purple-700';
    if (badge.startDate) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">뱃지 미션 관리</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">뱃지 목록 ({badges.length})</h2>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              + 뱃지 추가
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이미지</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">미션 조건</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">유형</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">보상</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">획득자</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {badges.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">등록된 뱃지가 없습니다.</td></tr>
                ) : (
                  badges.map((badge) => (
                    <tr key={badge.id} className={`hover:bg-gray-50 ${!badge.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 text-sm text-gray-400">{badge.id}</td>
                      <td className="px-4 py-3">
                        {badge.imageUrl ? (
                          <img src={badge.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">🏅</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{badge.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {badge.conditionType ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {CONDITION_TYPE_LABELS[badge.conditionType] || badge.conditionType}
                            </span>
                            <span className="text-gray-600">{badge.conditionValue}회</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMissionTypeColor(badge)}`}>
                          {getMissionTypeLabel(badge)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {badge.rewardGold ? <span className="text-amber-600 font-medium">{badge.rewardGold}G</span> : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {badge.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{badge.earnedCount.toLocaleString()}명</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEditModal(badge)}
                          className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Badge Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{editingBadge ? '뱃지 수정' : '뱃지 추가'}</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">뱃지 이미지</label>
                <div className="flex items-center gap-4">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="뱃지" className="w-16 h-16 rounded-lg object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl border">🏅</div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </button>
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="ml-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="뱃지 이름"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="뱃지 설명"
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Mission Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">미션 조건 유형</label>
                  <select
                    value={form.conditionType}
                    onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">선택 안함</option>
                    {CONDITION_TYPES.map((type) => (
                      <option key={type} value={type}>{CONDITION_TYPE_LABELS[type]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">달성 기준값</label>
                  <input
                    type="number"
                    value={form.conditionValue}
                    onChange={(e) => setForm({ ...form, conditionValue: e.target.value })}
                    placeholder="1"
                    min={1}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Reward Gold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">보상 골드</label>
                <input
                  type="number"
                  value={form.rewardGold}
                  onChange={(e) => setForm({ ...form, rewardGold: e.target.value })}
                  placeholder="0 (보상 없음)"
                  min={0}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일 (비워두면 상시)</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Repeatable */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRepeatable"
                    checked={form.isRepeatable}
                    onChange={(e) => setForm({ ...form, isRepeatable: e.target.checked, repeatCycle: e.target.checked ? form.repeatCycle : '' })}
                    className="rounded"
                  />
                  <label htmlFor="isRepeatable" className="text-sm text-gray-700">반복 미션</label>
                </div>
                {form.isRepeatable && (
                  <select
                    value={form.repeatCycle}
                    onChange={(e) => setForm({ ...form, repeatCycle: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">주기 선택</option>
                    {REPEAT_CYCLES.map((cycle) => (
                      <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Active toggle (edit only) */}
              {editingBadge && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">활성 상태</label>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.description}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

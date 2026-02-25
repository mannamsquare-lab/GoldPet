import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../../services/gamificationService';
import { fileService } from '../../services/fileService';
import type { Badge } from '../../services/gamificationService';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';

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

export default function GamificationPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [form, setForm] = useState<BadgeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => gamificationService.getBadges(),
  });

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
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    } catch (error) {
      console.error('Failed to save badge:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<Badge>[] = [
    { key: 'id', header: 'ID', width: '60px', render: (value) => <span className="text-gray-400">{value}</span> },
    {
      key: 'imageUrl',
      header: '이미지',
      width: '60px',
      render: (value) => value ? (
        <img src={value} alt="" className="w-8 h-8 rounded object-cover" />
      ) : (
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">🏅</div>
      ),
    },
    {
      key: 'name',
      header: '이름',
      render: (value, row) => (
        <div>
          <div className="font-medium text-sm">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'conditionType',
      header: '미션 조건',
      render: (value, row) => value ? (
        <span className="inline-flex items-center gap-1">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {CONDITION_TYPE_LABELS[value] || value}
          </span>
          <span className="text-gray-600">{row.conditionValue}회</span>
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'isRepeatable',
      header: '유형',
      align: 'center',
      render: (_value, row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMissionTypeColor(row)}`}>
          {getMissionTypeLabel(row)}
        </span>
      ),
    },
    {
      key: 'rewardGold',
      header: '보상',
      align: 'right',
      render: (value) => value ? <span className="text-amber-600 font-medium">{value}G</span> : '-',
    },
    {
      key: 'isActive',
      header: '상태',
      align: 'center',
      render: (value) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {value ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'earnedCount',
      header: '획득자',
      align: 'right',
      render: (value) => `${value.toLocaleString()}명`,
    },
    {
      key: 'id',
      header: '관리',
      align: 'center',
      render: (_value, row) => (
        <Button variant="link" size="sm" onClick={() => openEditModal(row)}>수정</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">뱃지 미션 관리</h1>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">뱃지 목록 ({badges.length})</h2>
          <Button variant="primary" onClick={openCreateModal}>+ 뱃지 추가</Button>
        </div>
        <DataTable<Badge>
          columns={columns}
          data={badges}
          loading={isLoading}
          emptyMessage="등록된 뱃지가 없습니다."
          rowClassName={(row) => !row.isActive ? 'opacity-50' : ''}
        />
      </div>

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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </Button>
                    {form.imageUrl && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="ml-2 text-red-600 hover:text-red-800"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                      >
                        삭제
                      </Button>
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>취소</Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !form.name || !form.description}
                loading={saving}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

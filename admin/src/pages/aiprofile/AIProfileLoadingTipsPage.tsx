import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { loadingTipService } from '../../services/loadingTipService';
import type { AILoadingTipResponse, CreateLoadingTipRequest } from '../../services/loadingTipService';

type ActiveFilter = 'all' | 'active' | 'inactive';

export default function AIProfileLoadingTipsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTip, setEditingTip] = useState<AILoadingTipResponse | null>(null);
  const [form, setForm] = useState<CreateLoadingTipRequest>({ content: '', displayOrder: 0 });
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const { data: tips = [], isLoading } = useQuery({
    queryKey: ['loading-tips'],
    queryFn: loadingTipService.getAllTips,
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateLoadingTipRequest) => loadingTipService.createTip(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loading-tips'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: Parameters<typeof loadingTipService.updateTip>[1] }) =>
      loadingTipService.updateTip(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loading-tips'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => loadingTipService.deleteTip(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loading-tips'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingTip(null);
    setForm({ content: '', displayOrder: 0 });
  };

  const handleEdit = (tip: AILoadingTipResponse) => {
    setEditingTip(tip);
    setForm({ content: tip.content, displayOrder: tip.displayOrder });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.content.trim()) return;
    if (editingTip) {
      updateMutation.mutate({ id: editingTip.id, req: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleToggleActive = (tip: AILoadingTipResponse) => {
    updateMutation.mutate({ id: tip.id, req: { isActive: !tip.isActive } });
  };

  const handleDelete = (tip: AILoadingTipResponse) => {
    if (window.confirm(`"${tip.content}" 팁을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(tip.id);
    }
  };

  const filteredTips = tips.filter((t) => {
    if (activeFilter === 'active') return t.isActive;
    if (activeFilter === 'inactive') return !t.isActive;
    return true;
  });

  const columns: ColumnDef<AILoadingTipResponse>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'content', header: '내용' },
    { key: 'displayOrder', header: '순서', width: '80px' },
    {
      key: 'isActive',
      header: '활성화',
      width: '100px',
      render: (_value, tip) => (
        <button
          onClick={() => handleToggleActive(tip)}
          className={`px-2 py-1 text-xs rounded-full ${
            tip.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {tip.isActive ? '활성' : '비활성'}
        </button>
      ),
    },
    {
      key: 'id',
      header: '관리',
      width: '120px',
      render: (_value, tip) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleEdit(tip)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(tip)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const filterTabs: { key: ActiveFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'active', label: '활성' },
    { key: 'inactive', label: '비활성' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI 로딩 팁 관리</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTip(null);
            setForm({ content: '', displayOrder: 0 });
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" />
          팁 추가
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <DataTable<AILoadingTipResponse>
          columns={columns}
          data={filteredTips}
          loading={isLoading}
          emptyMessage="등록된 팁이 없습니다."
        />
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingTip ? '팁 수정' : '새 팁 추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={4}
                  placeholder="로딩 중 표시될 팁 내용을 입력하세요."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">표시 순서</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min={0}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={resetForm}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!form.content.trim() || createMutation.isPending || updateMutation.isPending}
              >
                {editingTip ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

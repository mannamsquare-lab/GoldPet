import { useState, useEffect } from 'react';
import { aiProfileAdminService } from '../../services/aiProfileAdminService';
import type {
  AIRequestAdminResponse,
  AIStyleAdminResponse,
  AIStyleAdminRequest,
  AIProfileStatsResponse,
  PageResponse,
} from '../../services/aiProfileAdminService';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  const labels: Record<string, string> = {
    PENDING: '대기중',
    PROCESSING: '처리중',
    COMPLETED: '완료',
    FAILED: '실패',
    REFUNDED: '환불',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

export default function AIProfilePage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'styles'>('requests');
  const [stats, setStats] = useState<AIProfileStatsResponse | null>(null);
  const [requests, setRequests] = useState<PageResponse<AIRequestAdminResponse> | null>(null);
  const [styles, setStyles] = useState<AIStyleAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState<AIStyleAdminResponse | null>(null);
  const [styleForm, setStyleForm] = useState<AIStyleAdminRequest>({
    id: '',
    name: '',
    description: '',
    previewUrl: '',
    goldCost: 10,
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    } else {
      loadStyles();
    }
  }, [activeTab, currentPage, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await aiProfileAdminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load AI profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await aiProfileAdminService.getRequests(currentPage, 20, statusFilter || undefined);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadStyles = async () => {
    try {
      const data = await aiProfileAdminService.getStyles();
      setStyles(data);
    } catch (error) {
      console.error('Failed to load styles:', error);
    }
  };

  const handleRetry = async (id: number) => {
    if (!confirm('이 요청을 다시 시도하시겠습니까?')) return;
    try {
      await aiProfileAdminService.retryRequest(id);
      loadRequests();
      loadData();
    } catch (error) {
      console.error('Failed to retry request:', error);
      alert('재시도에 실패했습니다.');
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm('이 요청을 환불 처리하시겠습니까?')) return;
    try {
      await aiProfileAdminService.refundRequest(id);
      loadRequests();
      loadData();
    } catch (error) {
      console.error('Failed to refund request:', error);
      alert('환불 처리에 실패했습니다.');
    }
  };

  const handleToggleStyle = async (id: string) => {
    try {
      await aiProfileAdminService.toggleStyle(id);
      loadStyles();
    } catch (error) {
      console.error('Failed to toggle style:', error);
      alert('스타일 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('이 스타일을 삭제하시겠습니까?')) return;
    try {
      await aiProfileAdminService.deleteStyle(id);
      loadStyles();
    } catch (error) {
      console.error('Failed to delete style:', error);
      alert('스타일 삭제에 실패했습니다.');
    }
  };

  const handleOpenAddStyle = () => {
    setEditingStyle(null);
    setStyleForm({ id: '', name: '', description: '', previewUrl: '', goldCost: 10, isActive: true, displayOrder: 0 });
    setShowStyleModal(true);
  };

  const handleOpenEditStyle = (style: AIStyleAdminResponse) => {
    setEditingStyle(style);
    setStyleForm({
      id: style.id,
      name: style.name,
      description: style.description || '',
      previewUrl: style.previewUrl || '',
      goldCost: style.goldCost,
      isActive: style.isActive,
      displayOrder: style.displayOrder,
    });
    setShowStyleModal(true);
  };

  const handleSaveStyle = async () => {
    try {
      if (editingStyle) {
        await aiProfileAdminService.updateStyle(editingStyle.id, styleForm);
      } else {
        await aiProfileAdminService.createStyle(styleForm);
      }
      setShowStyleModal(false);
      loadStyles();
    } catch (error) {
      console.error('Failed to save style:', error);
      alert('스타일 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">AI 프로필 관리</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="총 요청" value={stats?.totalRequests || 0} icon="📸" />
        <StatCard title="대기중" value={stats?.pendingRequests || 0} icon="⏳" />
        <StatCard title="완료" value={stats?.completedRequests || 0} icon="✅" />
        <StatCard title="성공률" value={`${stats?.successRate?.toFixed(1) || 0}%`} icon="📊" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="실패" value={stats?.failedRequests || 0} icon="❌" />
        <StatCard title="환불" value={stats?.refundedRequests || 0} icon="💰" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            요청 관리
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'styles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            스타일 관리
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">AI 프로필 요청 목록</h2>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">전체</option>
              <option value="PENDING">대기중</option>
              <option value="PROCESSING">처리중</option>
              <option value="COMPLETED">완료</option>
              <option value="FAILED">실패</option>
              <option value="REFUNDED">환불</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반려동물</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">스타일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비용(Gold)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일시</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests?.content.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  requests?.content.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.userNickname || `User ${request.userId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.petName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.stylePrompt || request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.goldCost.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {request.status === 'FAILED' && (
                          <>
                            <button
                              onClick={() => handleRetry(request.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              재시도
                            </button>
                            <button
                              onClick={() => handleRefund(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              환불
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {requests && requests.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">
                총 {requests.totalElements.toLocaleString()}건 ({requests.number + 1} / {requests.totalPages} 페이지)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(requests.totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= requests.totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Styles Tab */}
      {activeTab === 'styles' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">AI 스타일 목록</h2>
            <button
              onClick={handleOpenAddStyle}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              + 스타일 추가
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {styles.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8">등록된 스타일이 없습니다.</div>
              ) : (
                styles.map((style) => (
                  <div key={style.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {style.previewUrl && (
                      <img src={style.previewUrl} alt={style.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{style.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          style.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {style.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      {style.description && (
                        <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-500">비용: {style.goldCost.toLocaleString()} Gold</span>
                        <span className="text-gray-500">순서: {style.displayOrder}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStyle(style.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          {style.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleOpenEditStyle(style)}
                          className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteStyle(style.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Create/Edit Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingStyle ? '스타일 수정' : '새 스타일 추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input
                  type="text"
                  value={styleForm.id}
                  onChange={(e) => setStyleForm({ ...styleForm, id: e.target.value })}
                  disabled={!!editingStyle}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                  placeholder="예: cartoon, watercolor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={styleForm.name}
                  onChange={(e) => setStyleForm({ ...styleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="스타일 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={styleForm.description}
                  onChange={(e) => setStyleForm({ ...styleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                  placeholder="스타일 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">미리보기 URL</label>
                <input
                  type="text"
                  value={styleForm.previewUrl}
                  onChange={(e) => setStyleForm({ ...styleForm, previewUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="/styles/example.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비용 (Gold)</label>
                  <input
                    type="number"
                    value={styleForm.goldCost}
                    onChange={(e) => setStyleForm({ ...styleForm, goldCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">표시 순서</label>
                  <input
                    type="number"
                    value={styleForm.displayOrder}
                    onChange={(e) => setStyleForm({ ...styleForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="styleActive"
                  checked={styleForm.isActive}
                  onChange={(e) => setStyleForm({ ...styleForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label htmlFor="styleActive" className="ml-2 text-sm text-gray-700">활성화</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowStyleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveStyle}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                {editingStyle ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

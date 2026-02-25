import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingService } from '../../services/marketingService';
import type { NotificationTemplate, NotificationTemplateRequest, DeliveryLog } from '../../services/marketingService';
import { Tabs } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';

interface Banner {
  id: number;
  title: string;
  imageUrl: string | null;
  link: string | null;
  isActive: boolean;
  displayOrder: number;
}

const TABS = [
  { key: 'templates', label: '푸시 알림' },
  { key: 'delivery-logs', label: '발송 로그' },
  { key: 'banner', label: '배너 관리' },
];

const getCategoryBadge = (category: string) => {
  const styles: Record<string, string> = {
    NOTICE: 'bg-blue-100 text-blue-800',
    EVENT: 'bg-green-100 text-green-800',
    MARKETING: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[category] || 'bg-gray-100 text-gray-800'}`}>
      {category}
    </span>
  );
};

const getTargetTypeBadge = (targetType: string) => {
  const styles: Record<string, string> = {
    ALL: 'bg-indigo-100 text-indigo-800',
    USER: 'bg-gray-100 text-gray-800',
  };
  const labels: Record<string, string> = { ALL: '전체', USER: '특정 사용자' };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[targetType]}`}>
      {labels[targetType] || targetType}
    </span>
  );
};

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<NotificationTemplateRequest>({
    title: '',
    body: '',
    category: 'NOTICE',
  });

  // Send dialog state
  const [sendDialogTemplateId, setSendDialogTemplateId] = useState<number | null>(null);
  const [sendForm, setSendForm] = useState({
    targetType: 'ALL' as 'ALL' | 'USER',
    targetUserIds: '',
  });

  // Template pagination
  const [templatePage, setTemplatePage] = useState(0);
  const [templateSize] = useState(20);

  // Delivery log pagination
  const [logPage, setLogPage] = useState(0);
  const [logSize, setLogSize] = useState(20);

  // Queries
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['marketing-templates'],
    queryFn: () => marketingService.getTemplates(),
    enabled: activeTab === 'templates',
  });

  const { data: deliveryLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['marketing-logs', logPage, logSize],
    queryFn: () => marketingService.getDeliveryLogs(logPage, logSize),
    enabled: activeTab === 'delivery-logs',
  });

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ['marketing-banners'],
    queryFn: () => marketingService.getBanners(),
    enabled: activeTab === 'banner',
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: (req: NotificationTemplateRequest) => marketingService.createTemplate(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-templates'] });
      setShowTemplateForm(false);
      setTemplateForm({ title: '', body: '', category: 'NOTICE' });
    },
    onError: () => alert('템플릿 생성에 실패했습니다.'),
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: NotificationTemplateRequest }) =>
      marketingService.updateTemplate(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-templates'] });
      setEditingTemplate(null);
      setShowTemplateForm(false);
      setTemplateForm({ title: '', body: '', category: 'NOTICE' });
    },
    onError: () => alert('템플릿 수정에 실패했습니다.'),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => marketingService.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-templates'] }),
    onError: () => alert('템플릿 삭제에 실패했습니다.'),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: ({ templateId }: { templateId: number }) => {
      const targetUserIds =
        sendForm.targetType === 'USER' && sendForm.targetUserIds
          ? sendForm.targetUserIds
              .split(',')
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          : null;
      return marketingService.sendNotification({
        templateId,
        title: null,
        body: null,
        targetType: sendForm.targetType,
        targetUserIds,
      });
    },
    onSuccess: (result) => {
      alert(`발송 완료: 성공 ${result.successCount}건, 실패 ${result.failCount}건`);
      setSendDialogTemplateId(null);
      setSendForm({ targetType: 'ALL', targetUserIds: '' });
    },
    onError: () => alert('알림 발송에 실패했습니다.'),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => marketingService.deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-banners'] }),
    onError: () => alert('배너 삭제에 실패했습니다.'),
  });

  // Handlers
  const startEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({ title: template.title, body: template.body, category: template.category });
    setShowTemplateForm(true);
  };

  const cancelTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateForm({ title: '', body: '', category: 'NOTICE' });
  };

  const handleTemplateSubmit = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, req: templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  };

  const handleDeleteTemplate = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    deleteTemplateMutation.mutate(id);
  };

  // Paginated slices for client-side pagination (templates returns array)
  const templateStart = templatePage * templateSize;
  const pagedTemplates = templates.slice(templateStart, templateStart + templateSize);

  // Column defs
  const templateColumns: ColumnDef<NotificationTemplate>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    {
      key: 'body',
      header: '내용',
      render: (_v, row) => (
        <span className="text-gray-500 max-w-xs truncate block">{row.body}</span>
      ),
    },
    { key: 'category', header: '카테고리', render: (_v, row) => getCategoryBadge(row.category) },
    {
      key: 'createdAt',
      header: '생성일',
      render: (_v, row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '액션',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" size="sm" onClick={() => setSendDialogTemplateId(row.id)}>
            발송
          </Button>
          <Button variant="link" size="sm" onClick={() => startEditTemplate(row)}>
            수정
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteTemplate(row.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  const logColumns: ColumnDef<DeliveryLog>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    { key: 'targetType', header: '대상', render: (_v, row) => getTargetTypeBadge(row.targetType) },
    {
      key: 'sentCount',
      header: '발송수',
      align: 'right',
      render: (_v, row) => row.sentCount.toLocaleString(),
    },
    {
      key: 'sentAt',
      header: '발송일시',
      render: (_v, row) => new Date(row.sentAt).toLocaleString(),
    },
  ];

  const bannerColumns: ColumnDef<Banner>[] = [
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    { key: 'link', header: '링크', render: (_v, row) => row.link || '-' },
    { key: 'displayOrder', header: '순서' },
    {
      key: 'isActive',
      header: '상태',
      render: (_v, row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.isActive ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '액션',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" size="sm">
            수정
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-red-600 hover:text-red-900"
            onClick={() => {
              if (confirm('배너를 삭제하시겠습니까?')) deleteBannerMutation.mutate(row.id);
            }}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">마케팅 관리</h1>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">알림 템플릿</h2>
            <Button variant="primary" size="sm" onClick={() => setShowTemplateForm(true)}>
              + 템플릿 추가
            </Button>
          </div>

          {showTemplateForm && (
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium mb-3">{editingTemplate ? '템플릿 수정' : '새 템플릿'}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="NOTICE">NOTICE</option>
                    <option value="EVENT">EVENT</option>
                    <option value="MARKETING">MARKETING</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                    onClick={handleTemplateSubmit}
                  >
                    {editingTemplate ? '수정' : '생성'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={cancelTemplateForm}>
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DataTable
            columns={templateColumns}
            data={pagedTemplates}
            loading={templatesLoading}
            emptyMessage="등록된 템플릿이 없습니다."
          />
          <div className="border-t border-gray-100">
            <Pagination
              page={templatePage}
              totalPages={Math.max(1, Math.ceil(templates.length / templateSize))}
              totalElements={templates.length}
              size={templateSize}
              onPageChange={setTemplatePage}
              onSizeChange={() => {}}
            />
          </div>

          {/* Send dialog */}
          {sendDialogTemplateId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">알림 발송</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">대상</label>
                    <select
                      value={sendForm.targetType}
                      onChange={(e) =>
                        setSendForm({ ...sendForm, targetType: e.target.value as 'ALL' | 'USER' })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="ALL">전체</option>
                      <option value="USER">특정 사용자</option>
                    </select>
                  </div>
                  {sendForm.targetType === 'USER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        사용자 ID (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={sendForm.targetUserIds}
                        onChange={(e) => setSendForm({ ...sendForm, targetUserIds: e.target.value })}
                        placeholder="예: 1, 2, 3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="flex-1"
                      loading={sendNotificationMutation.isPending}
                      onClick={() =>
                        sendNotificationMutation.mutate({ templateId: sendDialogTemplateId })
                      }
                    >
                      발송
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setSendDialogTemplateId(null);
                        setSendForm({ targetType: 'ALL', targetUserIds: '' });
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Logs Tab */}
      {activeTab === 'delivery-logs' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">발송 로그</h2>
          </div>
          <DataTable
            columns={logColumns}
            data={deliveryLogs}
            loading={logsLoading}
            emptyMessage="발송 로그가 없습니다."
          />
          <div className="border-t border-gray-100">
            <Pagination
              page={logPage}
              totalPages={Math.max(1, Math.ceil(deliveryLogs.length / logSize))}
              totalElements={deliveryLogs.length}
              size={logSize}
              onPageChange={setLogPage}
              onSizeChange={setLogSize}
            />
          </div>
        </div>
      )}

      {/* Banner Tab */}
      {activeTab === 'banner' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">배너 목록</h2>
            <Button variant="primary" size="sm">
              + 배너 추가
            </Button>
          </div>
          <DataTable
            columns={bannerColumns}
            data={banners}
            loading={bannersLoading}
            emptyMessage="등록된 배너가 없습니다."
          />
        </div>
      )}
    </div>
  );
}

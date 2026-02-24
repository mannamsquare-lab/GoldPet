import { useState, useEffect } from 'react';
import { marketingService } from '../../services/marketingService';
import type { NotificationTemplate, NotificationTemplateRequest, DeliveryLog } from '../../services/marketingService';

interface Banner {
  id: number;
  title: string;
  imageUrl: string | null;
  link: string | null;
  isActive: boolean;
  displayOrder: number;
}

export default function MarketingPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'banner' | 'templates' | 'delivery-logs'>('templates');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<NotificationTemplateRequest>({
    title: '',
    body: '',
    category: 'NOTICE'
  });
  const [sendDialogTemplateId, setSendDialogTemplateId] = useState<number | null>(null);
  const [sendForm, setSendForm] = useState({
    targetType: 'ALL' as 'ALL' | 'USER',
    targetUserIds: ''
  });

  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates();
    } else if (activeTab === 'delivery-logs') {
      loadDeliveryLogs();
    } else if (activeTab === 'banner') {
      loadBanners();
    }
  }, [activeTab]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const bannersData = await marketingService.getBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await marketingService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryLogs = async () => {
    setLoading(true);
    try {
      const data = await marketingService.getDeliveryLogs();
      setDeliveryLogs(data);
    } catch (error) {
      console.error('Failed to load delivery logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await marketingService.createTemplate(templateForm);
      setShowTemplateForm(false);
      setTemplateForm({ title: '', body: '', category: 'NOTICE' });
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('템플릿 생성에 실패했습니다.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    try {
      await marketingService.updateTemplate(editingTemplate.id, templateForm);
      setEditingTemplate(null);
      setTemplateForm({ title: '', body: '', category: 'NOTICE' });
      loadTemplates();
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('템플릿 수정에 실패했습니다.');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await marketingService.deleteTemplate(id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('템플릿 삭제에 실패했습니다.');
    }
  };

  const handleSendNotification = async (templateId: number) => {
    const targetUserIds = sendForm.targetType === 'USER' && sendForm.targetUserIds
      ? sendForm.targetUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : null;

    try {
      const result = await marketingService.sendNotification({
        templateId,
        title: null,
        body: null,
        targetType: sendForm.targetType,
        targetUserIds
      });
      alert(`발송 완료: 성공 ${result.successCount}건, 실패 ${result.failCount}건`);
      setSendDialogTemplateId(null);
      setSendForm({ targetType: 'ALL', targetUserIds: '' });
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('알림 발송에 실패했습니다.');
    }
  };

  const startEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      title: template.title,
      body: template.body,
      category: template.category
    });
    setShowTemplateForm(true);
  };

  const cancelTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateForm({ title: '', body: '', category: 'NOTICE' });
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      NOTICE: 'bg-blue-100 text-blue-800',
      EVENT: 'bg-green-100 text-green-800',
      MARKETING: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[category] || 'bg-gray-100 text-gray-800'}`}>{category}</span>;
  };

  const getTargetTypeBadge = (targetType: string) => {
    const styles: Record<string, string> = {
      ALL: 'bg-indigo-100 text-indigo-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = { ALL: '전체', USER: '특정 사용자' };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[targetType]}`}>{labels[targetType] || targetType}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">마케팅 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          푸시 알림
        </button>
        <button
          onClick={() => setActiveTab('delivery-logs')}
          className={`px-4 py-2 font-medium ${activeTab === 'delivery-logs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          발송 로그
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2 font-medium ${activeTab === 'banner' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          배너 관리
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : activeTab === 'templates' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">알림 템플릿</h2>
            <button
              onClick={() => setShowTemplateForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              + 템플릿 추가
            </button>
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
                  <button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    {editingTemplate ? '수정' : '생성'}
                  </button>
                  <button
                    onClick={cancelTemplateForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{template.id}</td>
                  <td className="px-6 py-4 font-medium">{template.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{template.body}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getCategoryBadge(template.category)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(template.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSendDialogTemplateId(template.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      발송
                    </button>
                    <button
                      onClick={() => startEditTemplate(template)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sendDialogTemplateId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">알림 발송</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">대상</label>
                    <select
                      value={sendForm.targetType}
                      onChange={(e) => setSendForm({ ...sendForm, targetType: e.target.value as 'ALL' | 'USER' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="ALL">전체</option>
                      <option value="USER">특정 사용자</option>
                    </select>
                  </div>
                  {sendForm.targetType === 'USER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID (쉼표로 구분)</label>
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
                    <button
                      onClick={() => handleSendNotification(sendDialogTemplateId)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                    >
                      발송
                    </button>
                    <button
                      onClick={() => {
                        setSendDialogTemplateId(null);
                        setSendForm({ targetType: 'ALL', targetUserIds: '' });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'delivery-logs' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">발송 로그</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">발송수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송일시</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.id}</td>
                  <td className="px-6 py-4 font-medium">{log.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTargetTypeBadge(log.targetType)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{log.sentCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">배너 목록</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 배너 추가
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">링크</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순서</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{banner.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{banner.link || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{banner.displayOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                    <button className="text-red-600 hover:text-red-900">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

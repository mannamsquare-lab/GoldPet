import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { marketingService } from '../../services/marketingService';
import type { NotificationTemplate, DeliveryLog } from '../../services/marketingService';
import { Tabs } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button as UIButton } from '@/components/ui/button';

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

const templateSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요.'),
  body: z.string().trim().min(1, '내용을 입력해주세요.'),
  category: z.string().min(1),
});

const bannerSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요.'),
  imageUrl: z.string().default(''),
  link: z.string().default(''),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const sendSchema = z.object({
  targetType: z.enum(['ALL', 'USER']),
  targetUserIds: z.string().default(''),
});

type TemplateFormValues = z.infer<typeof templateSchema>;
type BannerFormValues = z.infer<typeof bannerSchema>;
type SendFormValues = z.infer<typeof sendSchema>;

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
  const { confirm: confirmDialog, ConfirmDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState('templates');

  // Dialog open states
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [sendDialogTemplateId, setSendDialogTemplateId] = useState<number | null>(null);
  // Local state drives conditional rendering without form.watch()
  const [sendTargetType, setSendTargetType] = useState<'ALL' | 'USER'>('ALL');

  // Pagination
  const [templatePage, setTemplatePage] = useState(0);
  const [templateSize] = useState(20);
  const [logPage, setLogPage] = useState(0);
  const [logSize, setLogSize] = useState(20);

  // Forms
  const templateForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { title: '', body: '', category: 'NOTICE' },
  });

  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: '', imageUrl: '', link: '', displayOrder: 0, isActive: true },
  });

  const sendForm = useForm<SendFormValues>({
    resolver: zodResolver(sendSchema),
    defaultValues: { targetType: 'ALL', targetUserIds: '' },
  });

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

  // Delete mutations
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => marketingService.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-templates'] }),
    onError: () => toast.error('템플릿 삭제에 실패했습니다.'),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => marketingService.deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-banners'] }),
    onError: () => toast.error('배너 삭제에 실패했습니다.'),
  });

  // Template dialog handlers
  const openCreateTemplate = () => {
    setEditingTemplate(null);
    templateForm.reset({ title: '', body: '', category: 'NOTICE' });
    setTemplateDialogOpen(true);
  };

  const openEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    templateForm.reset({ title: template.title, body: template.body, category: template.category });
    setTemplateDialogOpen(true);
  };

  const closeTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setEditingTemplate(null);
    templateForm.reset();
  };

  const onTemplateSubmit = async (values: TemplateFormValues) => {
    try {
      if (editingTemplate) {
        await marketingService.updateTemplate(editingTemplate.id, values);
      } else {
        await marketingService.createTemplate(values);
      }
      closeTemplateDialog();
      queryClient.invalidateQueries({ queryKey: ['marketing-templates'] });
    } catch {
      toast.error(editingTemplate ? '템플릿 수정에 실패했습니다.' : '템플릿 생성에 실패했습니다.');
    }
  };

  // Banner dialog handlers
  const openCreateBanner = () => {
    setEditingBanner(null);
    bannerForm.reset({ title: '', imageUrl: '', link: '', displayOrder: 0, isActive: true });
    setBannerDialogOpen(true);
  };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    bannerForm.reset({
      title: banner.title,
      imageUrl: banner.imageUrl ?? '',
      link: banner.link ?? '',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setBannerDialogOpen(true);
  };

  const closeBannerDialog = () => {
    setBannerDialogOpen(false);
    setEditingBanner(null);
    bannerForm.reset();
  };

  const onBannerSubmit = async (values: BannerFormValues) => {
    try {
      if (editingBanner) {
        await marketingService.updateBanner(editingBanner.id, {
          title: values.title,
          imageUrl: values.imageUrl || null,
          link: values.link || null,
          displayOrder: values.displayOrder,
          isActive: values.isActive,
        });
      } else {
        await marketingService.createBanner({
          title: values.title,
          imageUrl: values.imageUrl || null,
          link: values.link || null,
          displayOrder: values.displayOrder,
        });
      }
      closeBannerDialog();
      queryClient.invalidateQueries({ queryKey: ['marketing-banners'] });
    } catch {
      toast.error(editingBanner ? '배너 수정에 실패했습니다.' : '배너 생성에 실패했습니다.');
    }
  };

  // Send dialog handlers
  const openSendDialog = (templateId: number) => {
    setSendDialogTemplateId(templateId);
    setSendTargetType('ALL');
    sendForm.reset({ targetType: 'ALL', targetUserIds: '' });
  };

  const closeSendDialog = () => {
    setSendDialogTemplateId(null);
    setSendTargetType('ALL');
    sendForm.reset();
  };

  const onSendSubmit = async (values: SendFormValues) => {
    if (!sendDialogTemplateId) return;
    try {
      const targetUserIds =
        values.targetType === 'USER' && values.targetUserIds
          ? values.targetUserIds.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
          : null;
      const result = await marketingService.sendNotification({
        templateId: sendDialogTemplateId,
        title: null,
        body: null,
        targetType: values.targetType,
        targetUserIds,
      });
      if (result.failCount > 0) {
        toast.warning(`발송 완료: 성공 ${result.successCount}건, 실패 ${result.failCount}건`);
      } else {
        toast.success(`발송 완료: ${result.successCount}건 전송되었습니다.`);
      }
      closeSendDialog();
    } catch {
      toast.error('알림 발송에 실패했습니다.');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!(await confirmDialog({ description: '정말 삭제하시겠습니까?', variant: 'destructive' }))) return;
    deleteTemplateMutation.mutate(id);
  };

  const handleDeleteBanner = async (bannerId: number) => {
    if (!(await confirmDialog({ description: '배너를 삭제하시겠습니까?', variant: 'destructive' }))) return;
    deleteBannerMutation.mutate(bannerId);
  };

  // Client-side pagination for templates
  const templateStart = templatePage * templateSize;
  const pagedTemplates = templates.slice(templateStart, templateStart + templateSize);

  // Column defs
  const templateColumns: ColumnDef<NotificationTemplate>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    {
      key: 'body',
      header: '내용',
      render: (_v, row) => <span className="text-gray-500 max-w-xs truncate block">{row.body}</span>,
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
          <Button variant="link" size="sm" onClick={() => openSendDialog(row.id)}>발송</Button>
          <Button variant="link" size="sm" onClick={() => openEditTemplate(row)}>수정</Button>
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-900" onClick={() => handleDeleteTemplate(row.id)}>삭제</Button>
        </div>
      ),
    },
  ];

  const logColumns: ColumnDef<DeliveryLog>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    { key: 'targetType', header: '대상', render: (_v, row) => getTargetTypeBadge(row.targetType) },
    { key: 'sentCount', header: '발송수', align: 'right', render: (_v, row) => row.sentCount.toLocaleString() },
    { key: 'sentAt', header: '발송일시', render: (_v, row) => new Date(row.sentAt).toLocaleString() },
  ];

  const bannerColumns: ColumnDef<Banner>[] = [
    { key: 'title', header: '제목', render: (_v, row) => <span className="font-medium">{row.title}</span> },
    { key: 'link', header: '링크', render: (_v, row) => row.link || '-' },
    { key: 'displayOrder', header: '순서' },
    {
      key: 'isActive',
      header: '상태',
      render: (_v, row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
          <Button variant="link" size="sm" onClick={() => openEditBanner(row)}>수정</Button>
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-900" onClick={() => handleDeleteBanner(row.id)}>삭제</Button>
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
            <Button variant="primary" size="sm" onClick={openCreateTemplate}>+ 템플릿 추가</Button>
          </div>
          <DataTable columns={templateColumns} data={pagedTemplates} loading={templatesLoading} emptyMessage="등록된 템플릿이 없습니다." />
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
        </div>
      )}

      {/* Delivery Logs Tab */}
      {activeTab === 'delivery-logs' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">발송 로그</h2>
          </div>
          <DataTable columns={logColumns} data={deliveryLogs} loading={logsLoading} emptyMessage="발송 로그가 없습니다." />
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
            <Button variant="primary" size="sm" onClick={openCreateBanner}>+ 배너 추가</Button>
          </div>
          <DataTable columns={bannerColumns} data={banners} loading={bannersLoading} emptyMessage="등록된 배너가 없습니다." />
        </div>
      )}

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={(open) => { if (!open) closeTemplateDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? '템플릿 수정' : '새 템플릿'}</DialogTitle>
            <DialogDescription>제목, 내용, 카테고리를 입력하세요.</DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
              <FormField
                name="title"
                control={templateForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="body"
                control={templateForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <textarea {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="category"
                control={templateForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="NOTICE">공지</SelectItem>
                        <SelectItem value="EVENT">이벤트</SelectItem>
                        <SelectItem value="MARKETING">마케팅</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <UIButton type="button" variant="outline" onClick={closeTemplateDialog}>취소</UIButton>
                <UIButton type="submit" disabled={templateForm.formState.isSubmitting}>
                  {templateForm.formState.isSubmitting ? '저장 중...' : (editingTemplate ? '수정' : '생성')}
                </UIButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={(open) => { if (!open) closeBannerDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? '배너 수정' : '새 배너'}</DialogTitle>
            <DialogDescription>배너 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          <Form {...bannerForm}>
            <form onSubmit={bannerForm.handleSubmit(onBannerSubmit)} className="space-y-4">
              <FormField
                name="title"
                control={bannerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="imageUrl"
                control={bannerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이미지 URL</FormLabel>
                    <FormControl><Input {...field} placeholder="/banners/example.jpg" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="link"
                control={bannerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>링크 URL</FormLabel>
                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="displayOrder"
                control={bannerForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>표시 순서</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editingBanner && (
                <FormField
                  name="isActive"
                  control={bannerForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상태</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v === 'true')} value={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="true">활성</SelectItem>
                          <SelectItem value="false">비활성</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <UIButton type="button" variant="outline" onClick={closeBannerDialog}>취소</UIButton>
                <UIButton type="submit" disabled={bannerForm.formState.isSubmitting}>
                  {bannerForm.formState.isSubmitting ? '저장 중...' : (editingBanner ? '수정' : '생성')}
                </UIButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogTemplateId !== null} onOpenChange={(open) => { if (!open) closeSendDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>알림 발송</DialogTitle>
            <DialogDescription>발송 대상을 선택하세요.</DialogDescription>
          </DialogHeader>
          <Form {...sendForm}>
            <form onSubmit={sendForm.handleSubmit(onSendSubmit)} className="space-y-4">
              <FormField
                name="targetType"
                control={sendForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대상</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        setSendTargetType(v as 'ALL' | 'USER');
                      }}
                      value={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="USER">특정 사용자</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {sendTargetType === 'USER' && (
                <FormField
                  name="targetUserIds"
                  control={sendForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자 ID (쉼표로 구분)</FormLabel>
                      <FormControl><Input {...field} placeholder="예: 1, 2, 3" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <UIButton type="button" variant="outline" className="flex-1" onClick={closeSendDialog}>취소</UIButton>
                <UIButton type="submit" className="flex-1" disabled={sendForm.formState.isSubmitting}>
                  {sendForm.formState.isSubmitting ? '발송 중...' : '발송'}
                </UIButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {ConfirmDialog}
    </div>
  );
}

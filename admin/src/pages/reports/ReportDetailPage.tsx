import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../../services/reportService';
import { DetailPageLayout } from '../../components/common/DetailPageLayout';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

const TYPE_LABELS: Record<string, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  USER: '회원',
  CHAT: '채팅',
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기',
  RESOLVED: '처리됨',
  DISMISSED: '기각',
};

const ACTION_OPTIONS: Record<string, { value: string; label: string; default?: boolean }[]> = {
  POST: [
    { value: 'DELETE_POST', label: '게시글 삭제', default: true },
    { value: 'HIDE_POST', label: '게시글 숨김' },
    { value: 'SUSPEND_USER', label: '계정 정지 (작성자)' },
    { value: 'WARN_USER', label: '경고' },
  ],
  COMMENT: [
    { value: 'DELETE_COMMENT', label: '댓글 삭제', default: true },
    { value: 'HIDE_COMMENT', label: '댓글 숨김' },
    { value: 'SUSPEND_USER', label: '계정 정지 (작성자)' },
    { value: 'WARN_USER', label: '경고' },
  ],
  USER: [
    { value: 'SUSPEND_USER', label: '계정 정지', default: true },
    { value: 'WARN_USER', label: '경고' },
  ],
  CHAT: [
    { value: 'DELETE_MESSAGE', label: '메시지 삭제', default: true },
    { value: 'SUSPEND_USER', label: '계정 정지 (발신자)' },
    { value: 'WARN_USER', label: '경고' },
  ],
};

const ACTION_LABELS: Record<string, string> = {
  DELETE_POST: '게시글 삭제',
  HIDE_POST: '게시글 숨김',
  DELETE_COMMENT: '댓글 삭제',
  HIDE_COMMENT: '댓글 숨김',
  DELETE_MESSAGE: '메시지 삭제',
  SUSPEND_USER: '계정 정지',
  WARN_USER: '경고',
};

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirm()

  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['reports', 'detail', reportId],
    queryFn: () => reportService.getReportDetail(Number(reportId)),
    enabled: !!reportId,
  });

  const openModal = () => {
    if (!report) return;
    const defaultAction = ACTION_OPTIONS[report.type]?.find(o => o.default)?.value ?? '';
    setSelectedAction(defaultAction);
    setAdminNote('');
    setShowModal(true);
  };

  const handleResolve = async () => {
    if (!report || !selectedAction) return;
    setSubmitting(true);
    try {
      await reportService.resolveReport(report.id, selectedAction, adminNote || undefined);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    } catch {
      toast.error('처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!report) return;
    if (!(await confirmDialog({ description: '기각하시겠습니까?' }))) return;
    try {
      await reportService.dismissReport(report.id);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  };

  const actions = report?.status === 'PENDING' ? (
    <>
      <Button variant="success" onClick={openModal}>
        조치 완료
      </Button>
      <Button variant="secondary" onClick={handleDismiss}>
        기각
      </Button>
    </>
  ) : undefined;

  if (isLoading) {
    return (
      <DetailPageLayout title="신고 상세" backPath="/reports">
        <div className="py-12 text-center text-gray-500">로딩 중...</div>
      </DetailPageLayout>
    );
  }

  if (isError || !report) {
    return (
      <DetailPageLayout title="신고 상세" backPath="/reports">
        <div className="py-12 text-center text-gray-500">신고 정보를 불러올 수 없습니다.</div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout title="신고 상세" backPath="/reports" actions={actions}>
      <div className="space-y-6">
        {/* Status & Meta */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신고 정보</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">신고 ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">유형</dt>
              <dd className="mt-1">
                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                  {TYPE_LABELS[report.type] ?? report.type}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">상태</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${STATUS_BADGE_STYLES[report.status] ?? ''}`}>
                  {STATUS_LABELS[report.status] ?? report.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">신고자</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.reporterNickname}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">신고일</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.createdAt ?? '-'}</dd>
            </div>
            {report.resolvedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">처리일</dt>
                <dd className="mt-1 text-sm text-gray-900">{report.resolvedAt}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Report Reason */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신고 사유</h2>
          <p className="text-sm text-gray-900">{report.reason}</p>
        </div>

        {/* Reported Content Preview */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신고 대상 미리보기</h2>
          {report.targetPreview ? (
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.targetPreview}</p>
          ) : (
            <p className="text-sm text-gray-500">미리보기를 사용할 수 없습니다.</p>
          )}
          <p className="mt-3 text-xs text-gray-400">대상 ID: {report.targetId}</p>
        </div>

        {/* Resolution Info (RESOLVED status) */}
        {report.status === 'RESOLVED' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">처리 내역</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">수행된 조치</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {report.actionType ? (ACTION_LABELS[report.actionType] ?? report.actionType) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">처리자</dt>
                <dd className="mt-1 text-sm text-gray-900">{report.resolvedByName ?? '-'}</dd>
              </div>
              {report.adminNote && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500">관리자 메모</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{report.adminNote}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">제재 액션 선택</h3>

            <div className="space-y-2 mb-4">
              {(ACTION_OPTIONS[report.type] ?? []).map(option => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="actionType"
                    value={option.value}
                    checked={selectedAction === option.value}
                    onChange={() => setSelectedAction(option.value)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>

            {selectedAction === 'SUSPEND_USER' && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2 mb-4">
                계정만 정지되며, 콘텐츠는 삭제되지 않습니다.
              </p>
            )}
            {(selectedAction === 'HIDE_POST' || selectedAction === 'HIDE_COMMENT') && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded px-3 py-2 mb-4">
                콘텐츠가 숨김 처리되며, 관리자 페이지에서 복원할 수 있습니다.
              </p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                관리자 메모 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="처리 사유나 참고 내용을 입력하세요."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                취소
              </Button>
              <Button
                variant="success"
                onClick={handleResolve}
                disabled={!selectedAction || submitting}
              >
                {submitting ? '처리 중...' : '조치 실행'}
              </Button>
            </div>
          </div>
        </div>
      )}
    {ConfirmDialog}
    </DetailPageLayout>
  );
}

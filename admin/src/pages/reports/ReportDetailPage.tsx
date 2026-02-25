import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../../services/reportService';
import { DetailPageLayout } from '../../components/common/DetailPageLayout';
import { Button } from '../../components/common/Button';

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

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['reports', 'detail', reportId],
    queryFn: () => reportService.getReportDetail(Number(reportId)),
    enabled: !!reportId,
  });

  const handleAction = async (action: 'resolve' | 'dismiss') => {
    if (!report) return;
    const msg = action === 'resolve' ? '조치 완료 처리하시겠습니까?' : '기각하시겠습니까?';
    if (!confirm(msg)) return;
    try {
      if (action === 'resolve') {
        await reportService.resolveReport(report.id);
      } else {
        await reportService.dismissReport(report.id);
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    } catch {
      alert('처리에 실패했습니다.');
    }
  };

  const actions = report?.status === 'PENDING' ? (
    <>
      <Button variant="success" onClick={() => handleAction('resolve')}>
        조치 완료
      </Button>
      <Button variant="secondary" onClick={() => handleAction('dismiss')}>
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
      </div>
    </DetailPageLayout>
  );
}

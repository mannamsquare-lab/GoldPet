import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import type { ReportItem } from '../../services/reportService';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getReports({ page: 0, status: statusFilter });
      setReports(response.content);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number, action: 'resolve' | 'dismiss') => {
    const msg = action === 'resolve' ? '조치하시겠습니까?' : '기각하시겠습니까?';
    if (!confirm(msg)) return;
    try {
      if (action === 'resolve') {
        await reportService.resolveReport(reportId);
      } else {
        await reportService.dismissReport(reportId);
      }
      loadReports();
    } catch {
      alert('처리에 실패했습니다.');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { POST: '게시글', COMMENT: '댓글', USER: '회원', CHAT: '채팅' };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      DISMISSED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = { PENDING: '대기', RESOLVED: '처리됨', DISMISSED: '기각' };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">신고 관리</h1>
        <div className="flex gap-2">
          {['PENDING', 'RESOLVED', 'DISMISSED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {status === 'PENDING' ? '대기' : status === 'RESOLVED' ? '처리됨' : '기각'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고일</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">신고가 없습니다.</td></tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded">{getTypeLabel(report.type)}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm">{report.targetPreview}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{report.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporterNickname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {report.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleResolve(report.id, 'resolve')} className="text-green-600 hover:text-green-900 mr-3">조치</button>
                        <button onClick={() => handleResolve(report.id, 'dismiss')} className="text-gray-600 hover:text-gray-900">기각</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

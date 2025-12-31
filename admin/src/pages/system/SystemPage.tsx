import { useState, useEffect } from 'react';
import { systemService } from '../../services/systemService';
import type { SystemInfo, AdminUser } from '../../services/systemService';

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [infoData, adminsData] = await Promise.all([
        systemService.getSystemInfo(),
        systemService.getAdmins(),
      ]);
      setSystemInfo(infoData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OK: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>

      {/* System Status */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">버전</p>
            <p className="text-lg font-semibold">{systemInfo?.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">환경</p>
            <p className="text-lg font-semibold">{systemInfo?.environment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">서버 시간</p>
            <p className="text-lg font-semibold">{systemInfo?.serverTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">가동 시간</p>
            <p className="text-lg font-semibold">{systemInfo?.uptime}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span>데이터베이스</span>
            {getStatusBadge(systemInfo?.dbStatus || 'OK')}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span>캐시 서버</span>
            {getStatusBadge(systemInfo?.cacheStatus || 'OK')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span>스토리지</span>
              <span className="text-sm">{systemInfo?.storageUsed}GB / {systemInfo?.storageTotal}GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${((systemInfo?.storageUsed || 0) / (systemInfo?.storageTotal || 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">관리자 계정</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            + 관리자 추가
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">마지막 로그인</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{admin.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${admin.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {admin.role === 'SUPER_ADMIN' ? '최고관리자' : '운영자'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                  <button className="text-red-600 hover:text-red-900">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">시스템 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">점검 모드</p>
              <p className="text-sm text-gray-500">서비스 일시 중단 및 점검 페이지 표시</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              비활성화됨
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">신규 가입 허용</p>
              <p className="text-sm text-gray-500">새로운 회원 가입 허용 여부</p>
            </div>
            <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              활성화됨
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">데이터 백업</p>
              <p className="text-sm text-gray-500">마지막 백업: 자동 관리</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              지금 백업
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../../services/systemService';
import type { AdminUser } from '../../services/systemService';
import { cacheService } from '../../services/cacheService';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';

export default function SystemPage() {
  const queryClient = useQueryClient();
  const [signupEnabled, setSignupEnabled] = useState(true);

  const { data: systemInfo, isLoading: loadingSystem } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: () => systemService.getSystemInfo(),
  });

  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admins'],
    queryFn: () => systemService.getAdmins(),
  });

  const { data: maintenanceStatus, isLoading: loadingMaintenance } = useQuery({
    queryKey: ['maintenanceStatus'],
    queryFn: () => systemService.getMaintenanceStatus(),
  });
  const maintenanceEnabled = maintenanceStatus?.enabled ?? false;

  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['configs'],
    queryFn: () => systemService.getConfigs(),
  });

  const { data: caches = [], isLoading: loadingCaches } = useQuery({
    queryKey: ['caches'],
    queryFn: () => cacheService.getStatus(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemService.updateConfig(key, value),
    onSuccess: () => {
      alert('설정이 저장되었습니다');
      queryClient.invalidateQueries({ queryKey: ['configs'] });
    },
    onError: () => {
      alert('설정 변경에 실패했습니다');
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: (cacheName: string) => cacheService.clearCache(cacheName),
    onSuccess: (result) => {
      if (result.success) {
        alert(`캐시 초기화 완료: ${result.message}`);
      } else {
        alert(`캐시 초기화 실패: ${result.message}`);
      }
      queryClient.invalidateQueries({ queryKey: ['caches'] });
    },
    onError: () => {
      alert('캐시 초기화 실패');
    },
  });

  // configs에서 가입 상태 초기화
  useEffect(() => {
    if (configs.length > 0) {
      const signupConfig = configs.find(c => c.key === 'allow_signups' || c.key === 'signup.enabled');
      if (signupConfig) setSignupEnabled(signupConfig.value === 'true');
    }
  }, [configs]);

  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => systemService.setMaintenanceMode(enabled),
    onSuccess: (_data, enabled) => {
      alert(enabled ? '유지보수 모드가 활성화되었습니다.' : '유지보수 모드가 해제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['maintenanceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => {
      alert('유지보수 모드 변경에 실패했습니다.');
    },
  });

  const signupMutation = useMutation({
    mutationFn: (enabled: boolean) => systemService.updateConfig('allow_signups', String(enabled)),
    onSuccess: (_data, enabled) => {
      setSignupEnabled(enabled);
      alert(enabled ? '신규 가입이 허용되었습니다.' : '신규 가입이 차단되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['configs'] });
    },
    onError: () => {
      alert('설정 변경에 실패했습니다.');
    },
  });

  const clearAllCachesMutation = useMutation({
    mutationFn: () => cacheService.clearAll(),
    onSuccess: (result) => {
      if (result.success) {
        alert(`전체 캐시 초기화 완료: ${result.message}`);
      } else {
        alert(`전체 캐시 초기화 실패: ${result.message}`);
      }
      queryClient.invalidateQueries({ queryKey: ['caches'] });
    },
    onError: () => {
      alert('전체 캐시 초기화 실패');
    },
  });

  const handleUpdateConfig = (key: string, value: string) => {
    updateConfigMutation.mutate({ key, value });
  };

  const handleClearCache = (cacheName: string) => {
    if (!confirm(`${cacheName} 캐시를 초기화하시겠습니까?`)) return;
    clearCacheMutation.mutate(cacheName);
  };

  const handleClearAllCaches = () => {
    if (!confirm('전체 캐시를 초기화하시겠습니까? 일시적으로 시스템 성능에 영향을 줄 수 있습니다.')) return;
    clearAllCachesMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OK: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const loading = loadingSystem || loadingAdmins || loadingConfigs || loadingCaches || loadingMaintenance;

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  const adminColumns: ColumnDef<AdminUser>[] = [
    { key: 'email', header: '이메일' },
    { key: 'name', header: '이름' },
    {
      key: 'role',
      header: '역할',
      render: (_value, row) => (
        <span className={`px-2 py-1 text-xs rounded ${row.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          {row.role === 'SUPER_ADMIN' ? '최고 관리자' : '운영자'}
        </span>
      ),
    },
    { key: 'lastLogin', header: '최근 로그인' },
    {
      key: 'id',
      header: '관리',
      align: 'right',
      render: () => (
        <span className="inline-flex gap-3">
          <Button variant="link" size="sm">수정</Button>
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-900">삭제</Button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>

      {/* 시스템 상태 */}
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

      {/* 캐시 관리 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">캐시 관리</h2>
          <Button variant="danger" onClick={handleClearAllCaches}>
            전체 초기화
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caches.map(cache => (
            <div key={cache.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{cache.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${cache.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {cache.isActive ? '활성' : '비활성'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{cache.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">TTL: {cache.ttlSeconds}s</span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleClearCache(cache.name)}
                >
                  초기화
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 앱 설정 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">앱 설정</h2>
        <div className="space-y-4">
          {[...configs].filter(c => c.key !== 'maintenance.mode').sort((a, b) => a.key.localeCompare(b.key)).map(config => {
            const isBooleanValue = config.value === 'true' || config.value === 'false';

            return (
              <div key={config.key} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{config.key}</p>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isBooleanValue ? (
                    <select
                      key={`${config.key}-${config.value}`}
                      defaultValue={config.value}
                      className="border rounded px-2 py-1 w-32 text-right bg-white"
                      onChange={(e) => {
                        if (e.target.value !== config.value) {
                          handleUpdateConfig(config.key, e.target.value);
                        }
                      }}
                    >
                      <option value="true">활성 (true)</option>
                      <option value="false">비활성 (false)</option>
                    </select>
                  ) : (
                    <input
                      key={`${config.key}-${config.value}`}
                      type="text"
                      defaultValue={config.value}
                      className="border rounded px-2 py-1 w-32 text-right"
                      onBlur={(e) => {
                        if (e.target.value !== config.value) {
                          handleUpdateConfig(config.key, e.target.value);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 관리자 계정 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">관리자 계정</h2>
          <Button variant="primary">+ 관리자 추가</Button>
        </div>
        <DataTable<AdminUser>
          columns={adminColumns}
          data={admins}
          emptyMessage="관리자가 없습니다."
        />
      </div>

      {/* 유지보수 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">유지보수</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">유지보수 모드</p>
              <p className="text-sm text-gray-500">서비스를 중단하고 유지보수 페이지를 표시합니다</p>
            </div>
            <Button
              variant={maintenanceEnabled ? 'danger' : 'ghost'}
              disabled={maintenanceMutation.isPending}
              onClick={() => {
                const next = !maintenanceEnabled;
                const msg = next
                  ? '유지보수 모드를 활성화하시겠습니까? 서비스가 중단됩니다.'
                  : '유지보수 모드를 해제하시겠습니까?';
                if (confirm(msg)) maintenanceMutation.mutate(next);
              }}
            >
              {maintenanceMutation.isPending ? '변경 중...' : maintenanceEnabled ? '활성' : '비활성'}
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">신규 가입 허용</p>
              <p className="text-sm text-gray-500">신규 회원 가입 허용 여부</p>
            </div>
            <Button
              variant={signupEnabled ? 'success' : 'ghost'}
              disabled={signupMutation.isPending}
              onClick={() => {
                const next = !signupEnabled;
                const msg = next
                  ? '신규 가입을 허용하시겠습니까?'
                  : '신규 가입을 차단하시겠습니까?';
                if (confirm(msg)) signupMutation.mutate(next);
              }}
            >
              {signupMutation.isPending ? '변경 중...' : signupEnabled ? '활성' : '비활성'}
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">데이터 백업</p>
              <p className="text-sm text-gray-500">마지막 백업: 자동 관리</p>
            </div>
            <Button variant="primary">백업 실행</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { systemService } from '../../services/systemService';
import type { SystemInfo, AdminUser, AppConfig } from '../../services/systemService';
import { cacheService } from '../../services/cacheService';
import type { CacheInfo } from '../../services/cacheService';

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [infoData, adminsData, configsData, cachesData] = await Promise.all([
        systemService.getSystemInfo(),
        systemService.getAdmins(),
        systemService.getConfigs(),
        cacheService.getStatus(),
      ]);
      setSystemInfo(infoData);
      setAdmins(adminsData);
      setConfigs(configsData);
      setCaches(cachesData);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    try {
        await systemService.updateConfig(key, value);
        await loadData(); // Refresh to ensure sync
        alert('Configuration saved');
    } catch (e) {
        console.error('Failed to update config', e);
        alert('Failed to update config');
    }
  };

  const handleClearCache = async (cacheName: string) => {
    if (!confirm(`Are you sure you want to clear the ${cacheName} cache?`)) {
      return;
    }
    try {
      const result = await cacheService.clearCache(cacheName);
      if (result.success) {
        alert(`Cache cleared: ${result.message}`);
        await loadData();
      } else {
        alert(`Failed to clear cache: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    }
  };

  const handleClearAllCaches = async () => {
    if (!confirm('Are you sure you want to clear ALL caches? This may impact system performance temporarily.')) {
      return;
    }
    try {
      const result = await cacheService.clearAll();
      if (result.success) {
        alert(`All caches cleared: ${result.message}`);
        await loadData();
      } else {
        alert(`Failed to clear all caches: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to clear all caches:', error);
      alert('Failed to clear all caches');
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
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Management</h1>

      {/* System Status */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Version</p>
            <p className="text-lg font-semibold">{systemInfo?.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Environment</p>
            <p className="text-lg font-semibold">{systemInfo?.environment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Server Time</p>
            <p className="text-lg font-semibold">{systemInfo?.serverTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="text-lg font-semibold">{systemInfo?.uptime}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span>Database</span>
            {getStatusBadge(systemInfo?.dbStatus || 'OK')}
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span>Cache Server</span>
            {getStatusBadge(systemInfo?.cacheStatus || 'OK')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span>Storage</span>
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

      {/* Cache Management */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Cache Management</h2>
          <button
            onClick={handleClearAllCaches}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            전체 초기화
          </button>
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
                <button
                  onClick={() => handleClearCache(cache.name)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  초기화
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* System Configurations */}
       <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Application Configuration</h2>
        <div className="space-y-4">
            {configs.map(config => (
                 <div key={config.key} className="flex items-center justify-between py-3 border-b">
                 <div>
                   <p className="font-medium">{config.key}</p>
                   <p className="text-sm text-gray-500">{config.description}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        defaultValue={config.value} 
                        className="border rounded px-2 py-1 w-32 text-right"
                        onBlur={(e) => {
                            if (e.target.value !== config.value) {
                                handleUpdateConfig(config.key, e.target.value);
                            }
                        }}
                    />
                 </div>
               </div>
            ))}
        </div>
      </div>

      {/* Admin Users */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Admin Accounts</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            + Add Admin
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{admin.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${admin.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Maintenance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Suspend service and show maintenance page</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Disabled
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Allow New Signups</p>
              <p className="text-sm text-gray-500">Whether to allow new user registrations</p>
            </div>
            <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              Enabled
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Data Backup</p>
              <p className="text-sm text-gray-500">Last backup: Auto-managed</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Backup Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

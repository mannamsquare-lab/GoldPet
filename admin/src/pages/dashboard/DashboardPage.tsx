import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardStats, RecentActivity } from '../../services/dashboardService';

// Stat card component
const StatCard = ({ title, value, icon, trend }: { title: string; value: string | number; icon: string; trend?: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trend && <p className="mt-1 text-sm text-green-600">{trend}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(10),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="총 회원수" value={stats?.totalUsers || 0} icon="👥" trend={`오늘 +${stats?.newUsersToday || 0}`} />
        <StatCard title="총 반려동물" value={stats?.totalPets || 0} icon="🐾" />
        <StatCard title="총 산책 횟수" value={stats?.totalWalks || 0} icon="🚶" />
        <StatCard title="총 산책 거리" value={`${(stats?.totalDistance || 0).toFixed(1)}km`} icon="📍" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="게시글" value={stats?.totalPosts || 0} icon="📝" />
        <StatCard title="댓글" value={stats?.totalComments || 0} icon="💬" />
        <StatCard title="미처리 신고" value={stats?.pendingReports || 0} icon="⚠️" />
        <StatCard title="매출 (원)" value={stats?.revenue || 0} icon="💰" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">최근 활동</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
              <span className="text-xl">
                {activity.type === 'USER_JOIN' && '👋'}
                {activity.type === 'POST_CREATE' && '📝'}
                {activity.type === 'REPORT' && '⚠️'}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.createdAt}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-gray-500 text-center py-4">최근 활동이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { lbsService } from '../../services/lbsService';
import type { LBSStats, Place } from '../../services/lbsService';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function LBSPage() {
  const [stats, setStats] = useState<LBSStats | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, placesData] = await Promise.all([
        lbsService.getStats(),
        lbsService.getPlaces(),
      ]);
      setStats(statsData);
      setPlaces(placesData);
    } catch (error) {
      console.error('Failed to load LBS data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">산책/지도 관리</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="총 산책 횟수" value={stats?.totalWalks || 0} icon="🚶" />
        <StatCard title="오늘 산책" value={stats?.todayWalks || 0} icon="📅" />
        <StatCard title="총 산책 거리" value={`${stats?.totalDistance?.toFixed(1) || 0}km`} icon="📍" />
        <StatCard title="평균 산책 시간" value={`${stats?.avgDuration || 0}분`} icon="⏱️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spots */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">인기 장소 TOP 3</h2>
          </div>
          <div className="p-4 space-y-4">
            {stats?.topSpots.map((spot, index) => (
              <div key={spot.id} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{spot.name}</p>
                  <p className="text-sm text-gray-500">{spot.visits.toLocaleString()} 방문</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Places List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">등록된 장소</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 장소 추가
            </button>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {places.length === 0 ? (
              <div className="p-8 text-center text-gray-500">등록된 장소가 없습니다.</div>
            ) : (
              places.map((place) => (
                <div key={place.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{place.name}</span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{place.category}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        ⭐ {place.rating} · {place.visits.toLocaleString()} 방문
                      </p>
                    </div>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900">수정</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

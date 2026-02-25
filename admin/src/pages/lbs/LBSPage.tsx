import { useState, useEffect } from 'react';
import { lbsService } from '../../services/lbsService';
import type { LBSStats, Place } from '../../services/lbsService';
import { walkAdminService } from '../../services/walkAdminService';
import type { WalkAdminResponse } from '../../services/walkAdminService';
import type { PageResponse } from '../../types/api';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'walks' | 'places'>('stats');
  const [stats, setStats] = useState<LBSStats | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [walks, setWalks] = useState<PageResponse<WalkAdminResponse> | null>(null);
  const [loading, setLoading] = useState(true);

  // Walk filters
  const [userNickname, setUserNickname] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDistance, setMinDistance] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'walks') {
      loadWalks();
    }
  }, [activeTab, currentPage]);

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

  const loadWalks = async () => {
    try {
      const walksData = await walkAdminService.getWalks({
        page: currentPage,
        size: 20,
        userNickname: userNickname || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minDistance: minDistance ? Number(minDistance) : undefined,
        maxDistance: maxDistance ? Number(maxDistance) : undefined,
      });
      setWalks(walksData);
    } catch (error) {
      console.error('Failed to load walks:', error);
    }
  };

  const handleSearchWalks = () => {
    setCurrentPage(0);
    loadWalks();
  };

  const handleDeleteWalk = async (id: number) => {
    if (!confirm('이 산책 기록을 삭제하시겠습니까?')) return;
    const reason = prompt('삭제 사유를 입력하세요:');
    if (!reason) return;

    try {
      await walkAdminService.deleteWalk(id, reason);
      loadWalks();
    } catch (error) {
      console.error('Failed to delete walk:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">산책/지도 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          통계
        </button>
        <button
          onClick={() => setActiveTab('walks')}
          className={`px-4 py-2 font-medium ${activeTab === 'walks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          산책 기록
        </button>
        <button
          onClick={() => setActiveTab('places')}
          className={`px-4 py-2 font-medium ${activeTab === 'places' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          장소 관리
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="총 산책 횟수" value={stats?.totalWalks || 0} icon="🚶" />
            <StatCard title="오늘 산책" value={stats?.todayWalks || 0} icon="📅" />
            <StatCard title="총 산책 거리" value={`${stats?.totalDistance?.toFixed(1) || 0}km`} icon="📍" />
            <StatCard title="평균 산책 시간" value={`${stats?.avgDuration || 0}분`} icon="⏱️" />
          </div>

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
        </>
      )}

      {/* Walk History Tab */}
      {activeTab === 'walks' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사용자</label>
                <input
                  type="text"
                  value={userNickname}
                  onChange={(e) => setUserNickname(e.target.value)}
                  placeholder="닉네임 검색"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최소 거리 (km)</label>
                <input
                  type="number"
                  value={minDistance}
                  onChange={(e) => setMinDistance(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최대 거리 (km)</label>
                <input
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  placeholder="100"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearchWalks}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* Walks Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시작시간</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">거리(km)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">시간(분)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">칼로리</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">스팟수</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {walks?.content.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      산책 기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  walks?.content.map((walk) => (
                    <tr key={walk.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{walk.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{walk.userNickname || `User ${walk.userId}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(walk.startTime).toLocaleString('ko-KR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{walk.distanceKm.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{Math.round(walk.durationSeconds / 60)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{walk.caloriesBurned}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{walk.spotsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">상세</button>
                        <button
                          onClick={() => handleDeleteWalk(walk.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {walks && walks.totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  총 {walks.totalElements.toLocaleString()}개 · {walks.number + 1} / {walks.totalPages} 페이지
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(walks.totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= walks.totalPages - 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Places Tab */}
      {activeTab === 'places' && (
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
      )}
    </div>
  );
}

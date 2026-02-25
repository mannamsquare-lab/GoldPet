import { useQueryClient } from '@tanstack/react-query';
import { Activity, Calendar, MapPin, Clock } from 'lucide-react';
import { lbsService } from '../../services/lbsService';
import type { Place } from '../../services/lbsService';
import { walkAdminService } from '../../services/walkAdminService';
import type { WalkAdminResponse } from '../../services/walkAdminService';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { useListParams } from '../../hooks/useListParams';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Tabs } from '../../components/common/Tabs';
import { StatCard } from '../../components/common/StatCard';
import { SearchFilters } from '../../components/common/SearchFilters';
import { Button } from '../../components/common/Button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const LBS_TABS = [
  { key: 'stats', label: '통계' },
  { key: 'walks', label: '산책 기록' },
  { key: 'places', label: '장소 관리' },
];

const WALK_FILTER_FIELDS = [
  { type: 'text' as const, key: 'userNickname', placeholder: '닉네임 검색' },
  { type: 'date' as const, key: 'startDate', label: '시작일' },
  { type: 'date' as const, key: 'endDate', label: '종료일' },
  { type: 'number' as const, key: 'minDistance', label: '최소 거리 (km)', min: 0 },
  { type: 'number' as const, key: 'maxDistance', label: '최대 거리 (km)', min: 0 },
];

export default function LBSPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  const { page, size, filters, setPage, setSize, setFilter } = useListParams({ defaultSize: 20 });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['lbs-stats'],
    queryFn: () => lbsService.getStats(),
  });

  const { data: walks, isLoading: walksLoading } = usePagedQuery<WalkAdminResponse>({
    queryKey: 'walks',
    fetchFn: (params) => walkAdminService.getWalks({
      page: params.page,
      size: params.size,
      userNickname: params.userNickname || undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      minDistance: params.minDistance ? Number(params.minDistance) : undefined,
      maxDistance: params.maxDistance ? Number(params.maxDistance) : undefined,
    }),
    page,
    size,
    filters: {
      userNickname: filters.userNickname || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minDistance: filters.minDistance || undefined,
      maxDistance: filters.maxDistance || undefined,
    },
    enabled: activeTab === 'walks',
  });

  const loadPlaces = async () => {
    setPlacesLoading(true);
    try {
      const data = await lbsService.getPlaces();
      setPlaces(data);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setPlacesLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'places') {
      loadPlaces();
    }
  };

  const handleDeleteWalk = async (id: number) => {
    if (!confirm('이 산책 기록을 삭제하시겠습니까?')) return;
    const reason = prompt('삭제 사유를 입력하세요:');
    if (!reason) return;
    try {
      await walkAdminService.deleteWalk(id, reason);
      queryClient.invalidateQueries({ queryKey: ['walks'] });
    } catch (error) {
      console.error('Failed to delete walk:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const walkColumns: ColumnDef<WalkAdminResponse>[] = [
    { key: 'id', header: 'ID', width: '60px' },
    {
      key: 'userNickname',
      header: '사용자',
      render: (value, row) => value || `User ${row.userId}`,
    },
    {
      key: 'startTime',
      header: '시작시간',
      render: (value) => new Date(value).toLocaleString('ko-KR'),
    },
    {
      key: 'distanceKm',
      header: '거리(km)',
      align: 'right',
      render: (value) => value.toFixed(2),
    },
    {
      key: 'durationSeconds',
      header: '시간(분)',
      align: 'right',
      render: (value) => Math.round(value / 60),
    },
    { key: 'caloriesBurned', header: '칼로리', align: 'right' },
    { key: 'spotsCount', header: '스팟수', align: 'right' },
    {
      key: 'id',
      header: '액션',
      align: 'right',
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-3">
          <Button variant="link" size="sm">상세</Button>
          <Button
            variant="link"
            size="sm"
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteWalk(row.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  if (statsLoading) {
    return <div className="flex items-center justify-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">산책/지도 관리</h1>

      <Tabs tabs={LBS_TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="총 산책 횟수" value={stats?.totalWalks || 0} icon={Activity} />
            <StatCard title="오늘 산책" value={stats?.todayWalks || 0} icon={Calendar} />
            <StatCard title="총 산책 거리" value={`${stats?.totalDistance?.toFixed(1) || 0}km`} icon={MapPin} />
            <StatCard title="평균 산책 시간" value={`${stats?.avgDuration || 0}분`} icon={Clock} />
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
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
            <SearchFilters
              fields={WALK_FILTER_FIELDS}
              values={filters}
              onChange={(key, value) => setFilter(key, value || null)}
              onSearch={() => { setPage(0); }}
            />
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <DataTable<WalkAdminResponse>
              columns={walkColumns}
              data={walks?.content || []}
              loading={walksLoading}
              emptyMessage="산책 기록이 없습니다."
            />
            {walks && walks.totalPages > 0 && (
              <div className="border-t">
                <Pagination
                  page={page}
                  totalPages={walks.totalPages}
                  totalElements={walks.totalElements}
                  size={size}
                  onPageChange={setPage}
                  onSizeChange={setSize}
                />
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
            <Button variant="primary">+ 장소 추가</Button>
          </div>
          {placesLoading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : (
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
                      <Button variant="link" size="sm">수정</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

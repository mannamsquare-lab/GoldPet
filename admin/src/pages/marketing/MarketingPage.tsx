import { useState, useEffect } from 'react';

interface PushCampaign {
  id: number;
  title: string;
  message: string;
  targetAudience: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  scheduledAt: string | null;
  sentAt: string | null;
}

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'push' | 'banner'>('push');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data
      setCampaigns([
        { id: 1, title: '크리스마스 이벤트', message: '🎄 크리스마스 특별 이벤트!', targetAudience: '전체', sentCount: 1250, openRate: 45.2, clickRate: 12.3, status: 'SENT', scheduledAt: null, sentAt: '2025-12-20 10:00' },
        { id: 2, title: '신규 기능 안내', message: '새로운 챌린지 기능이 추가되었어요!', targetAudience: '활성 사용자', sentCount: 0, openRate: 0, clickRate: 0, status: 'SCHEDULED', scheduledAt: '2025-12-25 09:00', sentAt: null },
      ]);
      setBanners([
        { id: 1, title: '크리스마스 이벤트', imageUrl: '/banners/christmas.png', linkUrl: '/event/christmas', position: 'HOME_TOP', isActive: true, startDate: '2025-12-01', endDate: '2025-12-31' },
        { id: 2, title: '프리미엄 구독', imageUrl: '/banners/premium.png', linkUrl: '/premium', position: 'HOME_BOTTOM', isActive: true, startDate: '2025-01-01', endDate: '2025-12-31' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = { DRAFT: '초안', SCHEDULED: '예약됨', SENT: '발송됨' };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">마케팅 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('push')}
          className={`px-4 py-2 font-medium ${activeTab === 'push' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          푸시 알림
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2 font-medium ${activeTab === 'banner' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          배너 관리
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : activeTab === 'push' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">푸시 캠페인</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 새 캠페인
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">발송</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">오픈율</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">클릭율</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{campaign.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.targetAudience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(campaign.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{campaign.sentCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{campaign.openRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{campaign.clickRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">배너 목록</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 배너 추가
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">위치</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{banner.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{banner.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{banner.startDate} ~ {banner.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                    <button className="text-red-600 hover:text-red-900">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

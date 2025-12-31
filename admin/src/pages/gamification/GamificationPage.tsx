import { useState, useEffect } from 'react';
import { gamificationService } from '../../services/gamificationService';
import type { Badge, Challenge } from '../../services/gamificationService';

export default function GamificationPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges'>('badges');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [badgesData, challengesData] = await Promise.all([
        gamificationService.getBadges(),
        gamificationService.getChallenges(),
      ]);
      setBadges(badgesData);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">게이미피케이션 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 font-medium ${activeTab === 'badges' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          뱃지
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 font-medium ${activeTab === 'challenges' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          챌린지
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : activeTab === 'badges' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">뱃지 목록</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 뱃지 추가
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">획득자</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {badges.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">등록된 뱃지가 없습니다.</td></tr>
              ) : (
                badges.map((badge) => (
                  <tr key={badge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{badge.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{badge.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{badge.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{badge.earnedCount.toLocaleString()}명</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">챌린지 목록</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + 챌린지 추가
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">목표</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">참여자</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">완료</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challenges.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">등록된 챌린지가 없습니다.</td></tr>
              ) : (
                challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{challenge.title}</div>
                      <div className="text-sm text-gray-500">{challenge.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{challenge.startDate} ~ {challenge.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{challenge.goalType === 'WALK_DISTANCE_TOTAL' ? `${challenge.goalValue}km` : `${challenge.goalValue}회`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{challenge.participantCount}명</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">{challenge.completedCount}명</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

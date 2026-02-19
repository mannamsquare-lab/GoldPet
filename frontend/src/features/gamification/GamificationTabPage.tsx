import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../../services/gamificationService';
import type { Badge } from '../../services/gamificationService';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import './GamificationPage.css';

type Tab = 'badges' | 'missions';

export default function GamificationTabPage() {
  const location = useLocation();
  const initialTab: Tab = location.pathname === '/missions' ? 'missions' : 'badges';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: gamificationService.getAllBadges,
  });

  const earnedCount = badges?.filter((b) => b.acquiredAt).length || 0;
  const totalCount = badges?.length || 0;

  // Missions = badges with conditionType (achievable through actions)
  const missions = badges?.filter((b) => b.conditionType) || [];

  const getMissionTypeLabel = (badge: Badge) => {
    if (badge.isRepeatable && badge.startDate) return '반복 기간 미션';
    if (badge.isRepeatable) return '반복 미션';
    if (badge.startDate) return '기간 한정';
    return '상시 미션';
  };

  const getRepeatCycleLabel = (cycle?: string | null) => {
    switch (cycle) {
      case 'DAILY': return '매일';
      case 'WEEKLY': return '매주';
      case 'MONTHLY': return '매월';
      default: return '';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getConditionLabel = (type?: string | null) => {
    switch (type) {
      case 'PET_REGISTER': return '반려동물 등록';
      case 'WALK_COUNT': return '산책';
      case 'WALK_DISTANCE_TOTAL': return '총 산책 거리';
      case 'COMMUNITY_POST': return '커뮤니티 글';
      case 'COMMUNITY_COMMENT': return '댓글';
      case 'CHECK_IN': return '체크인';
      case 'FRIEND_MATCH': return '친구 매칭';
      default: return '미션';
    }
  };

  const getConditionUnit = (type?: string | null) => {
    switch (type) {
      case 'WALK_DISTANCE_TOTAL': return 'km';
      default: return '회';
    }
  };

  return (
    <SubPageLayout title="뱃지 & 미션">
      <div id="gamificationTabPage">
        {/* Tab Menu */}
        <div className="gamification_tabs">
          <button
            className={`gamification_tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            뱃지
          </button>
          <button
            className={`gamification_tab ${activeTab === 'missions' ? 'active' : ''}`}
            onClick={() => setActiveTab('missions')}
          >
            미션
          </button>
        </div>

        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : activeTab === 'badges' ? (
          /* Badges Tab */
          <div id="badgesPage">
            <div className="progress_summary">
              <div className="progress_circle">
                <span className="progress_value">{earnedCount}/{totalCount}</span>
                <span className="progress_label">획득</span>
              </div>
              <p className="progress_text">지금까지 {earnedCount}개의 뱃지를 획득했어요!</p>
            </div>

            <div className="badges_section">
              <h2>전체 뱃지</h2>
              <div className="badges_grid">
                {badges?.map((badge) => (
                  <div key={badge.id} className={`badge_card ${badge.acquiredAt ? 'earned' : 'locked'}`}>
                    <div className="badge_icon">
                      {badge.acquiredAt ? (
                        failedImages.has(badge.id) ? (
                          <div className="fallback_icon">🏅</div>
                        ) : (
                          <img src={badge.imageUrl} alt={badge.name} onError={() => {
                            setFailedImages(prev => new Set(prev).add(badge.id));
                          }} />
                        )
                      ) : (
                        <div className="locked_icon">🔒</div>
                      )}
                    </div>
                    <h3 className="badge_name">{badge.name}</h3>
                    <p className="badge_description">{badge.description}</p>
                    {badge.acquiredAt && (
                      <p className="badge_date">{new Date(badge.acquiredAt).toLocaleDateString('ko-KR')} 획득</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Missions Tab */
          <div id="missionsPage">
            {missions.length === 0 ? (
              <p className="empty_text">현재 진행 가능한 미션이 없어요.</p>
            ) : (
              <>
                {/* Active Missions (not yet earned) */}
                {missions.filter((m) => !m.acquiredAt).length > 0 && (
                  <div className="challenges_section">
                    <h2>진행 가능한 미션</h2>
                    <div className="challenges_list">
                      {missions.filter((m) => !m.acquiredAt).map((badge) => (
                        <div key={badge.id} className="challenge_card">
                          <div className="challenge_header">
                            <h3>{badge.name}</h3>
                            <span className="mission_type_badge">{getMissionTypeLabel(badge)}</span>
                          </div>
                          <p className="challenge_description">{badge.description}</p>

                          {/* Condition Info */}
                          <div className="mission_condition">
                            <span className="condition_label">{getConditionLabel(badge.conditionType)}</span>
                            {badge.conditionValue && (
                              <span className="condition_value">
                                목표: {badge.conditionValue}{getConditionUnit(badge.conditionType)}
                              </span>
                            )}
                          </div>

                          <div className="challenge_footer">
                            <div className="reward_info">
                              {badge.rewardGold && badge.rewardGold > 0 && (
                                <span className="reward_gold">🪙 {badge.rewardGold}G</span>
                              )}
                              {badge.isRepeatable && badge.repeatCycle && (
                                <span className="reward_badge">{getRepeatCycleLabel(badge.repeatCycle)} 반복</span>
                              )}
                            </div>
                            {badge.endDate && (
                              <span className="days_remaining">
                                {getDaysRemaining(badge.endDate) > 0
                                  ? `${getDaysRemaining(badge.endDate)}일 남음`
                                  : '오늘까지!'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Missions (earned) */}
                {missions.filter((m) => m.acquiredAt).length > 0 && (
                  <div className="challenges_section">
                    <h2>완료한 미션</h2>
                    <div className="challenges_list">
                      {missions.filter((m) => m.acquiredAt).map((badge) => (
                        <div key={badge.id} className="challenge_card completed">
                          <div className="challenge_header">
                            <h3>{badge.name}</h3>
                            <span className="completed_badge">✓ 완료</span>
                          </div>
                          <p className="challenge_description">{badge.description}</p>
                          <div className="challenge_footer">
                            <div className="reward_info">
                              {badge.rewardGold && badge.rewardGold > 0 && (
                                <span className="reward_gold">🪙 {badge.rewardGold}G</span>
                              )}
                            </div>
                            <span className="days_remaining">
                              {new Date(badge.acquiredAt!).toLocaleDateString('ko-KR')} 달성
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
}

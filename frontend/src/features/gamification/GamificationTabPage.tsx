import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../../services/gamificationService';
import type { Badge } from '../../services/gamificationService';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import { getBadgeIcon } from './badgeIcons';
import './GamificationPage.css';

type Tab = 'badges' | 'missions';

function getConditionUnit(type?: string | null): string {
  switch (type) {
    case 'WALK_DISTANCE_TOTAL': return 'km';
    default: return '회';
  }
}

const GoldReward = ({ amount, dimmed }: { amount: number; dimmed?: boolean }) => (
  <div className={`gm_gold_reward${dimmed ? ' dimmed' : ''}`}>
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={dimmed ? '#ccc' : '#C49A3C'} />
      <text
        x="10"
        y="14"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#fff"
      >
        G
      </text>
    </svg>
    <span className="gm_gold_amount">{amount}</span>
  </div>
);

export default function GamificationTabPage() {
  const location = useLocation();
  const initialTab: Tab = location.pathname === '/missions' ? 'missions' : 'badges';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: gamificationService.getAllBadges,
  });

  const earnedCount = badges?.filter((b) => b.acquiredAt).length ?? 0;
  const totalCount = badges?.length ?? 0;

  // Missions = badges with conditionType (achievable through actions)
  const missions = badges?.filter((b) => b.conditionType) ?? [];
  const activeMissions = missions.filter((m) => !m.acquiredAt);
  const completedMissions = missions.filter((m) => m.acquiredAt);

  return (
    <SubPageLayout title="뱃지 & 미션">
      {/* Tab bar */}
      <div className="gm_tab_bar">
        <button
          className={`gm_tab_btn${activeTab === 'badges' ? ' active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          뱃지
        </button>
        <button
          className={`gm_tab_btn${activeTab === 'missions' ? ' active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          미션
        </button>
        <div className="gm_tab_bar_line" />
      </div>

      {isLoading ? (
        <div className="gm_loading">로딩 중...</div>
      ) : activeTab === 'badges' ? (
        /* ── Badges Tab ── */
        <div className="gm_badges_page">
          {/* Progress card */}
          <div className="gm_progress_card">
            <div className="gm_progress_circle_wrap">
              <div className="gm_progress_circle">
                <span className="gm_progress_count">
                  <span className="gm_progress_earned">{earnedCount}</span>
                  <span className="gm_progress_denom">/{totalCount}</span>
                </span>
              </div>
            </div>
            <p className="gm_progress_desc">
              지금까지 {earnedCount}개의 뱃지를 획득했어요!
            </p>
          </div>

          {/* All badges grid */}
          <div className="gm_badges_section">
            <p className="gm_section_label">전체 뱃지</p>
            <div className="gm_badges_grid">
              {badges?.map((badge) => {
                const acquired = !!badge.acquiredAt;
                const icon = getBadgeIcon(badge.name);
                return (
                  <div key={badge.id} className={`gm_badge_card${acquired ? ' acquired' : ''}`}>
                    <div className={`gm_badge_icon_wrap${acquired ? ' acquired' : ''}`}>
                      {icon ? (
                        <img src={icon} alt={badge.name} className="gm_badge_icon_svg" />
                      ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="10" r="4" stroke="#A58A54" strokeWidth="1.5" />
                          <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" stroke="#A58A54" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <div className="gm_badge_info">
                      <p className="gm_badge_name">{badge.name}</p>
                      <p className="gm_badge_desc">{badge.description}</p>
                      {acquired && (
                        <p className="gm_badge_date_pill">
                          {new Date(badge.acquiredAt!).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '')} 획득
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Missions Tab ── */
        <div className="gm_missions_page">
          {missions.length === 0 ? (
            <p className="gm_empty_text">현재 진행 가능한 미션이 없어요.</p>
          ) : (
            <>
              {/* Active missions */}
              {activeMissions.length > 0 && (
                <div className="gm_section">
                  <p className="gm_section_label">진행 가능한 미션</p>
                  <div className="gm_mission_card">
                    {activeMissions.map((badge, idx) => (
                      <div key={badge.id}>
                        {idx > 0 && <div className="gm_mission_divider" />}
                        <MissionItem badge={badge} completed={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed missions */}
              {completedMissions.length > 0 && (
                <div className="gm_section">
                  <p className="gm_section_label">완료한 미션</p>
                  <div className="gm_mission_card gm_mission_card--completed">
                    {completedMissions.map((badge, idx) => (
                      <div key={badge.id}>
                        {idx > 0 && <div className="gm_mission_divider" />}
                        <MissionItem badge={badge} completed />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </SubPageLayout>
  );
}

function MissionItem({ badge, completed }: { badge: Badge; completed: boolean }) {
  const total = badge.conditionValue ?? 0;
  const current = completed ? total : 0;
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="gm_mission_item">
      <div className="gm_mission_title_row">
        <div className={`gm_mission_icon${completed ? ' completed' : ''}`}>
          {badge.imageUrl ? (
            <img src={badge.imageUrl} alt={badge.name} className="gm_mission_icon_img" />
          ) : (
            <span className="gm_mission_icon_emoji">🏆</span>
          )}
        </div>
        <div className="gm_mission_text_wrap">
          <p className="gm_mission_name">{badge.name}</p>
          <p className="gm_mission_desc">{badge.description}</p>
          {completed && badge.acquiredAt && (
            <p className="gm_mission_date">
              {new Date(badge.acquiredAt).toLocaleDateString('ko-KR')} 달성
            </p>
          )}
        </div>
        {badge.rewardGold != null && badge.rewardGold > 0 && (
          <GoldReward amount={badge.rewardGold} dimmed={completed} />
        )}
      </div>

      {!completed && total > 0 && (
        <div className="gm_mission_progress_wrap">
          <div className="gm_mission_progress_bg">
            <div
              className="gm_mission_progress_fill"
              style={{ width: `${pct}%` }}
            />
            <span className="gm_mission_progress_text">
              {current}/{total}{getConditionUnit(badge.conditionType)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

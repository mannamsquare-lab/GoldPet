import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../../services/gamificationService';
import type { Challenge } from '../../services/gamificationService';
import './GamificationPage.css';

export default function ChallengesPage() {
  const navigate = useNavigate();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: gamificationService.getActiveChallenges,
  });

  const getProgressPercent = (challenge: Challenge) => {
    if (!challenge.currentValue) return 0;
    return Math.min((challenge.currentValue / challenge.goalValue) * 100, 100);
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: '완료! 🎉', color: '#4CAF50' };
      case 'IN_PROGRESS':
        return { text: '진행 중', color: '#FF8AF5' };
      case 'FAILED':
        return { text: '실패', color: '#F44336' };
      default:
        return { text: '시작 전', color: '#999' };
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div id="challengesPage">
      {/* Header */}
      <div className="gamification_header">
        <button type="button" className="back_btn btn-effect" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1>챌린지</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Active Challenges */}
      <div className="challenges_section">
        <h2>진행 중인 챌린지</h2>
        <div className="challenges_list">
          {challenges?.filter((c) => c.status === 'IN_PROGRESS').map((challenge) => {
            const percent = getProgressPercent(challenge);
            const status = getStatusLabel(challenge.status);
            const daysRemaining = getDaysRemaining(challenge.endDate);

            return (
              <div key={challenge.id} className="challenge_card">
                <div className="challenge_header">
                  <h3>{challenge.title}</h3>
                  <span className="challenge_status" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>
                <p className="challenge_description">{challenge.description}</p>
                
                {/* Progress Bar */}
                <div className="progress_container">
                  <div className="progress_bar">
                    <div className="progress_fill" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="progress_text">
                    {challenge.currentValue || 0} / {challenge.goalValue}
                    {challenge.goalType === 'WALK_DISTANCE_TOTAL' ? 'km' : '회'}
                  </span>
                </div>

                {/* Rewards */}
                <div className="challenge_footer">
                  <div className="reward_info">
                    {challenge.rewardGold && (
                      <span className="reward_gold">🪙 {challenge.rewardGold}G</span>
                    )}
                    {challenge.rewardBadgeId && (
                      <span className="reward_badge">🏅 뱃지</span>
                    )}
                  </div>
                  <span className="days_remaining">
                    {daysRemaining > 0 ? `${daysRemaining}일 남음` : '오늘까지!'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Challenges */}
      <div className="challenges_section">
        <h2>참여 가능한 챌린지</h2>
        <div className="challenges_list">
          {challenges?.filter((c) => c.status === 'NOT_STARTED' || !c.status).length === 0 && (
            <p className="empty_text">현재 참여 가능한 챌린지가 없어요.</p>
          )}
          {challenges?.filter((c) => c.status === 'NOT_STARTED' || !c.status).map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge.endDate);

            return (
              <div key={challenge.id} className="challenge_card available">
                <div className="challenge_header">
                  <h3>{challenge.title}</h3>
                  <button type="button" className="join_btn btn-effect">참여하기</button>
                </div>
                <p className="challenge_description">{challenge.description}</p>
                
                <div className="challenge_footer">
                  <div className="reward_info">
                    {challenge.rewardGold && (
                      <span className="reward_gold">🪙 {challenge.rewardGold}G</span>
                    )}
                    {challenge.rewardBadgeId && (
                      <span className="reward_badge">🏅 뱃지</span>
                    )}
                  </div>
                  <span className="days_remaining">
                    {daysRemaining > 0 ? `${daysRemaining}일 남음` : '오늘까지!'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Challenges */}
      <div className="challenges_section">
        <h2>완료된 챌린지</h2>
        <div className="challenges_list">
          {challenges?.filter((c) => c.status === 'COMPLETED').length === 0 && (
            <p className="empty_text">아직 완료한 챌린지가 없어요.</p>
          )}
          {challenges?.filter((c) => c.status === 'COMPLETED').map((challenge) => (
            <div key={challenge.id} className="challenge_card completed">
              <div className="challenge_header">
                <h3>{challenge.title}</h3>
                <span className="completed_badge">✓ 완료</span>
              </div>
              <p className="challenge_description">{challenge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

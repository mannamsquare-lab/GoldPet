import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../../services/gamificationService';
import './GamificationPage.css';

export default function BadgesPage() {
  const navigate = useNavigate();

  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', 'all'],
    queryFn: gamificationService.getAllBadges,
  });

  const earnedCount = badges?.filter((b) => b.isEarned).length || 0;
  const totalCount = badges?.length || 0;

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div id="badgesPage">
      {/* Header */}
      <div className="gamification_header">
        <button type="button" className="back_btn btn-effect" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1>획득한 뱃지</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* Progress Summary */}
      <div className="progress_summary">
        <div className="progress_circle">
          <span className="progress_value">{earnedCount}/{totalCount}</span>
          <span className="progress_label">획득</span>
        </div>
        <p className="progress_text">지금까지 {earnedCount}개의 뱃지를 획득했어요!</p>
      </div>

      {/* Badges Grid */}
      <div className="badges_section">
        <h2>전체 뱃지</h2>
        <div className="badges_grid">
          {badges?.map((badge) => (
            <div key={badge.id} className={`badge_card ${badge.isEarned ? 'earned' : 'locked'}`}>
              <div className="badge_icon">
                {badge.isEarned ? (
                  <img src={badge.imageUrl} alt={badge.name} onError={(e) => {
                    (e.target as HTMLImageElement).textContent = '🏅';
                  }} />
                ) : (
                  <div className="locked_icon">🔒</div>
                )}
              </div>
              <h3 className="badge_name">{badge.name}</h3>
              <p className="badge_description">{badge.description}</p>
              {badge.isEarned && badge.earnedAt && (
                <p className="badge_date">{badge.earnedAt} 획득</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

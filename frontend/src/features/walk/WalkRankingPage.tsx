import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walkService } from '../../services/walkService';
import './WalkRankingPage.css';

const WalkRankingPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const { data: rankings = [] } = useQuery({
    queryKey: ['walk', 'ranking', period],
    queryFn: () => walkService.getWalkRanking(period),
  });

  const bestCouple = rankings[0];
  const restRankings = rankings.slice(1);

  return (
    <div className="walk-ranking-page">
      {/* Header */}
      <div className="walk-ranking-header">
        <button type="button" onClick={() => navigate('/walk')} className="back-btn">
          <img src="/assets/images/common/back_icon.svg" alt="뒤로가기" />
        </button>
        <h1>산책 랭킹</h1>
        <div style={{ width: '6.67vw' }} />
      </div>

      {/* Period Tabs */}
      <ul className="record_tab">
        <li>
          <button
            type="button"
            className={period === 'weekly' ? 'active' : ''}
            onClick={() => setPeriod('weekly')}
          >
            주간 랭킹
          </button>
        </li>
        <li>
          <button
            type="button"
            className={period === 'monthly' ? 'active' : ''}
            onClick={() => setPeriod('monthly')}
          >
            월간 랭킹
          </button>
        </li>
      </ul>

      {/* Best Couple */}
      {bestCouple && (
        <div className="best_couple">
          <p className="tit">
            <img src="/assets/images/walk/best_icon.svg" alt="" />
            BEST 산책 커플
          </p>
          <div className="couple_img">
            <div className="blob_avatar">
              <img
                src={bestCouple.profileImageUrl || '/assets/images/default_avatar.png'}
                alt={bestCouple.nickname}
              />
            </div>
            <div className="blob_avatar">
              <img
                src={bestCouple.profileImageUrl || '/assets/images/default_avatar.png'}
                alt={bestCouple.nickname}
              />
            </div>
          </div>
          <button type="button" className="couple_btn">
            {bestCouple.nickname}
          </button>
          <dl className="couple_detail">
            <div>
              <dt>총 거리(km)</dt>
              <dd>{bestCouple.totalDistanceKm.toFixed(1)}</dd>
            </div>
            <div>
              <dt>산책 횟수</dt>
              <dd>{bestCouple.walkCount}회</dd>
            </div>
            <div>
              <dt>총 적립(Gold)</dt>
              <dd>{Math.floor(bestCouple.totalDistanceKm * 10)}G</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Ranking List */}
      <ul className="ranking_list">
        {restRankings.map((entry) => (
          <li key={entry.userId}>
            <div className="ranking_img">
              <div className="blob_avatar">
                <img
                  src={entry.profileImageUrl || '/assets/images/default_avatar.png'}
                  alt={entry.nickname}
                />
              </div>
              <p className="count_txt">{entry.rank}</p>
            </div>
            <div className="ranking_txt">
              <p className="name">{entry.nickname}</p>
              <p className="stats">
                {entry.totalDistanceKm.toFixed(1)} km · {entry.walkCount}회 · {Math.floor(entry.totalDistanceKm * 10)}G 적립
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalkRankingPage;

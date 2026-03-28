import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MainHeader } from '../../components/common/MainHeader';
import { petService } from '../../services/petService';
import { stoolAnalysisService } from '../../services/stoolAnalysisService';
import type { StoolAnalysisResponse } from '../../services/stoolAnalysisService';
import { HealthDetailModal } from './HealthDetailModal';
import './HealthHistoryPage.css';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function monthLabel(yearMonth: string): string {
  const month = parseInt(yearMonth.split('-')[1], 10);
  return `${month}월`;
}

function scoreColor(score: number | null): string {
  if (score == null) return '#AAAAAA';
  if (score <= 2) return '#FF5005';
  if (score === 3) return '#F5A623';
  return '#4CAF50';
}

const HealthHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const paramPetId = searchParams.get('petId') ? Number(searchParams.get('petId')) : null;

  const [selectedPetId, setSelectedPetId] = useState<number | null>(paramPetId);
  const [page, setPage] = useState(0);
  const [allAnalyses, setAllAnalyses] = useState<StoolAnalysisResponse[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<StoolAnalysisResponse | null>(null);

  const { data: myPets } = useQuery({
    queryKey: ['pets', 'my'],
    queryFn: petService.getMyPets,
  });

  // Set initial pet once pets are loaded
  useEffect(() => {
    if (selectedPetId == null && myPets && myPets.length > 0) {
      setSelectedPetId(myPets[0].id);
    }
  }, [myPets, selectedPetId]);

  const activePetId = selectedPetId ?? null;

  const { data: historyPage, isFetching: historyLoading } = useQuery({
    queryKey: ['health', 'history', activePetId, page],
    queryFn: () => stoolAnalysisService.getAnalysisHistory(activePetId!, page),
    enabled: activePetId != null,
  });

  // Accumulate pages
  useEffect(() => {
    if (!historyPage) return;
    if (page === 0) {
      setAllAnalyses(historyPage.content);
    } else {
      setAllAnalyses(prev => [...prev, ...historyPage.content]);
    }
  }, [historyPage, page]);

  const { data: trend } = useQuery({
    queryKey: ['health', 'trend', activePetId],
    queryFn: () => stoolAnalysisService.getHealthTrend(activePetId!, 6),
    enabled: activePetId != null,
  });

  const handlePetChange = (petId: number) => {
    setSelectedPetId(petId);
    setPage(0);
    setAllAnalyses([]);
  };

  const trendData = (trend?.monthlyScores ?? []).map(m => ({
    name: monthLabel(m.yearMonth),
    score: parseFloat(m.averageScore.toFixed(1)),
  }));

  const hasMore = historyPage ? !historyPage.last : false;

  return (
    <div className="hh_page">
      <MainHeader variant="back-only" className="intro_header" />

      {/* Disclaimer banner */}
      <div className="hh_disclaimer_banner">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="7" stroke="#92400E" strokeWidth="1.5" />
          <path d="M8 5v4M8 11v.5" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>AI 분석은 참고용이며, 정확한 진단은 수의사와 상담하세요.</span>
      </div>

      <div className="hh_container">
        <h1 className="hh_page_title">건강 분석 기록</h1>

        {/* Pet tabs */}
        {myPets && myPets.length > 0 && (
          <div className="hh_pet_tabs">
            {myPets.map(pet => (
              <button
                key={pet.id}
                type="button"
                className={`hh_pet_tab${activePetId === pet.id ? ' active' : ''}`}
                onClick={() => handlePetChange(pet.id)}
              >
                {pet.profileImageUrl ? (
                  <img src={pet.profileImageUrl} alt={pet.name} className="hh_pet_tab_img" />
                ) : (
                  <div className="hh_pet_tab_img hh_pet_tab_img--placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#614108" strokeWidth="1.8" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#614108" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <span className="hh_pet_tab_name">{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Trend chart */}
        {trendData.length > 0 && (
          <div className="hh_trend_card">
            <h2 className="hh_trend_title">최근 6개월 건강 추이</h2>
            <div className="hh_trend_chart">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFE1C4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A58A54' }} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#A58A54' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #EFE1C4', fontSize: 13 }}
                    formatter={(value) => [`${value}점`, '평균 점수']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#614108"
                    strokeWidth={2}
                    dot={{ fill: '#614108', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Analysis list */}
        <div className="hh_list_section">
          <h2 className="hh_list_title">분석 기록</h2>

          {!historyLoading && allAnalyses.length === 0 ? (
            <div className="hh_empty">
              <div className="hh_empty_icon">💩</div>
              <p className="hh_empty_text">아직 분석 기록이 없습니다</p>
              <p className="hh_empty_sub">
                산책 중 대변 사진을 촬영하면<br />AI가 건강 상태를 분석해 드려요
              </p>
            </div>
          ) : (
            <>
              <div className="hh_list">
                {allAnalyses.map(analysis => (
                  <button
                    key={analysis.id}
                    type="button"
                    className="hh_list_item"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="hh_list_item_thumb">
                      <img src={analysis.imageUrl} alt="분석 이미지" className="hh_list_item_img" />
                      {(analysis.status === 'PENDING' || analysis.status === 'PROCESSING') && (
                        <div className="hh_list_item_overlay">분석 중</div>
                      )}
                    </div>
                    <div className="hh_list_item_info">
                      <span className="hh_list_item_date">{formatDate(analysis.createdAt)}</span>
                      {analysis.status === 'COMPLETED' && analysis.overallScore != null ? (
                        <>
                          <span
                            className="hh_list_item_score_badge"
                            style={{ backgroundColor: scoreColor(analysis.overallScore) }}
                          >
                            {analysis.overallScore}점
                          </span>
                          {analysis.healthSummary && (
                            <p className="hh_list_item_summary">{analysis.healthSummary}</p>
                          )}
                        </>
                      ) : analysis.status === 'PENDING' || analysis.status === 'PROCESSING' ? (
                        <span className="hh_list_item_status">분석 중...</span>
                      ) : analysis.status === 'FAILED' ? (
                        <span className="hh_list_item_status hh_list_item_status--fail">분석 실패</span>
                      ) : null}
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="hh_list_item_arrow">
                      <path d="M1 1l6 6-6 6" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
              {hasMore && (
                <button
                  type="button"
                  className="hh_load_more_btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={historyLoading}
                >
                  {historyLoading ? '로딩 중...' : '더 보기'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {selectedAnalysis && (
        <HealthDetailModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
};

export default HealthHistoryPage;

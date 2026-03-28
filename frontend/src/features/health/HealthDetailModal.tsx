import React from 'react';
import type { StoolAnalysisResponse } from '../../services/stoolAnalysisService';

interface Props {
  analysis: StoolAnalysisResponse;
  onClose: () => void;
}

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreColor(score: number | null): string {
  if (score == null) return '#AAAAAA';
  if (score <= 2) return '#FF5005';
  if (score === 3) return '#F5A623';
  return '#4CAF50';
}

function scoreLabel(score: number | null): string {
  if (score == null) return '-';
  if (score <= 2) return '주의';
  if (score === 3) return '보통';
  return '양호';
}

const ScoreBar: React.FC<{
  label: string;
  score: number | null;
  assessment: string | null;
}> = ({ label, score, assessment }) => {
  const pct = score != null ? (score / 5) * 100 : 0;
  return (
    <div className="hd_score_item">
      <div className="hd_score_header">
        <span className="hd_score_name">{label}</span>
        <span className="hd_score_value" style={{ color: scoreColor(score) }}>
          {score != null ? `${score}/5` : '-'}
        </span>
      </div>
      <div className="hd_score_bar_bg">
        <div
          className="hd_score_bar_fill"
          style={{ width: `${pct}%`, backgroundColor: scoreColor(score) }}
        />
      </div>
      {assessment && <p className="hd_score_assessment">{assessment}</p>}
    </div>
  );
};

export const HealthDetailModal: React.FC<Props> = ({ analysis, onClose }) => {
  const tips = parseJsonArray(analysis.healthTips);
  const warnings = parseJsonArray(analysis.warnings);

  return (
    <div className="hd_overlay" onClick={onClose}>
      <div className="hd_modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="hd_modal_header">
          <h2 className="hd_modal_title">건강 분석 결과</h2>
          <button type="button" className="hd_modal_close" onClick={onClose} aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="hd_modal_body">
          {/* Photo */}
          <div className="hd_photo_wrap">
            <img src={analysis.imageUrl} alt="분석 이미지" className="hd_photo" />
          </div>

          {/* Overall score */}
          <div className="hd_overall_wrap">
            <span className="hd_overall_label">종합 점수</span>
            <div className="hd_overall_row">
              <span className="hd_overall_score" style={{ color: scoreColor(analysis.overallScore) }}>
                {analysis.overallScore != null ? analysis.overallScore : '-'}
                <span className="hd_overall_max">/5</span>
              </span>
              <span className="hd_overall_badge" style={{ backgroundColor: scoreColor(analysis.overallScore) }}>
                {scoreLabel(analysis.overallScore)}
              </span>
            </div>
          </div>

          {/* Summary */}
          {analysis.healthSummary && (
            <p className="hd_summary">{analysis.healthSummary}</p>
          )}

          {/* 4C scores */}
          <div className="hd_scores_section">
            <h3 className="hd_section_title">4C 분석</h3>
            <ScoreBar label="색상 (Color)" score={analysis.colorScore} assessment={analysis.colorAssessment} />
            <ScoreBar label="농도 (Consistency)" score={analysis.consistencyScore} assessment={analysis.consistencyAssessment} />
            <ScoreBar label="코팅 (Coating)" score={analysis.coatingScore} assessment={analysis.coatingAssessment} />
            <ScoreBar label="내용물 (Contents)" score={analysis.contentsScore} assessment={analysis.contentsAssessment} />
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="hd_warnings_section">
              <h3 className="hd_section_title hd_section_title--warn">⚠️ 주의사항</h3>
              <ul className="hd_warning_list">
                {warnings.map((w, i) => (
                  <li key={i} className="hd_warning_item">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="hd_tips_section">
              <h3 className="hd_section_title">건강 팁</h3>
              <ul className="hd_tips_list">
                {tips.map((tip, i) => (
                  <li key={i} className="hd_tips_item">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="hd_disclaimer">
            <p>{analysis.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walkService, getTodayStats } from '../../services/walkService';
import type { WalkRecord } from '../../services/walkService';
import { WalkRouteThumbnail } from './components/WalkRouteThumbnail';
import './WalkPage.css';

export const WalkPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'records' | 'ranking'>('records');

    const { data: walkRecords = [] } = useQuery({
        queryKey: ['walk', 'records'],
        queryFn: () => walkService.getWalkRecords(),
    });

    const todayStats = getTodayStats(walkRecords);

    return (
        <div id="walkContainer">
            <div className="walk_content">
                {/* Today Stats Section */}
                <div className="walk_today_section">
                    <div className="walk_today_card">
                        <div className="walk_today_title">
                            오늘
                        </div>
                        <div className="walk_today_stats">
                            <div className="walk_stat_item">
                                <div className="walk_stat_content">
                                    <span className="walk_stat_label">산책 거리(km)</span>
                                    <span className="walk_stat_value">{todayStats.distance.toFixed(2)}</span>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18l6-6-6-6" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="walk_stat_item">
                                <div className="walk_stat_content">
                                    <span className="walk_stat_label">소요 칼로리(Kcal)</span>
                                    <span className="walk_stat_value">{todayStats.calories.toLocaleString()}</span>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18l6-6-6-6" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="walk_start_btn"
                        onClick={() => navigate('/walk/map')}
                    >
                        지금 바로 산책을 시작해볼까요?
                    </button>
                </div>

                {/* Records / Ranking Tabs */}
                <div className="walk_records_section">
                    <div className="walk_tabs">
                        <button
                            type="button"
                            className={`walk_tab${activeTab === 'records' ? ' active' : ''}`}
                            onClick={() => setActiveTab('records')}
                        >
                            우리의 산책 기록
                        </button>
                        <button
                            type="button"
                            className={`walk_tab${activeTab === 'ranking' ? ' active' : ''}`}
                            onClick={() => setActiveTab('ranking')}
                        >
                            베스트 랭킹
                        </button>
                    </div>

                    {/* Records Tab */}
                    {activeTab === 'records' && (
                        <div className="walk_records_list">
                            <div className="walk_records_card">
                                {walkRecords.map((record: WalkRecord, index: number) => (
                                    <div key={record.id}>
                                        <WalkRecordItem
                                            record={record}
                                            onClick={() => navigate(`/walk/detail/${record.id}`)}
                                        />
                                        {index < walkRecords.length - 1 && (
                                            <div className="walk_record_divider" />
                                        )}
                                    </div>
                                ))}
                                {walkRecords.length === 0 && (
                                    <p style={{ color: '#727272', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                                        아직 산책 기록이 없습니다.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ranking Tab */}
                    {activeTab === 'ranking' && (
                        <>
                            <div className="best_rank">
                                <div className="best_couple">
                                    <p className="tit">
                                        <img src="/assets/images/walk/best_icon.svg" alt="" />
                                        BEST 산책 커플
                                    </p>
                                    <div className="couple_img">
                                        <div className="profile_img profile_img01">
                                            <img src="/assets/images/main/main_slide_butler01.jpg" alt="" />
                                        </div>
                                        <div className="profile_img profile_img02">
                                            <img src="/assets/images/main/main_slide_butler02.png" alt="" />
                                        </div>
                                    </div>
                                    <button type="button" className="couple_btn">
                                        망고
                                        <img src="/assets/images/walk/best_icon02.svg" alt="" />
                                        난완전멋쟁이
                                    </button>
                                    <div className="couple_detail">
                                        <dl>
                                            <dt>총 거리(km)</dt>
                                            <dd>1.0</dd>
                                        </dl>
                                        <dl>
                                            <dt>총 시간(분)</dt>
                                            <dd>1,680</dd>
                                        </dl>
                                        <dl>
                                            <dt>총 적립(Gold)</dt>
                                            <dd>10</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <ul className="ranking_list">
                                <li>
                                    <div className="ranking_img">
                                        <div className="profile_img profile_img01">
                                            <img src="/assets/images/main/main_slide_butler01.jpg" alt="" />
                                        </div>
                                        <div className="profile_img profile_img02">
                                            <img src="/assets/images/main/main_slide_butler02.png" alt="" />
                                        </div>
                                        <p className="count_txt">2</p>
                                    </div>
                                    <div className="ranking_txt">
                                        <strong>개똥이와 똥개</strong>
                                        <div className="txt_wrap">
                                            <div className="txt01">
                                                <p>1.0 Km</p>
                                                <p>총 30분</p>
                                            </div>
                                            <p>10G 적립</p>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="ranking_img">
                                        <div className="profile_img profile_img01">
                                            <img src="/assets/images/main/main_slide_butler01.jpg" alt="" />
                                        </div>
                                        <div className="profile_img profile_img02">
                                            <img src="/assets/images/main/main_slide_butler02.png" alt="" />
                                        </div>
                                        <p className="count_txt">2</p>
                                    </div>
                                    <div className="ranking_txt">
                                        <strong>개똥이와 똥개</strong>
                                        <div className="txt_wrap">
                                            <div className="txt01">
                                                <p>1.0 Km</p>
                                                <p>총 30분</p>
                                            </div>
                                            <p>10G 적립</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>

                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/walk/ranking')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                    }}
                                >
                                    전체 랭킹 보기 →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

interface WalkRecordItemProps {
    record: WalkRecord;
    onClick: () => void;
}

function WalkRecordItem({ record, onClick }: WalkRecordItemProps) {
    return (
        <div className="walk_record_item" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {/* Route thumbnail */}
                <WalkRouteThumbnail walkId={record.id} hasPath={!!record.path?.length} size={60} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Date row + share button */}
                    <div className="walk_record_header" style={{ justifyContent: 'space-between' }}>
                        <span className="walk_record_date">{record.date}</span>
                        <div className="walk_record_actions" onClick={e => e.stopPropagation()}>
                            <button type="button" className="walk_record_action_btn" title="공유">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" rx="12" fill="#FFE5FA"/>
                                    <path d="M6 13.5V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V13.5" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 15V6M12 6L8.625 9.375M12 6L15.375 9.375" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="walk_record_stats">
                        <span>{record.distance}</span>
                        <svg width="3" height="3" viewBox="0 0 3 3">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#614108" />
                        </svg>
                        <span>{record.duration}</span>
                        <svg width="3" height="3" viewBox="0 0 3 3">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#614108" />
                        </svg>
                        <span>{record.points}</span>
                    </div>

                    {/* Location */}
                    {record.startAddress && (
                        <span className="walk_record_location">
                            {`${record.startAddress} ~ ${record.endAddress || '미지정'}`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WalkPage;

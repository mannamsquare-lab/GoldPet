
import { useState } from 'react';
import './WalkPage.css';

interface WalkRecord {
    id: number;
    date: string;
    distance: string;
    duration: string;
    points: string;
}

const WalkPage = () => {
    const [activeTab, setActiveTab] = useState('records'); // 'records', 'ranking'

    // Dummy data
    const todayStats = {
        distance: '1.25',
        calories: '1,250',
    };

    const walkRecords: WalkRecord[] = [
        { id: 1, date: '2025.10.28', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
        { id: 2, date: '2025.10.28', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
        { id: 3, date: '2025.10.28', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
        { id: 4, date: '2025.10.28', distance: '1.0 Km', duration: '총 30분', points: '10G 적립' },
    ];

    return (
        <div id="walkPage">
            {/* Header - talk_wrap과 동일 */}
            <div className="walk_header">
                <p>골드펫과 함께<br/>즐거운 산책을 즐겨보세요.</p>
                <button type="button" className="btn-effect">
                    <img src="/assets/images/common/pin_icon.svg" alt="지도 마커" />
                    서울 강남구
                </button>
            </div>

            {/* Content */}
            <div className="walk_content">
                {/* Today Stats Card */}
                <div className="walk_today_section">
                    <div className="walk_today_card">
                        {/* Stats Content */}
                        <div className="walk_today_title">오늘</div>
                        <div className="walk_today_stats">
                            <div className="walk_stat_item">
                                <div className="walk_stat_content">
                                    <div className="walk_stat_label">산책 거리(km)</div>
                                    <div className="walk_stat_value">{todayStats.distance}</div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 6L15 12L9 18" stroke="#614108" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div className="walk_stat_item">
                                <div className="walk_stat_content">
                                    <div className="walk_stat_label">소요 칼로리(Kcal)</div>
                                    <div className="walk_stat_value">{todayStats.calories}</div>
                                </div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 6L15 12L9 18" stroke="#614108" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Start Walk Button */}
                    <button type="button" className="walk_start_btn btn-effect">
                        지금 바로 산책을 시작해볼까요?
                    </button>
                </div>

                {/* Tabs and Records */}
                <div className="walk_records_section">
                    {/* Tabs */}
                    <div className="walk_tabs">
                        <button
                            type="button"
                            className={`walk_tab ${activeTab === 'records' ? 'active' : ''} btn-effect`}
                            onClick={() => setActiveTab('records')}
                        >
                            우리의 산책 기록
                        </button>
                        <button
                            type="button"
                            className={`walk_tab ${activeTab === 'ranking' ? 'active' : ''} btn-effect`}
                            onClick={() => setActiveTab('ranking')}
                        >
                            베스트 랭킹
                        </button>
                    </div>

                    {/* Records List */}
                    {activeTab === 'records' && (
                        <div className="walk_records_list">
                            <div className="walk_records_card">
                                {walkRecords.map((record, index) => (
                                    <div key={record.id}>
                                        <div className="walk_record_item">
                                            <div className="walk_record_header">
                                                <div className="walk_record_icon">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <circle cx="8" cy="8" r="8" fill="#FF8AF5"/>
                                                        <path d="M8.00391 11.4053C6.56568 11.4053 5.37331 12.8404 4.64941 11.25C4.63895 11.2166 3.95543 9.65193 6.08789 8.86523C6.81802 7.88297 7.07445 7.42969 8.00391 7.42969V11.4053ZM8.00684 7.42969C8.93594 7.42983 9.19284 7.88312 9.92285 8.86523C12.0579 9.65299 11.369 11.2206 11.3604 11.25C10.6365 12.8403 9.44486 11.4056 8.00684 11.4053V7.42969Z" fill="white" fillOpacity="0.7"/>
                                                        <ellipse cx="6.66431" cy="5.71384" rx="1.06665" ry="1.71384" fill="white" fillOpacity="0.7"/>
                                                        <ellipse cx="4.79999" cy="7.71336" rx="0.799991" ry="1.4282" fill="white" fillOpacity="0.7"/>
                                                        <ellipse cx="11.2004" cy="7.71336" rx="0.799991" ry="1.4282" fill="white" fillOpacity="0.7"/>
                                                        <ellipse cx="9.36646" cy="5.71384" rx="1.06665" ry="1.71384" fill="white" fillOpacity="0.7"/>
                                                    </svg>
                                                </div>
                                                <div className="walk_record_date">{record.date}</div>
                                            </div>
                                            <div className="walk_record_info">
                                                <div className="walk_record_stats">
                                                    <span>{record.distance}</span>
                                                    <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
                                                        <circle cx="1.5" cy="1.5" r="1.5" fill="#614108"/>
                                                    </svg>
                                                    <span>{record.duration}</span>
                                                    <svg width="3" height="3" viewBox="0 0 3 3" fill="none">
                                                        <circle cx="1.5" cy="1.5" r="1.5" fill="#614108"/>
                                                    </svg>
                                                    <span>{record.points}</span>
                                                </div>
                                                <div className="walk_record_actions">
                                                    <button type="button" className="walk_record_action_btn btn-effect">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <rect width="24" height="24" rx="12" fill="#FFE5FA"/>
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 5C14.7614 5 17 7.50721 17 10.6C17 13.6928 14.1875 17.95 12 19C9.8125 17.95 7 13.6928 7 10.6C7 7.50721 9.23858 5 12 5ZM12 7.8C10.6193 7.8 9.5 9.0536 9.5 10.6C9.5 12.1464 10.6193 13.4 12 13.4C13.3807 13.4 14.5 12.1464 14.5 10.6C14.5 9.0536 13.3807 7.8 12 7.8Z" fill="#8A497D"/>
                                                        </svg>
                                                    </button>
                                                    <button type="button" className="walk_record_action_btn btn-effect">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <rect width="24" height="24" rx="12" fill="#FFE5FA"/>
                                                            <path d="M6 13.5V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V13.5" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                                            <path d="M12 15V6M12 6L8.625 9.375M12 6L15.375 9.375" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {index < walkRecords.length - 1 && (
                                            <div className="walk_record_divider"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ranking - placeholder */}
                    {activeTab === 'ranking' && (
                        <div className="walk_ranking_placeholder">
                            <p>베스트 랭킹 기능은 준비 중입니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalkPage;


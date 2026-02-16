import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walkService } from '../../services/walkService';
import { LocationStatus } from '../../components/common/LocationStatus';
import './WalkPage.css';

export const WalkPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'records' | 'ranking'>('records');

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ['walk', 'stats'],
        queryFn: () => walkService.getWalkStats(),
    });

    // Fetch Records
    const { data: walkRecords = [] } = useQuery({
        queryKey: ['walk', 'records'],
        queryFn: () => walkService.getWalkRecords(),
    });

    return (
        <div id="walkContainer">
            {/* Header / Talk Wrap */}
            {/* Header / Talk Wrap */}
            <LocationStatus>
                골드펫과 함께 <br />
                즐거운 산책을 즐겨보세요.
            </LocationStatus>

            {/* Top Card (Walk Stats) */}
            <div className="walk_tit">
                <div className="walk_card">
                    <p>오늘</p>
                    <div className="card_detail">
                        <dl>
                            <dt>산책 거리(km)</dt>
                            <dd>{stats?.todayDistance || '0.0'}</dd>
                        </dl>
                        <dl>
                            <dt>소요 칼로리(Kcal)</dt>
                            <dd>{stats?.todayCalories || '0'}</dd>
                        </dl>
                    </div>
                </div>
                <button type="button" className="walk_go_link" onClick={() => navigate('/walk/map')}>
                    지금 바로 산책을 시작해볼까요?
                </button>
            </div>

            <div className="record_wrap">
                <ul className="record_tab">
                    <li>
                        <button 
                            type="button" 
                            className={activeTab === 'records' ? 'active' : ''}
                            onClick={() => setActiveTab('records')}
                        >
                            우리의 산책 기록
                        </button>
                    </li>
                    <li>
                        <button 
                            type="button" 
                            className={activeTab === 'ranking' ? 'active' : ''}
                            onClick={() => setActiveTab('ranking')}
                        >
                            베스트 랭킹
                        </button>
                    </li>
                </ul>

                {/* Records List Tab */}
                {activeTab === 'records' && (
                    <ul className="record_list">
                        {walkRecords?.map((record) => (
                            <li key={record.id} onClick={() => navigate(`/walk/detail/${record.id}`)}>
                                <p className="date_txt">{record.date}</p>
                                <div className="detail_txt">
                                    <div className="list_txt">
                                        <p>{record.distance}</p>
                                        <p>{record.duration}</p>
                                        <p>{record.points}</p>
                                    </div>
                                    <div className="btn_wrap">
                                        <button type="button">
                                            <img src="/assets/images/walk/map_icon.svg" alt="" />
                                        </button>
                                        <button type="button">
                                            <img src="/assets/images/walk/upload_icon.svg" alt="" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
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
                            {/* Static content for now based on HTML */}
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
                            {/* Duplicate items for visual as per HTML */}
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

                        <div style={{ textAlign: 'center', padding: '4.44vw 0' }}>
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
                                    cursor: 'pointer'
                                }}
                            >
                                전체 랭킹 보기 →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WalkPage;


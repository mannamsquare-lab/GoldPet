import { useState, useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walkService } from '../../services/walkService';
import type { WalkRecord } from '../../services/walkService';
import { WalkRouteThumbnail } from '../walk/components/WalkRouteThumbnail';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import '../walk/WalkPage.css';

function getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const MyWalkPage = () => {
    const navigate = useNavigate();
    const [yearMonth, setYearMonth] = useState<string>(getCurrentYearMonth());
    const currentYearMonth = getCurrentYearMonth();

    function prevMonth() {
        const [y, m] = yearMonth.split('-').map(Number);
        const d = new Date(y, m - 2, 1);
        setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    function nextMonth() {
        const [y, m] = yearMonth.split('-').map(Number);
        const d = new Date(y, m, 1);
        setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['walk', 'my', 'paged', yearMonth],
        queryFn: ({ pageParam = 0 }) => walkService.getWalkRecordsPaged(pageParam, 10, yearMonth),
        getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
        initialPageParam: 0,
    });

    const walkRecords = data?.pages.flatMap(p => p.content) ?? [];

    const sentinelRef = useRef<HTMLDivElement>(null);
    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleIntersect]);

    return (
        <SubPageLayout title="내 산책기록" onBack={() => navigate(-1)}>
            <div id="walkContainer">
                <div className="walk_content">
                    <div className="walk_records_list">
                        <div className="walk_month_selector">
                            <button type="button" className="walk_month_arrow" onClick={prevMonth}>
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                    <path d="M7 1L1 7L7 13" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <span className="walk_month_label">
                                {yearMonth.replace('-', '.')}
                            </span>
                            <button
                                type="button"
                                className="walk_month_arrow"
                                onClick={nextMonth}
                                disabled={yearMonth >= currentYearMonth}
                                style={{ opacity: yearMonth >= currentYearMonth ? 0.3 : 1 }}
                            >
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                    <path d="M1 1L7 7L1 13" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="walk_records_card">
                            {walkRecords.map((record: WalkRecord, index: number) => (
                                <div key={record.id}>
                                    <MyWalkRecordItem
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
                        {isFetchingNextPage && (
                            <p style={{ color: '#727272', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
                                불러오는 중...
                            </p>
                        )}
                        <div ref={sentinelRef} style={{ height: 1 }} />
                    </div>
                </div>
            </div>
        </SubPageLayout>
    );
};

function MyWalkRecordItem({ record, onClick }: { record: WalkRecord; onClick: () => void }) {
    return (
        <div className="walk_record_item" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <WalkRouteThumbnail walkId={record.id} hasPath={record.hasPath ?? !!record.path?.length} size={60} />

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="walk_record_header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="walk_record_date">
                                {record.date}
                                {record.startTime && (() => {
                                    const d = new Date(record.startTime!);
                                    return ` ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                                })()}
                            </span>
                            {record.isPublic === false && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    fontSize: 10,
                                    color: '#999',
                                    background: '#f5f5f5',
                                    borderRadius: 4,
                                    padding: '1px 5px',
                                }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    비공개
                                </span>
                            )}
                        </div>
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

export default MyWalkPage;

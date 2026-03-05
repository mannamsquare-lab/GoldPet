import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { goldService } from '../../services/goldService';
import GoldBalanceCard from './components/GoldBalanceCard';
import TransactionItem from './components/TransactionItem';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import { CACHE_TIME } from '../../config/queryConfig';
import './GoldPage.css';

type FilterType = 'ALL' | 'CHARGE' | 'SPEND' | 'REWARD' | 'REFUND';

function GoldMainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'charge' | 'history'>('charge');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(0);

  const { data: balanceData } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: goldService.getBalance,
    ...CACHE_TIME.DYNAMIC,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['gold', 'transactions', filter, page],
    queryFn: () => goldService.getTransactions(page, 20, filter === 'ALL' ? undefined : filter),
    ...CACHE_TIME.DYNAMIC,
    enabled: activeTab === 'history',
  });

  const balance = balanceData?.balance ?? 0;
  const transactions = transactionsData?.content ?? [];
  const totalPages = transactionsData?.totalPages ?? 0;
  const hasMore = page < totalPages - 1;

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <SubPageLayout title="골드">
    <div className="gold-container">
      <GoldBalanceCard balance={balance} />

      <div className="gold-tabs">
        <button
          className={`gold-tab${activeTab === 'charge' ? ' active' : ''}`}
          onClick={() => setActiveTab('charge')}
        >
          충전하기
        </button>
        <button
          className={`gold-tab${activeTab === 'history' ? ' active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          사용내역
        </button>
      </div>

      {activeTab === 'charge' && (
        <div className="gold-charge-content">
          <button className="gold-charge-btn" onClick={() => navigate('/gold/purchase')}>
            골드 스토어로 이동
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="gold-filter-tabs">
            <button className={filter === 'ALL' ? 'active' : ''} onClick={() => handleFilterChange('ALL')}>전체</button>
            <button className={filter === 'CHARGE' ? 'active' : ''} onClick={() => handleFilterChange('CHARGE')}>충전</button>
            <button className={filter === 'SPEND' ? 'active' : ''} onClick={() => handleFilterChange('SPEND')}>사용</button>
            <button className={filter === 'REWARD' ? 'active' : ''} onClick={() => handleFilterChange('REWARD')}>적립</button>
            <button className={filter === 'REFUND' ? 'active' : ''} onClick={() => handleFilterChange('REFUND')}>환불</button>
          </div>

          <div>
            {transactions.length === 0 && (
              <p style={{ color: '#727272', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                내역이 없습니다.
              </p>
            )}
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {hasMore && (
            <div className="gold-load-more">
              <button onClick={() => setPage((prev) => prev + 1)} className="gold-load-more-btn">
                더 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </SubPageLayout>
  );
}

export default GoldMainPage;

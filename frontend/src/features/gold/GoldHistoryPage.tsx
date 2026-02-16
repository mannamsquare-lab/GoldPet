import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { goldService } from '../../services/goldService';
import TransactionItem from './components/TransactionItem';
import './GoldPage.css';

type FilterType = 'ALL' | 'CHARGE' | 'SPEND' | 'EARN';

function GoldHistoryPage() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(0);

  const { data: balanceData } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: goldService.getBalance,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['gold', 'transactions', filter, page],
    queryFn: () => goldService.getTransactions(page, 20),
  });

  const balance = balanceData?.balance ?? 0;
  const transactions = (transactionsData ?? []).filter(
    tx => filter === 'ALL' || tx.type === filter
  );
  const hasMore = false; // Pagination not implemented in mock service

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <div className="gold-container">
      <div className="gold-balance-small">
        <span className="label">보유 골드</span>
        <span className="amount">{balance.toLocaleString()}G</span>
      </div>

      <div className="gold-filter-tabs">
        <button
          className={filter === 'ALL' ? 'active' : ''}
          onClick={() => handleFilterChange('ALL')}
        >
          전체
        </button>
        <button
          className={filter === 'CHARGE' ? 'active' : ''}
          onClick={() => handleFilterChange('CHARGE')}
        >
          충전
        </button>
        <button
          className={filter === 'SPEND' ? 'active' : ''}
          onClick={() => handleFilterChange('SPEND')}
        >
          사용
        </button>
        <button
          className={filter === 'EARN' ? 'active' : ''}
          onClick={() => handleFilterChange('EARN')}
        >
          적립
        </button>
      </div>

      <div>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', padding: '4.44vw 0' }}>
          <button
            onClick={handleLoadMore}
            style={{
              height: '10vw',
              padding: '0 6.67vw',
              borderRadius: '10vw',
              border: '1px solid var(--color-border)',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}

export default GoldHistoryPage;

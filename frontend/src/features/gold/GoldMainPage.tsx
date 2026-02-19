import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { goldService } from '../../services/goldService';
import GoldBalanceCard from './components/GoldBalanceCard';
import TransactionItem from './components/TransactionItem';
import './GoldPage.css';

function GoldMainPage() {
  const navigate = useNavigate();

  const { data: balanceData } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: goldService.getBalance,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['gold', 'transactions'],
    queryFn: () => goldService.getTransactions(0, 5),
  });

  const balance = balanceData?.balance ?? 0;
  const recentTransactions = transactionsData?.content ?? [];

  return (
    <div className="gold-container">
      <GoldBalanceCard balance={balance} />

      <div className="gold-actions">
        <button className="action-primary" onClick={() => navigate('/gold/purchase')}>
          충전하기
        </button>
        <button className="action-secondary" onClick={() => navigate('/gold/history')}>
          사용내역
        </button>
      </div>

      {recentTransactions.length > 0 && (
        <div>
          <div className="gold-section-title">최근 내역</div>
          {recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoldMainPage;

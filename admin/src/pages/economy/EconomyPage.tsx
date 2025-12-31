import { useState, useEffect } from 'react';
import { economyService } from '../../services/economyService';
import type { EconomyStats, TransactionItem } from '../../services/economyService';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function EconomyPage() {
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, txData] = await Promise.all([
        economyService.getStats(),
        economyService.getTransactions({ page: 0, type: typeFilter || undefined }),
      ]);
      setStats(statsData);
      setTransactions(txData.content);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      PURCHASE: { text: '충전', color: 'bg-green-100 text-green-800' },
      SPEND: { text: '사용', color: 'bg-red-100 text-red-800' },
      EARN: { text: '획득', color: 'bg-blue-100 text-blue-800' },
      REFUND: { text: '환불', color: 'bg-yellow-100 text-yellow-800' },
    };
    const label = labels[type] || { text: type, color: 'bg-gray-100' };
    return <span className={`px-2 py-1 text-xs rounded ${label.color}`}>{label.text}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gold/결제 관리</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="총 Gold 유통량" value={stats?.totalGoldCirculation || 0} icon="💰" />
        <StatCard title="총 매출" value={`₩${(stats?.totalRevenue || 0).toLocaleString()}`} icon="📈" />
        <StatCard title="오늘 매출" value={`₩${(stats?.todayRevenue || 0).toLocaleString()}`} icon="💵" />
        <StatCard title="활성 구독" value={stats?.activeSubscriptions || 0} icon="⭐" />
        <StatCard title="대기 정산" value={stats?.pendingPayouts || 0} icon="📋" />
      </div>

      {/* Transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">거래 내역</h2>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">전체</option>
            <option value="PURCHASE">충전</option>
            <option value="SPEND">사용</option>
            <option value="EARN">획득</option>
            <option value="REFUND">환불</option>
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회원</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일시</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">거래 내역이 없습니다.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeLabel(tx.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.userNickname}</td>
                  <td className="px-6 py-4 text-sm">{tx.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { economyService } from '../../services/economyService';
import type { EconomyStats, TransactionItem, GoldProductAdmin } from '../../services/economyService';

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
  const [products, setProducts] = useState<GoldProductAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'products' | 'adjust'>('transactions');

  // Refund modal
  const [refundTarget, setRefundTarget] = useState<TransactionItem | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Adjust form
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GoldProductAdmin | null>(null);
  const [productForm, setProductForm] = useState({ productCode: '', name: '', goldAmount: '', price: '', bonus: '0', displayOrder: '1' });

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, txData, productsData] = await Promise.all([
        economyService.getStats(),
        economyService.getTransactions({ page: 0, type: typeFilter || undefined }),
        economyService.getProducts(),
      ]);
      setStats(statsData);
      setTransactions(txData.content);
      setProducts(productsData);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      CHARGE: { text: '충전', color: 'bg-green-100 text-green-800' },
      SPEND: { text: '사용', color: 'bg-red-100 text-red-800' },
      REWARD: { text: '보상', color: 'bg-blue-100 text-blue-800' },
      REFUND: { text: '환불', color: 'bg-yellow-100 text-yellow-800' },
      ADMIN_ADJUST: { text: '관리자 조정', color: 'bg-purple-100 text-purple-800' },
    };
    const label = labels[type] || { text: type, color: 'bg-gray-100' };
    return <span className={`px-2 py-1 text-xs rounded ${label.color}`}>{label.text}</span>;
  };

  const handleRefund = async () => {
    if (!refundTarget || !refundReason.trim()) return;
    try {
      await economyService.refundTransaction(refundTarget.id, refundReason);
      setRefundTarget(null);
      setRefundReason('');
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || '환불 처리 실패');
    }
  };

  const handleAdjust = async () => {
    const userId = parseInt(adjustUserId);
    const amount = parseInt(adjustAmount);
    if (!userId || !amount || !adjustReason.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    try {
      await economyService.adjustGold(userId, amount, adjustReason);
      setAdjustUserId('');
      setAdjustAmount('');
      setAdjustReason('');
      alert('골드 조정이 완료되었습니다.');
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || '골드 조정 실패');
    }
  };

  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await economyService.updateProduct(editingProduct.id, {
          name: productForm.name,
          goldAmount: parseInt(productForm.goldAmount),
          price: parseInt(productForm.price),
          bonus: parseInt(productForm.bonus),
          displayOrder: parseInt(productForm.displayOrder),
        });
      } else {
        await economyService.createProduct({
          productCode: productForm.productCode,
          name: productForm.name,
          goldAmount: parseInt(productForm.goldAmount),
          price: parseInt(productForm.price),
          bonus: parseInt(productForm.bonus) || 0,
          displayOrder: parseInt(productForm.displayOrder) || 1,
        });
      }
      resetProductForm();
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || '상품 처리 실패');
    }
  };

  const handleToggleProduct = async (product: GoldProductAdmin) => {
    try {
      await economyService.updateProduct(product.id, { isActive: !product.isActive });
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || '상품 상태 변경 실패');
    }
  };

  const startEditProduct = (product: GoldProductAdmin) => {
    setEditingProduct(product);
    setProductForm({
      productCode: product.productCode,
      name: product.name,
      goldAmount: product.goldAmount.toString(),
      price: product.price.toString(),
      bonus: product.bonus.toString(),
      displayOrder: product.displayOrder.toString(),
    });
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ productCode: '', name: '', goldAmount: '', price: '', bonus: '0', displayOrder: '1' });
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

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['transactions', 'products', 'adjust'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-md transition ${activeTab === tab ? 'bg-white shadow font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {tab === 'transactions' ? '거래 내역' : tab === 'products' ? '상품 관리' : '골드 조정'}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">거래 내역</h2>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">전체</option>
              <option value="CHARGE">충전</option>
              <option value="SPEND">사용</option>
              <option value="REWARD">보상</option>
              <option value="REFUND">환불</option>
              <option value="ADMIN_ADJUST">관리자 조정</option>
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">거래 내역이 없습니다.</td></tr>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {tx.type === 'SPEND' && (
                        <button
                          onClick={() => setRefundTarget(tx)}
                          className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100"
                        >
                          환불
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">골드 상품</h2>
            <button
              onClick={() => { resetProductForm(); setShowProductForm(true); }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              상품 추가
            </button>
          </div>

          {showProductForm && (
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-sm font-medium mb-3">{editingProduct ? '상품 수정' : '새 상품'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {!editingProduct && (
                  <input placeholder="상품 코드" value={productForm.productCode} onChange={(e) => setProductForm({ ...productForm, productCode: e.target.value })} className="px-3 py-2 border rounded text-sm" />
                )}
                <input placeholder="상품명" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="px-3 py-2 border rounded text-sm" />
                <input placeholder="골드량" type="number" value={productForm.goldAmount} onChange={(e) => setProductForm({ ...productForm, goldAmount: e.target.value })} className="px-3 py-2 border rounded text-sm" />
                <input placeholder="가격 (원)" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="px-3 py-2 border rounded text-sm" />
                <input placeholder="보너스" type="number" value={productForm.bonus} onChange={(e) => setProductForm({ ...productForm, bonus: e.target.value })} className="px-3 py-2 border rounded text-sm" />
                <input placeholder="표시 순서" type="number" value={productForm.displayOrder} onChange={(e) => setProductForm({ ...productForm, displayOrder: e.target.value })} className="px-3 py-2 border rounded text-sm" />
              </div>
              <div className="mt-3 flex space-x-2">
                <button onClick={handleProductSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">{editingProduct ? '수정' : '추가'}</button>
                <button onClick={resetProductForm} className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300">취소</button>
              </div>
            </div>
          )}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">골드</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">가격</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">보너스</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">상품이 없습니다.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{p.productCode}</td>
                    <td className="px-6 py-4 text-sm">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-right">{p.goldAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">₩{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">{p.bonus}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleProduct(p)}
                        className={`text-xs px-2 py-1 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {p.isActive ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => startEditProduct(p)} className="text-xs text-blue-600 hover:underline">수정</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Gold Adjust Tab */}
      {activeTab === 'adjust' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 max-w-lg">
          <h2 className="font-semibold mb-4">골드 수동 조정</h2>
          <p className="text-sm text-gray-500 mb-4">양수: 지급, 음수: 차감. ADMIN_ADJUST 거래로 기록됩니다.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID</label>
              <input type="number" value={adjustUserId} onChange={(e) => setAdjustUserId(e.target.value)} placeholder="예: 1" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
              <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="예: 100 또는 -50" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사유</label>
              <input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="조정 사유를 입력하세요" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <button onClick={handleAdjust} className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">골드 조정</button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">거래 환불</h3>
            <p className="text-sm text-gray-600 mb-1">거래 #{refundTarget.id} ({refundTarget.userNickname})</p>
            <p className="text-sm text-gray-600 mb-4">금액: {Math.abs(refundTarget.amount).toLocaleString()}G</p>
            <input
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="환불 사유를 입력하세요"
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
            />
            <div className="flex space-x-2">
              <button onClick={handleRefund} disabled={!refundReason.trim()} className="flex-1 px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 disabled:opacity-50">환불 처리</button>
              <button onClick={() => { setRefundTarget(null); setRefundReason(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-sm rounded-lg hover:bg-gray-300">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

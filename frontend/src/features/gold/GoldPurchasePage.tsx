import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goldService } from '../../services/goldService';
import GoldProductCard from './components/GoldProductCard';
import './GoldPage.css';

function GoldPurchasePage() {
  const queryClient = useQueryClient();

  const { data: balanceData } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: goldService.getBalance,
  });

  const { data: productsData } = useQuery({
    queryKey: ['gold', 'products'],
    queryFn: goldService.getProducts,
  });

  const chargeMutation = useMutation({
    mutationFn: goldService.chargeGold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gold', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['gold', 'transactions'] });
      alert('골드 충전이 완료되었습니다.');
    },
    onError: () => {
      alert('골드 충전에 실패했습니다.');
    },
  });

  const handlePurchase = (productId: number) => {
    const product = productsData?.find((p) => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `${product.name}을(를) ${product.price.toLocaleString()}원에 구매하시겠습니까?`
    );

    if (confirmed) {
      chargeMutation.mutate({ productId, paymentMethod: 'CARD' });
    }
  };

  const balance = balanceData?.balance ?? 0;
  const products = productsData ?? [];

  return (
    <div className="gold-container">
      <div className="gold-balance-small">
        <span className="label">보유 골드</span>
        <span className="amount">{balance.toLocaleString()}G</span>
      </div>

      <div className="gold-section-title">골드 상품</div>
      {products.map((product) => (
        <GoldProductCard key={product.id} product={product} onPurchase={handlePurchase} />
      ))}
    </div>
  );
}

export default GoldPurchasePage;

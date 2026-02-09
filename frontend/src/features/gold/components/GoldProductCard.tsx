import { type GoldProduct } from '../../../services/goldService';
import '../GoldPage.css';

interface GoldProductCardProps {
  product: GoldProduct;
  onPurchase: (productId: number) => void;
}

function GoldProductCard({ product, onPurchase }: GoldProductCardProps) {
  return (
    <div className="gold-product-card">
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-amount">
          {product.goldAmount.toLocaleString()}G
          {(product.bonusAmount ?? 0) > 0 && ` + 보너스 ${product.bonusAmount!.toLocaleString()}G`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.11vw' }}>
        <div className="product-price">{product.price.toLocaleString()}원</div>
        <button className="product-buy-btn" onClick={() => onPurchase(product.id)}>
          구매하기
        </button>
      </div>
    </div>
  );
}

export default GoldProductCard;

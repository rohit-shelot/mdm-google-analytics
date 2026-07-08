import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const categoryColors = {
    console: '#6c63ff',
    game: '#00d4ff',
    keyboard: '#00ff88',
    mouse: '#ff6b35',
    accessory: '#ff4757',
  };

  const color = categoryColors[product.category] || '#6c63ff';

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div className="product-card-image">
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          loading="lazy"
        />
        {product.featured && <span className="product-card-badge badge-featured">Featured</span>}
        {product.stock === 0 && <span className="product-card-badge badge-sale" style={{ left: 'auto', right: 12 }}>Out of Stock</span>}

        <div className="product-card-overlay">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-secondary btn-sm"
            id={`view-product-${product.id}`}
          >
            <Eye size={14} /> View
          </Link>
          <button
            className="btn btn-primary btn-sm"
            id={`add-cart-${product.id}`}
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-category" style={{ color }}>{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < 4 ? '#ffd700' : 'none'} />
          ))}
          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>(4.2)</span>
        </div>
        <div className="product-price">${Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
}

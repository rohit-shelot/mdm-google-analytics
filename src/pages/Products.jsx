import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { trackPageView, trackViewItemList, trackSearch } from '../lib/analytics';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'console', label: 'Consoles' },
  { value: 'game', label: 'Games' },
  { value: 'keyboard', label: 'Keyboards' },
  { value: 'mouse', label: 'Mice' },
  { value: 'accessory', label: 'Accessories' },
];

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at_desc');

  const category = searchParams.get('category') || '';

  useEffect(() => {
    trackPageView('/products');
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('name', `%${search}%`);

      const [field, dir] = sort.split('_');
      const sortField = field === 'created' ? 'created_at' : field;
      query = query.order(sortField, { ascending: dir === 'asc' });

      const { data } = await query;
      const loadedProducts = data || [];
      setProducts(loadedProducts);
      setLoading(false);
      
      if (loadedProducts.length > 0) {
        trackViewItemList(loadedProducts, category ? `Category: ${category}` : 'All Products');
      }
    };
    fetchProducts();
  }, [category, search, sort]);

  useEffect(() => {
    if (search.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        trackSearch(search);
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search]);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span className="section-tag">Our Collection</span>
          <h1 className="section-title" style={{ textAlign: 'left' }}>
            {category
              ? CATEGORIES.find(c => c.value === category)?.label || 'Products'
              : 'All '}
            {!category && <span>Products</span>}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {products.length} products available
          </p>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              id={`cat-pill-${cat.value || 'all'}`}
              className={`btn btn-sm ${category === cat.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const params = new URLSearchParams();
                if (cat.value) params.set('category', cat.value);
                setSearchParams(params);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              id="products-search-input"
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            id="products-sort-select"
            className="filter-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                  <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  <div className="skeleton" style={{ height: 20, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={56} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>No products found</p>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

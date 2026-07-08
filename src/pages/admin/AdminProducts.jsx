import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', category: 'console', stock: '', image_url: '', featured: false };
const CATEGORIES = ['console', 'game', 'keyboard', 'mouse', 'accessory'];

export default function AdminProducts() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price), stock: String(p.stock) }); setEditing(p.id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product added!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Product deleted');
    fetchProducts();
  };

  return (
    <div>
      <div className="admin-page-title">Products</div>
      <p className="admin-page-subtitle">Manage your gaming product catalog.</p>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2 className="data-table-title">All Products ({products.length})</h2>
          <button className="btn btn-primary btn-sm" id="add-product-btn" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No products. Add your first one!</td></tr>
              ) : products.map(p => (
                <tr key={p.id} id={`admin-product-${p.id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={p.image_url || `https://picsum.photos/seed/${p.id}/60/60`} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-secondary)' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ textTransform: 'capitalize', color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>{p.category}</span></td>
                  <td style={{ fontWeight: 700, fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>${Number(p.price).toFixed(2)}</td>
                  <td style={{ color: p.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{p.stock}</td>
                  <td>{p.featured ? <span style={{ color: 'var(--accent-green)' }}>✓ Yes</span> : <span style={{ color: 'var(--text-muted)' }}>No</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" id={`edit-product-${p.id}`} onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-sm" id={`delete-product-${p.id}`} onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" id="product-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="cart-close-btn" id="modal-close-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} id="product-form">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input id="product-name" type="text" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="PlayStation 5 Disc Edition" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select id="product-category" className="filter-select" style={{ width: '100%' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD) *</label>
                  <input id="product-price" type="number" step="0.01" min="0" className="form-input" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="499.99" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input id="product-stock" type="number" min="0" className="form-input" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="50" />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input id="product-image" type="url" className="form-input" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="product-description" className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input id="product-featured" type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)' }} />
                  <span className="form-label" style={{ margin: 0 }}>Mark as Featured</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button id="product-save-btn" type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

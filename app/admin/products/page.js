'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, X, Package, Search } from 'lucide-react';
import styles from './Products.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'general', image: '', featured: false });

  const fetchProducts = () => {
    fetch('/api/products').then(r => r.json()).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'general', image: '', featured: false });
    setEditing(null);
    setShowModal(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      featured: !!product.featured,
    });
    setEditing(product.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `/api/products/${editing}` : '/api/products';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });

    if (res.ok) {
      resetForm();
      fetchProducts();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleToggleFeatured = async (product) => {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !product.featured }),
    });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Products</h1>
          <p>{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} id="add-product-btn">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search products..." className={`input ${styles.searchInput}`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productThumb}>
                      {product.image ? <img src={product.image} alt="" /> : <Package size={16} />}
                    </div>
                    <div>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productId}>#{product.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-default" style={{textTransform: 'capitalize'}}>{product.category}</span></td>
                <td className="mono" style={{fontWeight: 600}}>${product.price.toFixed(2)}</td>
                <td>
                  <button className={`${styles.starBtn} ${product.featured ? styles.starred : ''}`} onClick={() => handleToggleFeatured(product)}>
                    <Star size={16} />
                  </button>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(product)}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(product.id)} style={{color: 'var(--danger)'}}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={resetForm} className="btn btn-ghost btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Product Name</label>
                  <input className="input" placeholder="e.g. Cyber Hoodie" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input" rows={3} placeholder="Product description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{resize: 'vertical'}} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label className="input-label">Price ($)</label>
                    <input className="input" type="number" step="0.01" min="0" placeholder="29.99" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Image URL</label>
                    <input className="input" placeholder="/images/product.jpg" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="general">General</option>
                      <option value="web-design">Web Design</option>
                      <option value="web-development">Web Development</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="growth">Growth</option>
                      <option value="seo">SEO</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="optimization">Optimization</option>
                    </select>
                  </div>
                </div>
                <label className={styles.checkbox}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
                  <span>Featured product</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">{editing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

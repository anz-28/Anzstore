'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import styles from './Products.module.css';

export default function ProductsClient({ products, categories }) {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCat);
  const [sort, setSort] = useState('newest');

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break; // newest - already sorted by created_at DESC
    }

    return result;
  }, [products, category, search, sort]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header} data-aos="fade-up" data-aos-duration="650">
          <div>
            <span className={styles.tag}>SERVICES</span>
            <h1>Web Development Services</h1>
            <p>{filtered.length} services</p>
          </div>
        </div>

        <div className={styles.filters} data-aos="fade-up" data-aos-duration="650" data-aos-delay="100">
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search services..."
              className={`input ${styles.searchInput}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="product-search"
            />
          </div>

          <div className={styles.filterRow}>
            <div className={styles.categories}>
              <button
                className={`${styles.catBtn} ${category === 'all' ? styles.active : ''}`}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${category === cat ? styles.active : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <select
              className={`input ${styles.sortSelect}`}
              value={sort}
              onChange={e => setSort(e.target.value)}
              id="product-sort"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <SlidersHorizontal size={48} />
            <h3>No services found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

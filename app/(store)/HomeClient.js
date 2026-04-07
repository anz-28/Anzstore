'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, ArrowUpRight, Zap, Shield, Truck, RefreshCcw, LayoutTemplate, Code2, ShoppingCart, Wrench, Globe, Gauge, Server } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage({ featuredProducts }) {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroShell}`}>
          <div className={styles.heroLeft} data-aos="fade-right" data-aos-duration="750">
            <div className={styles.heroTag}>
              <Zap size={14} />
              <span>SERVICES OPEN FOR BOOKING</span>
            </div>
            <h1 className={styles.heroTitle}>
              Build Faster.<br />
              <span className={styles.heroAccent}>Convert Better.</span>
            </h1>
            <p className={styles.heroSub}>
              Conversion-ready websites, ecommerce builds, and performance work tailored
              for teams that want measurable growth, not just pretty pages.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/products" className="btn btn-primary btn-lg">
                View Services <ArrowRight size={18} />
              </Link>
              <Link href="/products?category=web-development" className="btn btn-secondary btn-lg">
                Browse Web Development
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>10+</span>
                <span className={styles.statLabel}>Projects Built</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>2.5K+</span>
                <span className={styles.statLabel}>Leads Generated</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>4.9★</span>
                <span className={styles.statLabel}>Rating</span>
              </div>
            </div>

            <div className={styles.heroTrust}>
              <div className={styles.trustItem}><Server size={14} /> Production-Ready Stack</div>
              <div className={styles.trustItem}><Gauge size={14} /> Core Web Vitals Focused</div>
              <div className={styles.trustItem}><Globe size={14} /> SEO + Global Delivery</div>
            </div>
          </div>

          <div className={styles.heroRight} data-aos="fade-left" data-aos-duration="750" data-aos-delay="120">
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span>Launch Sprint Dashboard</span>
                <ArrowUpRight size={16} />
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewMetric}>
                  <span className={styles.previewLabel}>Conversion Lift</span>
                  <span className={styles.previewValue}>+32%</span>
                </div>
                <div className={styles.previewMetric}>
                  <span className={styles.previewLabel}>Load Speed</span>
                  <span className={styles.previewValue}>1.1s</span>
                </div>
                <div className={styles.previewMetric}>
                  <span className={styles.previewLabel}>SEO Visibility</span>
                  <span className={styles.previewValue}>+41%</span>
                </div>
              </div>
              <div className={styles.previewBars}>
                <span style={{ width: '88%' }} />
                <span style={{ width: '72%' }} />
                <span style={{ width: '94%' }} />
              </div>
            </div>

            <div className={`${styles.floatingTag} ${styles.tagTop}`}>
              <Code2 size={14} /> Build System
            </div>
            <div className={`${styles.floatingTag} ${styles.tagBottom}`}>
              <Gauge size={14} /> Performance Tuning
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} data-aos="fade-up" data-aos-duration="700">
        <div className="container">
          <div className={styles.featureGrid}>
            <div className={styles.featureCard} data-aos="zoom-in" data-aos-delay="0">
              <div className={styles.featureIcon}><Truck size={24} /></div>
              <h3>Fast Delivery</h3>
              <p>Rapid turnaround for landing pages and marketing sites</p>
            </div>
            <div className={styles.featureCard} data-aos="zoom-in" data-aos-delay="100">
              <div className={styles.featureIcon}><Shield size={24} /></div>
              <h3>Secure Architecture</h3>
              <p>Best-practice security and reliable deployment workflows</p>
            </div>
            <div className={styles.featureCard} data-aos="zoom-in" data-aos-delay="200">
              <div className={styles.featureIcon}><RefreshCcw size={24} /></div>
              <h3>Iterative Revisions</h3>
              <p>Clear review cycles to refine UX and content direction</p>
            </div>
            <div className={styles.featureCard} data-aos="zoom-in" data-aos-delay="300">
              <div className={styles.featureIcon}><Zap size={24} /></div>
              <h3>Performance First</h3>
              <p>Optimized code and UX tuned for speed and conversions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredProducts.length > 0 && (
        <section className={styles.section} data-aos="fade-up" data-aos-duration="700">
          <div className="container">
            <div className={styles.sectionHeader} data-aos="fade-up" data-aos-duration="650">
              <div>
                <span className={styles.sectionTag}>CURATED</span>
                <h2>Featured Picks</h2>
              </div>
              <Link href="/products" className="btn btn-ghost">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className={styles.section} data-aos="fade-up" data-aos-duration="700">
        <div className="container">
          <div className={styles.sectionHeader} data-aos="fade-up" data-aos-duration="650">
            <div>
              <span className={styles.sectionTag}>BROWSE</span>
              <h2>Browse by Service Type</h2>
            </div>
          </div>
          <div className={styles.catGrid}>
            {[
              { name: 'Web Design', slug: 'web-design', icon: LayoutTemplate },
              { name: 'Web Development', slug: 'web-development', icon: Code2 },
              { name: 'E-commerce', slug: 'ecommerce', icon: ShoppingCart },
              { name: 'Maintenance', slug: 'maintenance', icon: Wrench },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={styles.catCard}
                data-aos="fade-up"
                data-aos-delay={cat.slug === 'web-design' ? '0' : cat.slug === 'web-development' ? '100' : cat.slug === 'ecommerce' ? '200' : '300'}
                data-aos-duration="650"
              >
                <span className={styles.catIcon}>
                  <cat.icon size={20} strokeWidth={1.8} />
                </span>
                <span className={styles.catName}>{cat.name}</span>
                <ArrowRight size={16} className={styles.catArrow} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta} data-aos="zoom-in" data-aos-duration="700">
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaGlow} />
            <h2>Ready to Launch Your Next Build?</h2>
            <p>Book a service package and move from idea to production faster.</p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Explore Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

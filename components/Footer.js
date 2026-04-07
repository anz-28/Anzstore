import Link from 'next/link';
import { Zap, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Zap size={20} />
            <span>ANZ</span>
            <span className={styles.accent}>LAB</span>
          </Link>
          <p>Custom web development services for founders, creators, and growing businesses.</p>
        </div>

        <div className={styles.linksCol}>
          <h4>Services</h4>
          <Link href="/products">All Services</Link>
          <Link href="/products?category=web-development">Web Development</Link>
          <Link href="/products?category=ecommerce">E-commerce</Link>
          <Link href="/products?category=maintenance">Maintenance</Link>
        </div>

        <div className={styles.linksCol}>
          <h4>Connect</h4>
          <div className={styles.socials}>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=anzmhry@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email for issues"
              className={styles.mailLink}
            >
              <Mail size={18} />
              <span>anzmhry@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} ANZ LAB. All rights{' '}
            <Link href="/admin/login" className={styles.bottomLink}>reserved</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}

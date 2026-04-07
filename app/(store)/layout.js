import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

export default function StoreLayout({ children }) {
  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}

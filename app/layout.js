import './globals.css';
import 'aos/dist/aos.css';

import AOSInit from '@/components/AOSInit';

export const metadata = {
  title: 'ANZ LAB | Web Development Services',
  description: 'Custom web development services including business websites, e-commerce builds, SEO fixes, and maintenance plans.',
  keywords: 'web development, website design, ecommerce development, SEO services, website maintenance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}

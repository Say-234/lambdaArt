import './globals.css';
import type { Metadata } from 'next';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'Lambda Art',
  description: "L`Art de faire, à Portée de Main",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-main bg-light text-black">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
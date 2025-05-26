import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Administrateur - Lambda Art',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <main className="admin-content">{children}</main>
    </div>
  );
}
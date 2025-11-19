import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Administrateur - Lambda Art',
};

import { AdminSidebar } from '../components/admin/AdminSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
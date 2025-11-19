## Error Type
Build Error

## Error Message
Module not found: Can't resolve '@/components/admin/AdminSidebar'

## Build Output
./app/admin/layout.tsx:7:1
Module not found: Can't resolve '@/components/admin/AdminSidebar'
   5 | };
   6 |
>  7 | import { AdminSidebar } from '@/components/admin/AdminSidebar';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |
   9 | export default function DashboardLayout({
  10 |   children,

Import map: aliased to relative './components/admin/AdminSidebar' inside of [project]/

https://nextjs.org/docs/messages/module-not-found

Next.js version: 15.5.6 (Turbopack)

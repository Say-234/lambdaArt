
    // app/components/admin/AdminSidebar.tsx
    'use client';

    import Link from 'next/link';
    import { usePathname } from 'next/navigation';
    import { cn } from '@/lib/utils'; // shadcn/ui installe cette fonction utilitaire
    import { buttonVariants } from '@/components/ui/button';

    const sidebarNavItems = [
      {
        title: 'Aperçu',
        href: '/admin',
      },
      {
        title: 'Modules',
        href: '/admin/modules',
      },
      {
        title: 'Utilisateurs',
        href: '/admin/users',
      },
    ];

    export function AdminSidebar() {
      const pathname = usePathname();

      return (
        <nav className="hidden md:flex md:flex-col lg:w-[250px] border-r">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <span>Dashboard Admin</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                    {sidebarNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                        buttonVariants({ variant: pathname === item.href ? 'default' : 'ghost' }),
                        'justify-start'
                        )}
                    >
                        {item.title}
                    </Link>
                    ))}
                </nav>
            </div>
        </nav>
      );
    }
    
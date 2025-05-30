'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    Phone,
    BarChart3,
    Settings
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Leads',
        href: '/leads',
        icon: Users,
    },
    {
        name: 'Calls',
        href: '/calls',
        icon: Phone,
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
            <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        isActive && "bg-gray-200 text-gray-900"
                                    )}
                                >
                                    <item.icon className="mr-3 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
} 
'use client';

import { ReactNode } from 'react';
import Header from './header';
import Sidebar from './sidebar';

interface LayoutProps {
    children: ReactNode;
    user?: {
        username: string;
        email: string;
    };
}

export default function Layout({ children, user }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
} 
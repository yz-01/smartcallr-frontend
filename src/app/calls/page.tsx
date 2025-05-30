'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/common/layout';
import CallHistory from '@/components/calls/call-history';
import { authAPI } from '@/services/auth';
import { User } from '@/interfaces/auth';

export default function CallsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authAPI.getProfile();
                if (response.status === 'success' && response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <Layout user={user || undefined}>
            <CallHistory />
        </Layout>
    );
} 
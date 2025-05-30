'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/common/layout';
import { authAPI } from '@/services/auth';
import { User } from '@/interfaces/auth';

export default function DashboardPage() {
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
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.username || 'User'}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Leads</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Calls Made</h3>
                        <p className="text-3xl font-bold text-green-600">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
                        <p className="text-3xl font-bold text-purple-600">0%</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                        <p className="text-3xl font-bold text-orange-600">0</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 
'use client';

import { useUser, authAPI } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, isLoading, isError, isLoggedIn } = useUser();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (isError || !isLoggedIn) {
        router.push('/login');
        return null;
    }

    const handleLogout = () => {
        authAPI.logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Back!</CardTitle>
                            <CardDescription>
                                Here&apos;s your profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
                                <p><strong>Username:</strong> {user?.username}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Member since:</strong> {new Date(user?.date_joined || '').toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button className="w-full" variant="outline">
                                    Update Profile
                                </Button>
                                <Button className="w-full" variant="outline">
                                    Settings
                                </Button>
                                <Button className="w-full" variant="outline">
                                    Help & Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>
                                Your account overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>Account Status: <span className="text-green-600 font-semibold">Active</span></p>
                                <p>User ID: {user?.id}</p>
                                <p>Total Sessions: Coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 
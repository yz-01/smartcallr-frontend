'use client';

import { useUser } from '@/services/auth';
import { useCallHistory } from '@/services/call';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Phone, Users, FileText, Sparkles, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/common/layout';

export default function Dashboard() {
    const { user, isLoading, isError, isLoggedIn } = useUser();
    const { calls, isLoading: callsLoading } = useCallHistory();
    const router = useRouter();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (isError || !isLoggedIn) {
        router.push('/login');
        return null;
    }

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCalls = calls?.filter(call => new Date(call.start_time) >= today) || [];
    const completedCalls = calls?.filter(call => call.status === 'completed') || [];
    const transcribedCalls = calls?.filter(call => call.transcribe_status === 'completed') || [];
    const summarizedCalls = calls?.filter(call => call.summary_status === 'completed') || [];

    const recentCalls = calls?.slice(0, 5) || [];

    return (
        <Layout user={user}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {user?.first_name || user?.username}!</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button onClick={() => router.push('/leads')} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Make New Call
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Phone className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Calls</p>
                                    <p className="text-2xl font-bold">{calls?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Today&apos;s Calls</p>
                                    <p className="text-2xl font-bold">{todayCalls.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Transcribed</p>
                                    <p className="text-2xl font-bold">{transcribedCalls.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Sparkles className="h-8 w-8 text-yellow-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Summarized</p>
                                    <p className="text-2xl font-bold">{summarizedCalls.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Calls */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5" />
                                    <span>Recent Calls</span>
                                </CardTitle>
                                <CardDescription>
                                    Your latest call activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {callsLoading ? (
                                    <div className="text-center py-4 text-gray-500">
                                        Loading calls...
                                    </div>
                                ) : recentCalls.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentCalls.map((call) => (
                                            <div
                                                key={call.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => router.push(`/call-details/${call.id}`)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">{call.phone_number}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {call.lead_name || 'Unknown Lead'} • {format(new Date(call.start_time), 'MMM dd, h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={call.status === 'completed' ? 'default' : 'destructive'}>
                                                        {call.status}
                                                    </Badge>
                                                    {call.recording_file_path && (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => router.push('/calls')}
                                            >
                                                View All Calls
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No calls yet</p>
                                        <p className="text-sm">Start by making your first call from the Leads page</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions & Stats */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common tasks and navigation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.push('/leads')}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Leads
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.push('/calls')}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call History
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.push('/analytics')}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Analytics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Processing Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Status</CardTitle>
                                <CardDescription>
                                    Current transcription and summary status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm">Transcriptions</span>
                                        </div>
                                        <Badge variant="outline">
                                            {transcribedCalls.length}/{calls?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm">AI Summaries</span>
                                        </div>
                                        <Badge variant="outline">
                                            {summarizedCalls.length}/{calls?.length || 0}
                                        </Badge>
                                    </div>

                                    {calls && calls.length > 0 && (
                                        <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Completion Rate</span>
                                                <span className="font-medium">
                                                    {Math.round((completedCalls.length / calls.length) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member since:</span>
                                        <span className="font-medium">
                                            {user?.date_joined ? format(new Date(user.date_joined), 'MMM yyyy') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 
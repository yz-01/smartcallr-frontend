'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CallInterface from '@/components/calls/call-interface';
import { callAPI } from '@/services/call';
import { Call } from '@/interfaces/call';

export default function CallPage() {
    const params = useParams();
    const router = useRouter();
    const [call, setCall] = useState<Call | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCall = async () => {
            try {
                const callId = parseInt(params.id as string);
                if (isNaN(callId)) {
                    setError('Invalid call ID');
                    return;
                }

                const response = await callAPI.getStatus(callId);
                if (response.status === 'success' && response.data) {
                    setCall(response.data as Call);
                } else {
                    setError('Call not found');
                }
            } catch (error) {
                console.error('Failed to fetch call:', error);
                setError('Failed to load call data');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCall();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading call...</div>
            </div>
        );
    }

    if (error || !call) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">{error || 'Call not found'}</div>
                    <button
                        onClick={() => router.push('/leads')}
                        className="text-blue-600 hover:underline"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return <CallInterface initialCall={call} />;
} 
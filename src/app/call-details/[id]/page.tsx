'use client';

import { use } from 'react';
import CallDetails from '@/components/calls/call-details';

interface CallDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default function CallDetailsPage({ params }: CallDetailsPageProps) {
    const resolvedParams = use(params);
    const callId = parseInt(resolvedParams.id);

    return <CallDetails callId={callId} />;
} 
'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCallHistory } from '@/services/call';

export default function CallHistory() {
    const { calls, isLoading, isError } = useCallHistory();
    const router = useRouter();

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'failed': return 'destructive';
            case 'processing': return 'secondary';
            case 'pending': return 'outline';
            default: return 'secondary';
        }
    };

    const getCallStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'failed': return 'destructive';
            case 'ringing': return 'secondary';
            case 'in_progress': return 'default';
            case 'no_answer': return 'outline';
            case 'busy': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'initiated': return 'Initiated';
            case 'ringing': return 'Ringing';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'failed': return 'Failed';
            case 'no_answer': return 'No Answer';
            case 'busy': return 'Busy';
            case 'pending': return 'Pending';
            case 'processing': return 'Processing';
            default: return status;
        }
    };

    const handleRowClick = (callId: number) => {
        router.push(`/call-details/${callId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading call history...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading call history</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Call History</CardTitle>
                    <CardDescription>
                        View all your past calls, recordings, transcriptions and summaries. Click on any row to view details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {calls && calls.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Call Status</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Transcription</TableHead>
                                    <TableHead>Summary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calls.map((call) => (
                                    <TableRow
                                        key={call.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleRowClick(call.id)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{call.phone_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {call.lead_name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getCallStatusBadgeVariant(call.status)}>
                                                {getStatusText(call.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(call.start_time), 'MMM dd, yyyy')}
                                                <div className="text-gray-500">
                                                    {format(new Date(call.start_time), 'hh:mm a')}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(call.transcribe_status)}>
                                                {getStatusText(call.transcribe_status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(call.summary_status)}>
                                                {getStatusText(call.summary_status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No calls found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Start by making your first call from the Leads page
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
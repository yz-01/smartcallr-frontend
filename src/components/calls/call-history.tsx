'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Clock, FileAudio } from 'lucide-react';
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

    const getStatusBadgeVariant = (status: string) => {
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
            default: return status;
        }
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
                        View all your past calls and their recordings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {calls && calls.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Recording</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calls.map((call) => (
                                    <TableRow key={call.id}>
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
                                            <Badge variant={getStatusBadgeVariant(call.status)}>
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
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="font-mono text-sm">
                                                    {call.duration_formatted}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {call.recording_file_path ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <FileAudio className="h-4 w-4" />
                                                    <span className="text-sm">Available</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate text-sm">
                                                {call.notes || '-'}
                                            </div>
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
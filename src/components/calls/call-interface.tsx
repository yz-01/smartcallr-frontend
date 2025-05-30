'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneOff, Clock, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { callAPI } from '@/services/call';
import { Call } from '@/interfaces/call';
import { toast } from 'react-hot-toast';

interface CallInterfaceProps {
    initialCall: Call;
}

export default function CallInterface({ initialCall }: CallInterfaceProps) {
    const router = useRouter();
    const [call, setCall] = useState<Call>(initialCall);
    const [isActive, setIsActive] = useState(initialCall.status !== 'completed' && initialCall.status !== 'failed');
    const [duration, setDuration] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Periodically check call status from backend
    useEffect(() => {
        if (isActive) {
            const statusInterval = setInterval(async () => {
                try {
                    const result = await callAPI.getStatus(call.id);
                    if (result.status === 'success') {
                        const updatedCall = result.data as Call;
                        setCall(updatedCall);

                        // If call has ended on backend, update local state
                        if (updatedCall.status === 'completed' || updatedCall.status === 'failed') {
                            setIsActive(false);
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking call status:', error);
                }
            }, 5000); // Check every 5 seconds

            return () => clearInterval(statusInterval);
        }
    }, [isActive, call.id]);

    // Start timer when component mounts
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    // Auto-download recording when call ends
    useEffect(() => {
        if (!isActive && call.status === 'completed' && !call.recording_file_path) {
            // Download recording immediately when call ends
            console.log('Auto-downloading recording for completed call:', call.id);
            handleDownloadRecording();
        }
    }, [isActive, call.status, call.recording_file_path]);

    // Format duration to MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveNotes = async () => {
        if (!notes.trim()) {
            toast.error('Please enter some notes before saving');
            return;
        }

        setIsSavingNotes(true);
        try {
            const result = await callAPI.updateNotes(call.id, { notes });

            if (result.status === 'success') {
                setCall(result.data as Call);
                toast.success('Notes saved successfully');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleEndCall = async () => {
        setIsEnding(true);
        try {
            setIsActive(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            const result = await callAPI.end(call.id, {
                duration,
                notes
            });

            if (result.status === 'success') {
                setCall(result.data as Call);
                toast.success('Call ended successfully');
            }
        } catch (error) {
            console.error('Error ending call:', error);
            setIsActive(true); // Resume timer if error
        } finally {
            setIsEnding(false);
        }
    };

    const handleDownloadRecording = async () => {
        setIsDownloading(true);
        try {
            const result = await callAPI.downloadRecording(call.id);

            if (result.status === 'success') {
                setCall(result.data as Call);
                toast.success('Recording downloaded successfully');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to download recording';
            toast.error(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ringing': return 'text-yellow-600';
            case 'in_progress': return 'text-green-600';
            case 'completed': return 'text-blue-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'initiated': return 'Initiating...';
            case 'ringing': return 'Ringing';
            case 'in_progress': return 'Connected';
            case 'completed': return 'Call Ended';
            case 'failed': return 'Call Failed';
            case 'no_answer': return 'No Answer';
            case 'busy': return 'Busy';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Phone Call</CardTitle>
                    <CardDescription>
                        Calling {call.phone_number}
                        {call.lead_name && (
                            <span className="block text-sm font-medium text-gray-700 mt-1">
                                {call.lead_name}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Call Status */}
                    <div className="text-center">
                        <div className={`text-lg font-medium ${getStatusColor(call.status)}`}>
                            {getStatusText(call.status)}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-3xl font-mono">
                            <Clock className="h-6 w-6" />
                            <span>{formatDuration(duration)}</span>
                        </div>
                    </div>

                    {/* Call Controls */}
                    <div className="flex justify-center space-x-4">
                        {isActive && call.status !== 'completed' && call.status !== 'failed' ? (
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={handleEndCall}
                                disabled={isEnding}
                                className="rounded-full h-16 w-16"
                            >
                                <PhoneOff className="h-8 w-8" />
                            </Button>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>
                                    {call.status === 'failed'
                                        ? 'Call failed or was disconnected'
                                        : `Call ended after ${formatDuration(duration)}`
                                    }
                                </p>
                                {call.status === 'failed' && (
                                    <p className="text-sm text-red-500 mt-1">
                                        The call may have been ended by the other party or due to connection issues
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes Section - Always visible */}
                    <div className="space-y-3">
                        <label htmlFor="notes" className="text-sm font-medium">
                            Call Notes
                        </label>
                        <Textarea
                            id="notes"
                            placeholder="Add notes about this call..."
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            rows={3}
                        />
                        <Button
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes || !notes.trim()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </Button>
                    </div>

                    {/* Recording Download Section */}
                    {!isActive && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-medium">Call Recording</h3>

                            {call.recording_file_path ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-green-600">
                                        ✓ Recording available
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        File: {call.recording_file_path}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        {isDownloading ? 'Downloading recording from Twilio...' : 'Download the actual call conversation recording from Twilio.'}
                                    </p>
                                    {!isDownloading && (
                                        <Button
                                            onClick={handleDownloadRecording}
                                            disabled={isDownloading}
                                            className="w-full"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Call Recording
                                        </Button>
                                    )}
                                    {call.status !== 'completed' && (
                                        <p className="text-xs text-yellow-600">
                                            Note: Recording may take a few minutes to become available after call ends
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/leads')}
                            className="flex-1"
                        >
                            Back to Leads
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/calls')}
                            className="flex-1"
                        >
                            Call History
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
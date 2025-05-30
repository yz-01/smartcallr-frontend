'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneOff, Upload, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    const [isActive, setIsActive] = useState(initialCall.status !== 'completed');
    const [duration, setDuration] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [notes, setNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Format duration to MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                        {isActive && call.status !== 'completed' ? (
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
                                Call ended after {formatDuration(duration)}
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    {!isActive && (
                        <div className="space-y-2">
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
                        </div>
                    )}

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
                                        Download the actual call conversation recording from Twilio.
                                    </p>
                                    <Button
                                        onClick={handleDownloadRecording}
                                        disabled={isDownloading}
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isDownloading ? 'Downloading...' : 'Download Call Recording'}
                                    </Button>
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
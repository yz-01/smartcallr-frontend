'use client';

import { useState, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, Volume2, FileText, Sparkles, Clock, Phone, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { callAPI } from '@/services/call';
import { Call } from '@/interfaces/call';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import React from 'react';
import Layout from '@/components/common/layout';
import ReactMarkdown from 'react-markdown';

interface CallDetailsProps {
    callId: number;
}

export default function CallDetails({ callId }: CallDetailsProps) {
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [audioLoading, setAudioLoading] = useState(false);
    const [transcribeProgress, setTranscribeProgress] = useState(0);
    const [summaryProgress, setSummaryProgress] = useState(0);

    // Fetch call details
    const { data: response, error, isLoading, mutate } = useSWR(
        callId ? `call-detail-${callId}` : null,
        () => callAPI.getDetail(callId)
    );

    const call = response?.data as Call;

    // Progress simulation for transcription
    React.useEffect(() => {
        if (call?.transcribe_status === 'processing') {
            setTranscribeProgress(0);
            const interval = setInterval(() => {
                setTranscribeProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else if (call?.transcribe_status === 'completed') {
            setTranscribeProgress(100);
        } else {
            setTranscribeProgress(0);
        }
    }, [call?.transcribe_status]);

    // Progress simulation for summary
    React.useEffect(() => {
        if (call?.summary_status === 'processing') {
            setSummaryProgress(0);
            const interval = setInterval(() => {
                setSummaryProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else if (call?.summary_status === 'completed') {
            setSummaryProgress(100);
        } else {
            setSummaryProgress(0);
        }
    }, [call?.summary_status]);

    // Load audio blob when call data is available
    React.useEffect(() => {
        if (call?.recording_file_path && !audioUrl) {
            setAudioLoading(true);
            callAPI.getAudioBlob(callId)
                .then(url => {
                    setAudioUrl(url);
                    setAudioLoading(false);
                })
                .catch(error => {
                    console.error('Error loading audio:', error);
                    toast.error('Failed to load audio recording');
                    setAudioLoading(false);
                });
        }

        // Cleanup blob URL on unmount
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [call?.recording_file_path, callId, audioUrl]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'failed': return 'destructive';
            case 'processing': return 'secondary';
            case 'pending': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'processing': return 'Processing';
            case 'completed': return 'Completed';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(error => {
                    console.error('Error playing audio:', error);
                    toast.error('Failed to play audio. Please check if the recording is available.');
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const seekTime = percent * duration;
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    const handleTranscribe = async () => {
        try {
            await callAPI.transcribe(callId);
            mutate();
        } catch (error) {
            console.error('Error starting transcription:', error);
        }
    };

    const handleSummarize = async () => {
        try {
            await callAPI.summarize(callId);
            mutate();
        } catch (error) {
            console.error('Error generating summary:', error);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading call details...</div>
                </div>
            </Layout>
        );
    }

    if (error || !call) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Error loading call details</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/calls')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Call History
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Call Details</h1>
                        <div className="flex items-center space-x-4 text-gray-500">
                            <span>{format(new Date(call.start_time), 'EEEE, MMMM do, yyyy')}</span>
                            <span>•</span>
                            <span>{format(new Date(call.start_time), 'h:mm a')}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(call.start_time), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>

                {/* Call Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Phone className="h-5 w-5" />
                            <span>Call Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                            <p className="text-lg">{call.phone_number}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Lead Name</p>
                            <p className="text-lg">{call.lead_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Duration</p>
                            <p className="text-lg font-mono">{call.duration_formatted}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <Badge variant="default">{call.status}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Notes</p>
                            <p className="text-lg">{call.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Audio Player */}
                {call.recording_file_path && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Volume2 className="h-5 w-5" />
                                <span>Call Recording</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {audioLoading ? (
                                <div className="text-center py-4 text-gray-500">
                                    <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    <p>Loading audio...</p>
                                </div>
                            ) : audioUrl ? (
                                <>
                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onEnded={() => setIsPlaying(false)}
                                        onError={(e) => {
                                            console.error('Audio error:', e);
                                            console.error('Audio URL:', audioUrl);
                                            toast.error('Error loading audio file. Check console for details.');
                                        }}
                                        onCanPlay={() => {
                                            console.log('Audio can play:', audioUrl);
                                        }}
                                        preload="metadata"
                                        crossOrigin="anonymous"
                                    />

                                    <div className="flex items-center space-x-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePlayPause}
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>

                                        <div className="flex-1 space-y-1">
                                            <div
                                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                                                onClick={handleSeek}
                                            >
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <p>No audio available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Transcription */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Transcription</span>
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Badge variant={getStatusBadgeVariant(call.transcribe_status)}>
                                    {getStatusText(call.transcribe_status)}
                                </Badge>
                                {(call.transcribe_status === 'pending' || call.transcribe_status === 'failed' || call.transcribe_status === 'completed') && call.recording_file_path && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTranscribe}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        {call.transcribe_status === 'completed' ? 'Redo' : call.transcribe_status === 'failed' ? 'Retry' : 'Start'} Transcription
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {call.transcribe_status === 'completed' && call.transcribe_content ? (
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{call.transcribe_content}</p>
                            </div>
                        ) : call.transcribe_status === 'processing' ? (
                            <div className="space-y-4">
                                <div className="text-center py-4 text-gray-500">
                                    <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Transcribing audio...</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Processing audio transcription</span>
                                        <span>{Math.round(transcribeProgress)}%</span>
                                    </div>
                                    <Progress value={transcribeProgress} className="w-full" />
                                </div>
                            </div>
                        ) : call.transcribe_status === 'failed' ? (
                            <div className="text-center py-8 text-red-500">
                                <p>Transcription failed. Please try again.</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No transcription available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <Sparkles className="h-5 w-5" />
                                <span>AI Summary</span>
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Badge variant={getStatusBadgeVariant(call.summary_status)}>
                                    {getStatusText(call.summary_status)}
                                </Badge>
                                {(call.summary_status === 'pending' || call.summary_status === 'failed' || call.summary_status === 'completed') && call.transcribe_content && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSummarize}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        {call.summary_status === 'completed' ? 'Redo' : call.summary_status === 'failed' ? 'Retry' : 'Generate'} Summary
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {call.summary_status === 'completed' && call.summary_content ? (
                            <div className="prose max-w-none text-sm leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>,
                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>
                                    }}
                                >
                                    {call.summary_content}
                                </ReactMarkdown>
                            </div>
                        ) : call.summary_status === 'processing' ? (
                            <div className="space-y-4">
                                <div className="text-center py-4 text-gray-500">
                                    <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Generating AI summary...</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Analyzing transcription content</span>
                                        <span>{Math.round(summaryProgress)}%</span>
                                    </div>
                                    <Progress value={summaryProgress} className="w-full" />
                                </div>
                            </div>
                        ) : call.summary_status === 'failed' ? (
                            <div className="text-center py-8 text-red-500">
                                <p>Summary generation failed. Please try again.</p>
                            </div>
                        ) : !call.transcribe_content ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Transcription required before generating summary</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No summary available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
} 
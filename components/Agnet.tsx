"use client";

import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string
}

interface AgentProps {
    userName: string;
    userId: string;
    type: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [interviewGenerated, setInterviewGenerated] = useState(false);

    useEffect(() => {
        const onCallStart = () => {
            console.log('Call started');
            setCallStatus(CallStatus.ACTIVE);
        }
        
        const onCallEnd = () => {
            console.log('Call ended');
            setCallStatus(CallStatus.FINISHED);
        }

        const onMessage = (message: any) => {
            console.log('Received message:', message);
            
            if (message.type == 'transcript' && message.transcriptType == 'final') {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages((prev) => [...prev, newMessage]);
            }
            
            // Listen for function calls (API requests)
            if (message.type === 'function-call') {
                console.log('Function call detected:', message.functionCall);
                if (message.functionCall?.name === 'generateInterview') {
                    setInterviewGenerated(true);
                    console.log('Interview generation triggered');
                }
            }

            // Listen for tool calls (API responses)
            if (message.type === 'tool-calls') {
                console.log('Tool call response:', message);
            }
        }

        const onSpeechStart = () => {
            console.log('Speech started');
            setIsSpeaking(true);
        }
        
        const onSpeechEnd = () => {
            console.log('Speech ended');
            setIsSpeaking(false);
        }

        const onError = (error: any) => {
            console.error("Vapi Error:", error);
        }

        // Register event listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            // Cleanup event listeners
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, [])

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            // Small delay before redirect to show final state
            setTimeout(() => {
                router.push('/');
            }, 2000);
        }
    }, [callStatus, router])

    const handleCall = async () => {
        try {
            setCallStatus(CallStatus.CONNECTING);
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

            if (!assistantId) {
                throw new Error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set");
            }

            console.log("Starting call with assistant:", assistantId);
            console.log("User details:", { username: userName, userid: userId });

            // Start the call with user variables
            const assistantOverrides = {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            };

            await vapi.start(assistantId, assistantOverrides);
            console.log("Call started successfully");

        } catch (error) {
            console.error("Failed to start call:", error);
            setCallStatus(CallStatus.FINISHED);
        }
    };

    const handleDisconnect = async () => {
        console.log("Disconnecting call");
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className='avatar'>
                        <Image 
                            src="/ai-avatar.png"
                            alt="AI Interviewer" 
                            width={65} 
                            height={54}
                            className='object-cover'
                        />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interviewer</h3>
                    {interviewGenerated && (
                        <p className="text-sm text-green-600">Interview Generated ✓</p>
                    )}
                </div>
                
                {messages.length > 0 && (
                    <div className='transcript-border'>
                        <div className='transcript'>
                            <p key={latestMessage} className={cn(
                                'transition-opacity duration-500 opacity-0', 
                                'animated-fadeIn opacity-100'
                            )}>
                                {latestMessage}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className='card-border'>
                    <div className='card-content'>
                        <Image 
                            src="/sahir.jpg"
                            alt='user' 
                            width={540} 
                            height={540}
                            className='rounded-full object-cover size-[120px]'
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>    
            </div>
            
            <div className='w-full flex justify-center'>
                {callStatus !== 'ACTIVE' ? (
                    <button className='relative btn-call' onClick={handleCall}>
                        <span className={cn(
                            'absolute animate-ping rounded-full opacity-75', 
                            callStatus !== 'CONNECTING' && 'hidden'
                        )}/>
                        <span>
                            {isCallInactiveOrFinished ? 'Start Interview' : 'Connecting...'}
                        </span>
                    </button>
                ) : (
                    <button className='btn-disconnect' onClick={handleDisconnect}>
                        End Interview
                    </button>
                )}  
            </div>
        </>
    )
}

export default Agent;
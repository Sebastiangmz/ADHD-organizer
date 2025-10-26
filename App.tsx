
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob, LiveServerMessage } from '@google/genai';
import { Task } from './types';
import TaskItem from './components/TaskItem';
import { MicrophoneIcon, StopIcon } from './components/icons';
import { organizeTextIntoTasks } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Helper Functions
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const App: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopRecording = useCallback(async () => {
        if (!isRecording) return;
        
        setIsRecording(false);

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close();

        sessionPromiseRef.current = null;
        audioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;

        if (transcription.trim().length > 2) {
            setIsLoading(true);
            setError(null);
            try {
                const organizedTasks = await organizeTextIntoTasks(transcription);
                setTasks(organizedTasks);
            } catch (e: any) {
                setError(e.message || "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
        setTranscription('');
    }, [isRecording, transcription]);

    const startRecording = async () => {
        if (isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            setError(null);
            setTasks([]);

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => console.log('Live session opened.'),
                    onclose: () => console.log('Live session closed.'),
                    onerror: (e) => {
                        console.error('Live session error:', e);
                        setError('A connection error occurred. Please try again.');
                        stopRecording();
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscription(prev => prev + text);
                        }
                    }
                }
            });

            mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(e => console.error("Error sending audio data:", e));
                }
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);

        } catch (err) {
            console.error("Failed to start recording:", err);
            setError("Could not access microphone. Please check your browser permissions.");
            setIsRecording(false);
        }
    };

    const handleToggleTask = (taskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        subtasks: task.subtasks.map(sub => ({ ...sub, completed: !task.completed }))
                      }
                    : task
            )
        );
    };

    const handleToggleSubtask = (taskId: string, subtaskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map(sub =>
                            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
                        )
                      }
                    : task
            )
        );
    };
    
    useEffect(() => {
        // Auto-complete main task if all its subtasks are completed
        setTasks(prevTasks =>
            prevTasks.map(task => {
                const allSubtasksCompleted = task.subtasks.length > 0 && task.subtasks.every(s => s.completed);
                if (allSubtasksCompleted && !task.completed) {
                    return { ...task, completed: true };
                }
                // Un-complete main task if any subtask is un-completed
                if (!allSubtasksCompleted && task.completed && task.subtasks.some(s => !s.completed)) {
                    return { ...task, completed: false};
                }
                return task;
            })
        );
    }, [tasks]);


    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">FocusFlow AI</h1>
                    <p className="text-gray-500 mt-1">Tu asistente personal para organizar el caos del TDAH.</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">¿Qué tienes en mente?</h2>
                    <p className="text-gray-600 mt-1">Presiona el micrófono y habla libremente. Yo me encargo de organizar tus ideas.</p>
                    
                    <div className="mt-6 flex flex-col items-center">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 text-white ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-105' : 'bg-blue-600 hover:bg-blue-700'}`}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            {isRecording ? <StopIcon className="w-8 h-8"/> : <MicrophoneIcon className="w-10 h-10"/>}
                        </button>
                         {isRecording && <p className="mt-4 text-blue-600 font-medium animate-pulse">Escuchando...</p>}
                    </div>

                    {transcription && isRecording && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                            <p className="text-gray-700 italic">{transcription}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    {isLoading && <LoadingSpinner message="Organizando tus pensamientos..." />}
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}
                    
                    {!isLoading && tasks.length > 0 && (
                        <div>
                           <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu Plan de Acción</h2>
                           {tasks.map(task => (
                               <TaskItem key={task.id} task={task} onToggleTask={handleToggleTask} onToggleSubtask={handleToggleSubtask} />
                           ))}
                        </div>
                    )}

                    {!isLoading && tasks.length === 0 && !error && (
                        <div className="text-center py-12 px-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Aquí aparecerán tus tareas</h3>
                            <p className="mt-1 text-sm text-gray-500">Usa el micrófono para empezar a organizar tu día.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;

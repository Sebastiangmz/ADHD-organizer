
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Session, Modality, Blob, LiveServerMessage } from '@google/genai';
import { Task } from './types';
import TaskItem from './components/TaskItem';
import { MicrophoneIcon, StopIcon } from './components/icons';
import { organizeTextIntoTasks } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import StorageError from './components/StorageError';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import StorageIndicator from './components/StorageIndicator';

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

// Spanish Date Formatter
function formatDateSpanish(dateString: string): string {
    try {
        const date = new Date(dateString + 'T00:00:00Z'); // Treat as UTC to avoid timezone issues
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } catch (e) {
        return dateString; // Fallback to original if parsing fails
    }
}

type TabType = 'grabar' | 'tareas' | 'calendario';

const App: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [storageError, setStorageError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('grabar');
    const [serverError, setServerError] = useState<string | null>(null);
    const [isMigrating, setIsMigrating] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [calendarGroupBy, setCalendarGroupBy] = useState<'createdAt' | 'targetDate'>('createdAt');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const sessionPromiseRef = useRef<Promise<Session> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Load tasks from database on mount, with migration from localStorage if needed
    useEffect(() => {
        async function initializeTasks() {
            try {
                // Check if server is available
                const serverAvailable = await apiService.healthCheck();

                if (!serverAvailable) {
                    setServerError('No se puede conectar al servidor. Asegúrate de que esté ejecutándose.');
                    // Fallback to localStorage
                    const storedTasks = storageService.getTasks();
                    if (storedTasks.length > 0) {
                        setTasks(storedTasks);
                    }
                    setIsInitialized(true);
                    return;
                }

                // Try to load from database
                const dbTasks = await apiService.getTasks();

                // If database is empty but localStorage has data, migrate
                if (dbTasks.length === 0) {
                    const localTasks = storageService.getTasks();
                    if (localTasks.length > 0) {
                        setIsMigrating(true);
                        console.log('Migrating tasks from localStorage to database...');
                        try {
                            const result = await apiService.bulkCreateTasks(localTasks);
                            console.log(`Migration complete: ${result.success} tasks migrated, ${result.errors} errors`);
                            // Reload tasks from database
                            const migratedTasks = await apiService.getTasks();
                            setTasks(migratedTasks);
                            // Clear localStorage after successful migration
                            storageService.clearAll();
                        } catch (migrationError) {
                            console.error('Migration failed:', migrationError);
                            setStorageError('Error al migrar las tareas. Usando datos locales.');
                            setTasks(localTasks);
                        } finally {
                            setIsMigrating(false);
                        }
                    } else {
                        setTasks([]);
                    }
                } else {
                    setTasks(dbTasks);
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing tasks:', error);
                setServerError('Error al cargar las tareas del servidor.');
                // Fallback to localStorage
                try {
                    const storedTasks = storageService.getTasks();
                    if (storedTasks.length > 0) {
                        setTasks(storedTasks);
                    }
                } catch (localError) {
                    console.error('Error loading from localStorage:', localError);
                }
                setIsInitialized(true);
            }
        }

        initializeTasks();
    }, []);

    // Auto-save to localStorage as backup when server is unavailable
    useEffect(() => {
        if (!isInitialized) return;
        if (serverError) {
            // Only use localStorage as fallback when server is unavailable
            try {
                storageService.saveTasks(tasks);
                setStorageError(null);
            } catch (error: any) {
                console.error('Error saving tasks to storage:', error);
                if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
                    setStorageError(error.message);
                } else {
                    setStorageError('Error al guardar las tareas.');
                }
            }
        }
    }, [tasks, isInitialized, serverError]);

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

                // Save to database if server is available
                if (!serverError) {
                    const createdTasks: Task[] = [];
                    for (const task of organizedTasks) {
                        try {
                            const createdTask = await apiService.createTask(task);
                            createdTasks.push(createdTask);
                        } catch (apiError) {
                            console.error('Error saving task to database:', apiError);
                            // Add to local state anyway
                            createdTasks.push(task);
                        }
                    }
                    setTasks(prevTasks => [...prevTasks, ...createdTasks]);
                } else {
                    // Fallback to local state only
                    setTasks(prevTasks => [...prevTasks, ...organizedTasks]);
                }
            } catch (e: any) {
                setError(e.message || "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
        setTranscription('');
    }, [isRecording, transcription, serverError]);

    const startRecording = async () => {
        if (isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            setError(null);

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

    const handleToggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = {
            ...task,
            completed: !task.completed,
            subtasks: task.subtasks.map(sub => ({ ...sub, completed: !task.completed }))
        };

        // Optimistic update
        setTasks(prevTasks =>
            prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );

        // Save to database
        if (!serverError) {
            try {
                await apiService.updateTask(taskId, updatedTask);
            } catch (error) {
                console.error('Error updating task:', error);
                // Revert on error
                setTasks(prevTasks =>
                    prevTasks.map(t => t.id === taskId ? task : t)
                );
            }
        }
    };

    const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = {
            ...task,
            subtasks: task.subtasks.map(sub =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            )
        };

        // Optimistic update
        setTasks(prevTasks =>
            prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );

        // Save to database
        if (!serverError) {
            try {
                await apiService.updateTask(taskId, updatedTask);
            } catch (error) {
                console.error('Error updating subtask:', error);
                // Revert on error
                setTasks(prevTasks =>
                    prevTasks.map(t => t.id === taskId ? task : t)
                );
            }
        }
    };

    const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        // Generate unique ID
        const newTask: Task = {
            ...taskData,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
        };

        // Optimistic update
        setTasks(prevTasks => [...prevTasks, newTask]);
        setShowCreateForm(false);

        // Save to database
        if (!serverError) {
            try {
                await apiService.createTask(newTask);
            } catch (error) {
                console.error('Error creating task:', error);
                setError('Error al crear la tarea en el servidor');
            }
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const handleSaveEditTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        if (!editingTask) return;

        const updatedTask = { ...editingTask, ...taskData };

        // Optimistic update
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === editingTask.id ? updatedTask : task
            )
        );
        setEditingTask(null);

        // Save to database
        if (!serverError) {
            try {
                await apiService.updateTask(editingTask.id, updatedTask);
            } catch (error) {
                console.error('Error updating task:', error);
                setError('Error al actualizar la tarea en el servidor');
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);

        // Optimistic update
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        // Delete from database
        if (!serverError) {
            try {
                await apiService.deleteTask(taskId);
            } catch (error) {
                console.error('Error deleting task:', error);
                setError('Error al eliminar la tarea del servidor');
                // Revert on error
                if (task) {
                    setTasks(prevTasks => [...prevTasks, task]);
                }
            }
        }
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
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('grabar')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            activeTab === 'grabar'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                    >
                        Grabar
                    </button>
                    <button
                        onClick={() => setActiveTab('tareas')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            activeTab === 'tareas'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                    >
                        Tareas
                    </button>
                    <button
                        onClick={() => setActiveTab('calendario')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            activeTab === 'calendario'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                    >
                        Calendario
                    </button>
                </div>

                {/* Grabar Tab */}
                {activeTab === 'grabar' && (
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
                )}

                {/* Tareas Tab */}
                {activeTab === 'tareas' && (
                    <div>
                        {showCreateForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <TaskForm
                                            mode="create"
                                            onSubmit={handleCreateTask}
                                            onCancel={() => setShowCreateForm(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {editingTask && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <TaskForm
                                            mode="edit"
                                            initialTask={editingTask}
                                            onSubmit={handleSaveEditTask}
                                            onCancel={() => setEditingTask(null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Tu Plan de Acción</h2>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                + Nueva Tarea
                            </button>
                        </div>

                        {/* Storage Indicator */}
                        <div className="mb-6">
                            <StorageIndicator showDetails={true} />
                        </div>

                        {isMigrating && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-4" role="alert">
                                <p className="font-bold">Migrando datos...</p>
                                <p>Transfiriendo tus tareas a la base de datos permanente.</p>
                            </div>
                        )}
                        {serverError && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-4" role="alert">
                                <p className="font-bold">⚠️ Modo Sin Conexión</p>
                                <p>{serverError} Los cambios se guardan localmente.</p>
                            </div>
                        )}
                        {storageError && <StorageError message={storageError} onClear={() => setTasks([])} />}
                        {isLoading && <LoadingSpinner message="Organizando tus pensamientos..." />}
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}

                        {!isLoading && tasks.length > 0 && (
                            <div>
                               {tasks.map(task => (
                                   <TaskItem
                                       key={task.id}
                                       task={task}
                                       onToggleTask={handleToggleTask}
                                       onToggleSubtask={handleToggleSubtask}
                                       onEdit={handleEditTask}
                                       onDelete={handleDeleteTask}
                                   />
                               ))}
                            </div>
                        )}

                        {!isLoading && tasks.length === 0 && !error && (
                            <div className="text-center py-12 px-6 bg-white rounded-xl shadow-md border border-gray-200">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Aquí aparecerán tus tareas</h3>
                                <p className="mt-1 text-sm text-gray-500">Usa el micrófono o crea una nueva tarea para empezar a organizar tu día.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Calendario Tab */}
                {activeTab === 'calendario' && (
                    <div>
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Agrupar por:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={calendarGroupBy === 'createdAt'}
                                        onChange={() => setCalendarGroupBy('createdAt')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700">Fecha de Creación</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={calendarGroupBy === 'targetDate'}
                                        onChange={() => setCalendarGroupBy('targetDate')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700">Fecha Objetivo</span>
                                </label>
                            </div>
                        </div>

                        <Calendar
                            tasks={tasks}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            groupBy={calendarGroupBy}
                        />

                        {/* Unscheduled Tasks Section (when grouping by targetDate) */}
                        {calendarGroupBy === 'targetDate' && (
                            <div className="mt-8 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Tareas Sin Fecha Asignada</h2>
                                {tasks.filter(task => !task.targetDate).length > 0 ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {tasks.filter(task => !task.targetDate).length} tarea{tasks.filter(task => !task.targetDate).length !== 1 ? 's' : ''} sin fecha planificada
                                        </p>
                                        {tasks.filter(task => !task.targetDate).map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleTask={handleToggleTask}
                                                onToggleSubtask={handleToggleSubtask}
                                                onEdit={handleEditTask}
                                                onDelete={handleDeleteTask}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-6 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-green-700 font-medium">✨ ¡Todas las tareas tienen fecha asignada!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedDate && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tareas de {formatDateSpanish(selectedDate)}</h2>
                                {tasks.filter(task => {
                                    const dateField = calendarGroupBy === 'createdAt' ? task.createdAt : task.targetDate;
                                    if (!dateField) return false;
                                    const taskDate = dateField.split('T')[0];
                                    return taskDate === selectedDate;
                                }).length > 0 ? (
                                    <div>
                                        {tasks.filter(task => {
                                            const dateField = calendarGroupBy === 'createdAt' ? task.createdAt : task.targetDate;
                                            if (!dateField) return false;
                                            const taskDate = dateField.split('T')[0];
                                            return taskDate === selectedDate;
                                        }).map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleTask={handleToggleTask}
                                                onToggleSubtask={handleToggleSubtask}
                                                onEdit={handleEditTask}
                                                onDelete={handleDeleteTask}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-6 bg-white rounded-xl shadow-md border border-gray-200">
                                        <p className="text-gray-500">No hay tareas para esta fecha.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;

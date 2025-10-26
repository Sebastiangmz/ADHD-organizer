
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const organizeTasksSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: "A unique identifier for the task, like a UUID.",
      },
      title: {
        type: Type.STRING,
        description: "A concise title for the main task.",
      },
      priority: {
        type: Type.STRING,
        enum: ["Alta", "Media", "Baja"],
        description: "The priority level of the task.",
      },
      details: {
        type: Type.STRING,
        description: "Optional additional details or context for the task.",
      },
      subtasks: {
        type: Type.ARRAY,
        description: "A list of smaller, actionable steps to complete the main task.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: "A unique identifier for the subtask.",
            },
            text: {
              type: Type.STRING,
              description: "The description of the subtask.",
            },
          },
          required: ["id", "text"],
        },
      },
    },
    required: ["id", "title", "priority", "subtasks"],
  },
};


export async function organizeTextIntoTasks(transcription: string): Promise<Task[]> {
    if (!transcription.trim()) {
        return [];
    }

    const systemInstruction = `Eres un asistente de funciones ejecutivas de clase mundial especializado en ayudar a personas con TDAH. Tu tarea es tomar un flujo de conciencia desorganizado y convertirlo en una lista de tareas estructurada, priorizada y procesable. No omitas ningún detalle. Identifica las tareas principales, divídelas en subtareas más pequeñas y manejables si es necesario, y asigna un nivel de prioridad (Alta, Media, Baja) a cada tarea principal. Genera IDs únicos para cada tarea y subtarea. El resultado DEBE ser un JSON que se ajuste al esquema proporcionado.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{
                role: "user",
                parts: [{ text: transcription }]
            }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: organizeTasksSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });
        
        const jsonResponse = response.text;
        const parsedTasks = JSON.parse(jsonResponse) as any[];

        // Add completed status to tasks and subtasks
        return parsedTasks.map(task => ({
            ...task,
            completed: false,
            subtasks: task.subtasks.map((sub: any) => ({ ...sub, completed: false }))
        }));

    } catch (error) {
        console.error("Error organizing tasks with Gemini:", error);
        throw new Error("Failed to organize tasks. The AI model might be experiencing issues.");
    }
}

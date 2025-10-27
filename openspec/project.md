# Project Context

## Purpose
FocusFlow AI is an intelligent personal assistant specifically designed for individuals with ADHD. The application allows users to speak their thoughts freely, which are then transcribed in real-time, intelligently organized, and prioritized into an actionable to-do list with breakdown into subtasks.

## Tech Stack
- TypeScript 5.8.3
- React 19.2.0
- Vite 6.4.1 (build tool and dev server)
- Google Gemini AI (@google/genai 1.27.0)
  - gemini-2.5-flash-native-audio-preview for real-time transcription
  - gemini-2.5-pro for task organization
- Tailwind CSS (via CDN)
- Web Audio API for microphone input

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- Functional React components with hooks
- ES2022+ features
- ESNext module resolution
- Spanish language for all user-facing text
- Imperative naming for functions (e.g., startRecording, stopRecording)

### Architecture Patterns
- Component-based architecture with clear separation:
  - `/components/` - Reusable UI components
  - `/services/` - Business logic and API integrations
  - `/types.ts` - Centralized TypeScript definitions
- State management using React hooks (useState, useRef, useCallback, useEffect)
- Async/await for API calls and async operations
- Error boundaries and user-friendly error messages

### Testing Strategy
Currently no automated testing framework implemented. Future consideration for:
- Unit tests for services
- Integration tests for AI workflows
- E2E tests for critical user journeys

### Git Workflow
- Main branch: `main`
- Conventional commits preferred
- Environment files (.env) are gitignored

## Domain Context

### ADHD-Specific Considerations
- Users may have difficulty organizing scattered thoughts
- Clear visual hierarchy is critical (color-coded priorities)
- Immediate feedback and encouraging messaging
- Subtasks help break down overwhelming main tasks
- Persistence is crucial - losing work can be particularly frustrating for ADHD users

### Core Workflows
1. Voice capture: User speaks freely into microphone
2. Real-time transcription: Audio converted to text via Gemini
3. AI organization: Gemini structures thoughts into prioritized tasks with subtasks
4. Interactive management: Users can check off completed items

### Data Model
- **Task**: Main actionable item with id, title, priority (Alta/Media/Baja), optional details, subtasks array, completed status
- **Subtask**: Smaller step within a task with id, text, completed status
- Auto-completion: Main task completes when all subtasks are done

## Important Constraints
- Browser-based application (no mobile app currently)
- Requires microphone permissions
- Gemini API rate limits apply
- Real-time audio requires 16kHz PCM format
- Spanish language UI (all text, prompts, system instructions)

## External Dependencies
- Google Gemini API (requires API key)
- Web Audio API (browser feature)
- Modern browser with ES2022 support
- Microphone hardware access

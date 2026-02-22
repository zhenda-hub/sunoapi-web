# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sunoapi-web is a Vue 3 + TypeScript web application that provides a frontend interface for the Suno AI music generation API. Users can generate music and lyrics through a clean web interface.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on :5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Tech Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict mode
- **Vite** for build tooling and dev server
- **Pinia** for state management
- **Vue Router** for navigation
- **Axios** for HTTP requests
- **TailwindCSS** for styling

### Project Structure

```
src/
├── api/           # API client and Suno API integration
├── components/    # Reusable Vue components
├── composables/   # Vue composition functions (shared logic)
├── stores/        # Pinia stores for global state
├── views/         # Page components
├── router/        # Vue Router configuration
├── App.vue        # Root component
└── main.ts        # Entry point
```

### API Integration

The app connects to `https://api.sunoapi.org/api/v1` using Bearer token authentication.

**Key patterns:**
- API Key is stored in `localStorage` and managed via Pinia store
- Axios interceptor automatically injects `Authorization: Bearer {key}` header
- Long-running generation tasks use polling (3s interval via `VITE_POLL_INTERVAL`)
- Task states: `PENDING` → `SUCCESS`/`FAILED`

### Suno API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate` | POST | Generate music |
| `/lyrics` | POST | Generate lyrics |
| `/generate/record-info` | GET | Query task status |
| `/get-credits` | GET | Get remaining credits |

### State Management Pattern

**Auth Store** (`stores/auth.ts`):
- Manages API key (localStorage + Pinia)
- `apiKey`, `isAuthenticated` state
- `setApiKey()`, `clearApiKey()`, `initFromStorage()` actions

**Tasks Store** (`stores/tasks.ts`):
- Tracks active generation tasks
- Task structure: `{ id, type, status, prompt, result, error, createdAt }`
- `addTask()`, `updateTask()`, `removeTask()` actions

### Composables Pattern

Shared logic is extracted into composables in `src/composables/`:
- `useAuth.ts` - Authentication logic
- `useTaskPolling.ts` - Task status polling
- `useCredits.ts` - Credits query

### Path Aliases

`@` resolves to `./src` - use for clean imports:
```ts
import { something } from '@/api/client'
```

## Environment Variables

Create `.env` file (see `.env.example`):

```env
VITE_API_BASE_URL=https://api.sunoapi.org/api/v1
VITE_POLL_INTERVAL=3000
```

## Component Conventions

- Use `<script setup lang="ts">` syntax
- Define props with `defineProps<T>()`
- Emit events with `defineEmits<T>()`
- Use TailwindCSS classes for styling
- Keep components focused on single responsibility

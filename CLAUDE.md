# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 frontend application for Pipecat, integrating with Daily.co for real-time video/audio communication. The project uses the App Router architecture with React 19, TypeScript, and Tailwind CSS 4.

**IMPORTANT: This is a hackathon project. Keep everything simple and pragmatic. Do NOT overcomplicate or over-engineer solutions. Speed and functionality matter more than perfect architecture. Make the simplest change that works.**

## Key Technologies

- **Next.js 15.5.4** with Turbopack for fast builds
- **React 19.1.0** with React Server Components
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS 4** with new @theme inline syntax
- **Daily.co** (@daily-co/daily-js ^0.84.0, @daily-co/daily-react ^0.23.2) for WebRTC communication
- **Utility libraries**: clsx, tailwind-merge, class-variance-authority, lucide-react

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Project Structure

- **src/app/**: Next.js App Router pages and layouts
  - `layout.tsx`: Root layout with Geist font configuration (sans and mono variants)
  - `page.tsx`: Home page component
  - `globals.css`: Global styles with Tailwind and CSS variables for theming

## Important Configuration Details

### TypeScript Configuration

- Path alias `@/*` maps to `./src/*`
- Target: ES2017 with strict mode enabled
- Module resolution: bundler mode

### Build System

- Uses Turbopack for both dev and build commands (--turbopack flag)
- Next.js App Router with React Server Components by default

### Styling

- Tailwind CSS 4 uses new `@theme inline` syntax instead of traditional config files
- CSS variables defined for theming: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode support via `prefers-color-scheme`
- Font CSS variables: `--font-geist-sans` and `--font-geist-mono` from next/font/google

### Daily.co Integration

The project includes both @daily-co/daily-js (core SDK) and @daily-co/daily-react (React hooks and components). When working with video/audio features:

- Use daily-react hooks for React component integration
- daily-js provides lower-level access to Daily's JavaScript SDK

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.

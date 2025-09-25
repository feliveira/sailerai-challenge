# Sailer AI Frontend Challenge

Sailer develops AI agents that manage business conversations at scale. This project focuses on building the core omnichannel interface that enables human agents to monitor, collaborate with, and seamlessly take over conversations handled by their AI.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Decisions & Trade-offs](#decisions--trade-offs)
- [Future Improvements](#future-improvements)
- [Technologies Used](#technologies-used)
- [Additional Notes](#additional-notes)

## Installation

### Prerequisites

- Node.js (version 18.x or higher)
- npm or yarn package manager

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-name>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── assets/          # Static assets and uncompiled resources
│   └── css/         # Global styles, Tailwind configuration
├── components/      # Reusable Vue components organized by feature or page
│   ├── chat/        # Components specific to the chats page
│   └── dashboard/   # Components used in dashboard-related routes
├── composables/     # Reusable functions using the Composition API, encapsulating state and logic
├── layouts/         # Application layout templates
├── pages/           # File-based Vue routes
├── types/           # TypeScript type definitions and interfaces
├── tests/           # Automated tests
│   ├── components/  # Component-specific test files
│   └── composables/ # Tests for composables
├── nuxt.config.ts   # Nuxt project configuration
└── vitest.config.ts # Vitest testing framework configuration
```

## Decisions & Trade-offs

### Architecture Decisions

#### Component Structure
Components are organized by feature or page (e.g., chat, dashboard) with further subfolders for logical grouping (ChatSidebar, ChatWindow). This makes the project modular and easy to navigate as it scales. Shared components that can be reused across features are placed in a shared folder.

#### Composables for State and Logic:
State management and reusable logic are encapsulated in Vue 3 composables (e.g., useApi.ts, useChatOperations.ts, useWebSocketChat.ts). This approach allows composables to be reused across multiple components without introducing a global state library.

#### Layouts
Different layouts are used for different parts of the app (e.g., dashboard.vue) to maintain consistent structure and styling across pages.

#### Testing Strategy
Tests are organized mirroring the project structure, with separate folders for component and composable tests. This makes it clear where tests belong and ensures maintainability.

#### State Management Trade-off:
A global state library like Pinia was not used to keep the project lightweight. For this scale, composables were sufficient. If the app grows or requires more complex state sharing, integrating Pinia would be a natural next step.

## Future Improvements

If I had another week, I would focus on:

- Setting up automated code quality checks (ESLint, Prettier, Husky)

- Increasing unit test coverage and adding coverage reports on pull requests

- Adding basic authentication (e.g., Supabase) for guarded routes

- Improving the ChatMessage component to handle images better, instead of just showing the "Abrir Link" button

- Optimizing performance and load times

- Adding simple user feedback features

These changes would make the project more maintainable, secure, and user-friendly.

## Technologies Used

- **Framework**: Nuxt 3
- **Frontend**: Vue 3, TypeScript
- **Styling**: Tailwind
- **Testing**: Vitest, Vue Test Utils
---

## Additional Notes

This project was a great learning opportunity. I am very grateful for the opportunity to have participated in this challenge and for everything I was able to learn throughout the process, regardless of the final outcome of the selection process.
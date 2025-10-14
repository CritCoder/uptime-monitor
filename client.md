# Client Frontend Instructions

## Overview
This is a single-page application (SPA) built with React.js, designed to provide a seamless user experience for monitoring uptime and related services.

## Framework and Libraries
- **React** for component-based UI development.
- **React Router** for client-side routing.
- **React Query** for server-state management and data fetching.
- **React Helmet** for managing document head.
- **Heroicons** for consistent iconography.

## Context and State Management
- **AuthContext**: Manages user authentication state and handles login/logout flows.
- **SocketContext**: Manages WebSocket connections for real-time data updates.
- **ThemeContext**: Handles light/dark mode toggling with persistent state.

## UI Components & Pages
- Build reusable components such as buttons, forms, and modals.
- **Pages**: Implement routes and pages for dashboard, login, registration, incident views, and more.

## Styling
- Responsive design considerations for desktop and mobile views.
- Use Tailwind CSS for utility-first styling.

## Development Workflow
1. Set up the environment by installing dependencies with `yarn`.
2. Use hot reloading for development via Vite.
3. Ensure code quality with ESLint and Prettier.

## Testing
- Implement unit tests and end-to-end tests for crucial workflows using Playwright or similar tools.
- Maintain a high code coverage with meaningful test cases.

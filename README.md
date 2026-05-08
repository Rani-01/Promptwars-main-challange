# AeroPlan - Dynamic Trip Planner

A modern, responsive, and dynamic trip-planning application built with React, Vite, and Framer Motion. This project fulfills the RICE framework principles for the PromptWars Main Challenge.

## Features & Implementation of Principles

1. **Code Quality**: 
   - The app is thoroughly structured into maintainable and reusable React components (`Sidebar`, `Itinerary`, `Toasts`).
   - Strong typing via TypeScript interfaces (`types.ts`) ensures readability and maintainability.
   - Clean, modular code separation between UI components and logical state.

2. **Security**: 
   - **Input Sanitization**: Basic validation and sanitization implemented for the destination input to prevent potential XSS vulnerabilities.
   - **Safe External Links**: Google Calendar API integration is carefully constructed with proper URL encoding for user safety.

3. **Efficiency**: 
   - Built on Vite for lightning-fast HMR and optimized production builds.
   - Core functions (`toggleSelection`, `handleGenerate`, `simulateWeatherEvent`) are wrapped in `useCallback`, and components are wrapped in `React.memo` to eliminate unnecessary DOM re-renders.

4. **Testing**: 
   - Core functionalities are covered using **Vitest** and **React Testing Library**.
   - Includes UI rendering tests, input validation tests, and asynchronous API mocking tests.
   - Run tests via `npm run test`.

5. **Accessibility (a11y)**: 
   - Extensive usage of ARIA attributes (`aria-label`, `aria-hidden`, `aria-live`).
   - Accessible form groups (`fieldset`, `legend`, `htmlFor`).
   - Full keyboard navigation support (`tabIndex`, `onKeyDown`) for inclusive and accessible usage.

6. **Google Services Integration**: 
   - Features a **"Add to Google Calendar"** integration that allows users to instantly export generated dynamic itinerary activities straight to their personal Google Calendar via a parameterized template URL.

## Getting Started

### Installation
```bash
# Navigate to the project directory
cd trip-planner

# Install all required dependencies
npm install

# Run the development server
npm run dev
```

### Running Tests
To validate the application's functionality:
```bash
npm run test
```

## Technologies Used
- React 18 & TypeScript
- Vite
- Framer Motion (for smooth animations)
- Lucide React (for premium iconography)
- Vitest & React Testing Library
- Vanilla CSS (with glassmorphism aesthetic)

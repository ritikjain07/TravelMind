<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# TravelMind - AI Travel Planner

This is a modern travel planning web application built with Vite, React, TypeScript, and Tailwind CSS. The app features AI-powered destination recommendations using the Gemini API and includes a personality-based customization system called "See Yourself."

## Key Features

- **Personality Profiling**: "See Yourself" feature that customizes travel recommendations based on user personality, mood, and preferences
- **AI-Powered Recommendations**: Integration with Gemini API for intelligent destination suggestions and travel tips
- **Modern UI**: Built with Tailwind CSS featuring sleek, responsive design
- **Context Management**: React Context for state management
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## Architecture

- `src/types/`: TypeScript type definitions
- `src/context/`: React Context for state management
- `src/services/`: API services (Gemini integration)
- `src/components/`: Reusable React components

## Coding Guidelines

- Use TypeScript for all components and services
- Follow React best practices with hooks and functional components
- Use Tailwind CSS classes for styling
- Implement responsive design patterns
- Keep components modular and reusable
- Use proper error handling for API calls
- Implement loading states for better UX

## Development Notes

- The Gemini API key should be configured in `.env` file
- Mock data is provided when API key is not available
- Components use modern React patterns with hooks
- State management through React Context
- Fully typed with TypeScript interfaces

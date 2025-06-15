import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, PersonalityProfile, TravelPreferences, Trip } from '../types';

interface AppState {
  user: UserProfile | null;
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'UPDATE_PERSONALITY'; payload: Partial<PersonalityProfile> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<TravelPreferences> }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_USER' };

const initialState: AppState = {
  user: null,
  currentTrip: null,
  isLoading: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    
    case 'UPDATE_PERSONALITY':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          personality: { ...state.user.personality, ...action.payload }
        }
      };
    
    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      };
    
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_USER':
      return { ...state, user: null, currentTrip: null };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Helper hooks
export function useUser() {
  const { state } = useAppContext();
  return state.user;
}

export function useCurrentTrip() {
  const { state } = useAppContext();
  return state.currentTrip;
}

export function usePersonality() {
  const { state, dispatch } = useAppContext();
  
  const updatePersonality = (updates: Partial<PersonalityProfile>) => {
    if (!state.user) {
      // Create a new user with default preferences when personality is first set
      const newUser: UserProfile = {
        id: 'user-' + Date.now(),
        name: 'User',
        personality: updates as PersonalityProfile,
        preferences: {
          budget: { min: 50, max: 200, currency: 'USD' },
          duration: { min: 3, max: 14 },
          climate: ['temperate'],
          activities: ['sightseeing', 'culture'],
          accommodation: ['hotel'],
          transportation: ['flight'],
          dietaryRestrictions: [],
          accessibility: []
        },
        tripHistory: []
      };
      dispatch({ type: 'SET_USER', payload: newUser });
    } else {
      dispatch({ type: 'UPDATE_PERSONALITY', payload: updates });
    }
  };
  
  return {
    personality: state.user?.personality,
    updatePersonality
  };
}

export function usePreferences() {
  const { state, dispatch } = useAppContext();
  
  const updatePreferences = (updates: Partial<TravelPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  };
  
  return {
    preferences: state.user?.preferences,
    updatePreferences
  };
}

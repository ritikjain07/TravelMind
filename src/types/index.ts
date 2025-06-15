export interface UserProfile {
  id: string;
  name: string;
  preferences: TravelPreferences;
  personality: PersonalityProfile;
  tripHistory: Trip[];
}

export interface PersonalityProfile {
  travelStyle: 'adventure' | 'relaxation' | 'cultural' | 'luxury' | 'budget' | 'family';
  activityLevel: 'low' | 'moderate' | 'high';
  socialPreference: 'solo' | 'couple' | 'small-group' | 'large-group';
  planningStyle: 'spontaneous' | 'flexible' | 'structured';
  interests: string[];
  mood: 'excited' | 'stressed' | 'curious' | 'adventurous' | 'peaceful';
}

export interface TravelPreferences {
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: {
    min: number;
    max: number;
  };
  accommodation: ('hotel' | 'hostel' | 'airbnb' | 'resort' | 'camping')[];
  transportation: ('flight' | 'train' | 'bus' | 'car' | 'boat')[];
  climate: ('tropical' | 'temperate' | 'cold' | 'desert' | 'any')[];
  activities: string[];
  dietaryRestrictions: string[];
  accessibility: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  averageCost: number;
  bestMonths: string[];
  activities: string[];
  mood: string[];
  travelStyle: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  id: string;
  title: string;
  destination: Destination;
  startDate: Date;
  endDate: Date;
  budget: number;
  itinerary: ItineraryItem[];
  status: 'planning' | 'booked' | 'completed' | 'cancelled';
  travelers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: number;
  duration: number; // in minutes
  type: 'transport' | 'accommodation' | 'activity' | 'meal' | 'sightseeing';
  bookingInfo?: {
    isBooked: boolean;
    confirmationNumber?: string;
    website?: string;
  };
}

export interface AIRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'restaurant' | 'accommodation' | 'route';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-1
  personalizedFor: PersonalityProfile;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    recommendations?: AIRecommendation[];
    destinations?: Destination[];
  };
}

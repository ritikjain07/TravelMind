import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIRecommendation, PersonalityProfile, TravelPreferences, Destination } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured. Using mock data.');
      this.genAI = null as any;
      this.model = null;
    } else {
      console.log('Gemini API key found, initializing AI service...');
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Updated to use the current Gemini model name
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }  async generateDestinationRecommendations(
    preferences: TravelPreferences,
    personality: PersonalityProfile,
    additionalContext?: string
  ): Promise<AIRecommendation[]> {
    if (!this.model) {
      console.log('Using mock data for destination recommendations');
      return this.getMockDestinationRecommendations(personality);
    }

    console.log('Calling Gemini API for personalized recommendations...');
    const prompt = this.buildDestinationPrompt(preferences, personality, additionalContext);
      try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API response received successfully');
      console.log('Raw response:', text);
      return this.parseDestinationRecommendations(text, personality);
    } catch (error) {
      console.warn('Gemini API call failed, falling back to mock data:', error);
      return this.getMockDestinationRecommendations(personality);
    }
  }

  async generateItinerary(
    destination: Destination,
    preferences: TravelPreferences,
    personality: PersonalityProfile,
    duration: number
  ): Promise<string> {
    if (!this.model) {
      return this.getMockItinerary(destination, duration);
    }

    const prompt = this.buildItineraryPrompt(destination, preferences, personality, duration);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating itinerary:', error);
      return this.getMockItinerary(destination, duration);
    }
  }

  async generateTravelTips(
    destination: Destination,
    personality: PersonalityProfile
  ): Promise<string[]> {
    if (!this.model) {
      return this.getMockTravelTips(destination);
    }

    const prompt = `Generate 5-7 personalized travel tips for someone visiting ${destination.name}, ${destination.country}. 
    Consider their travel style: ${personality.travelStyle}, activity level: ${personality.activityLevel}, 
    and interests: ${personality.interests.join(', ')}. 
    Make the tips practical, specific, and tailored to their personality.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split('\n').filter((tip: string) => tip.trim().length > 0).slice(0, 7);
    } catch (error) {
      console.error('Error generating travel tips:', error);
      return this.getMockTravelTips(destination);
    }
  }  private buildDestinationPrompt(
    preferences: TravelPreferences,
    personality: PersonalityProfile,
    additionalContext?: string
  ): string {
    return `You are a travel expert. Based on the traveler profile below, recommend exactly 4 destinations.

TRAVELER PROFILE:
- Budget: $${preferences.budget.min}-${preferences.budget.max} ${preferences.budget.currency} per day
- Trip Duration: ${preferences.duration.min}-${preferences.duration.max} days
- Travel Style: ${personality.travelStyle}
- Activity Level: ${personality.activityLevel}
- Social Preference: ${personality.socialPreference}
- Planning Style: ${personality.planningStyle}
- Current Mood: ${personality.mood}
- Interests: ${personality.interests.join(', ')}
${additionalContext ? `- Additional: ${additionalContext}` : ''}

REQUIRED: Return ONLY a valid JSON array with 4 destinations. No additional text, explanations, or markdown formatting.

JSON FORMAT:
[
  {
    "name": "City, Country",
    "description": "Brief description of why this destination is perfect",
    "reasoning": "Specific explanation of why this matches their profile",
    "country": "Country Name",
    "dailyBudget": 120,
    "bestMonths": ["Month1", "Month2"],
    "confidence": 0.9
  }
]

Return the JSON array now:`;
  }

  private buildItineraryPrompt(
    destination: Destination,
    preferences: TravelPreferences,
    personality: PersonalityProfile,
    duration: number
  ): string {
    return `Create a detailed ${duration}-day itinerary for ${destination.name}, ${destination.country}.

Traveler Profile:
- Travel Style: ${personality.travelStyle}
- Activity Level: ${personality.activityLevel}
- Interests: ${personality.interests.join(', ')}
- Budget: $${preferences.budget.min} - $${preferences.budget.max} per day
- Preferred Activities: ${preferences.activities.join(', ')}

Create a day-by-day schedule with:
- Morning, afternoon, and evening activities
- Specific locations and attractions
- Estimated costs and duration
- Transportation between locations
- Restaurant recommendations
- Cultural experiences that match their interests

Make it feel personalized and exciting, like a friend who knows them well created it.`;
  }  private parseDestinationRecommendations(text: string, personality: PersonalityProfile): AIRecommendation[] {
    console.log('Attempting to parse Gemini response...');
    
    try {
      // Clean the response - remove markdown formatting if present
      let cleanText = text.trim();
      
      // Remove markdown code block formatting if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to find JSON array in the response
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      console.log('Cleaned response for parsing:', cleanText);
      
      const parsed = JSON.parse(cleanText);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Successfully parsed JSON response');
        return parsed.map((dest: any, index: number) => ({
          id: String(index + 1),
          type: 'destination' as const,
          title: dest.name || dest.destination || dest.title || 'Unknown Destination',
          description: dest.description || 'A wonderful travel destination.',
          reasoning: dest.reasoning || dest.why || `Perfect match for your ${personality.travelStyle} travel style.`,
          confidence: typeof dest.confidence === 'number' ? dest.confidence : 0.85,
          personalizedFor: personality,
          metadata: {
            country: dest.country || 'Unknown',
            estimatedCost: typeof dest.dailyBudget === 'number' ? dest.dailyBudget : 
                          typeof dest.cost === 'number' ? dest.cost : 
                          typeof dest.estimatedCost === 'number' ? dest.estimatedCost : 100,
            bestMonths: Array.isArray(dest.bestTime) ? dest.bestTime : 
                       Array.isArray(dest.bestMonths) ? dest.bestMonths : 
                       ['Year-round']
          }
        }));
      }
    } catch (error) {
      console.warn('Failed to parse Gemini response as JSON:', error);
      console.log('Will use mock data as fallback');
    }
    
    // Fallback to mock data if parsing fails
    return this.getMockDestinationRecommendations(personality);
  }private getMockDestinationRecommendations(personality: PersonalityProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [
      {
        id: '1',
        type: 'destination',
        title: 'Kyoto, Japan',
        description: 'A perfect blend of ancient traditions and modern culture, ideal for cultural exploration.',
        reasoning: `This destination aligns with your ${personality.travelStyle} travel style and ${personality.mood} mood.`,
        confidence: 0.92,
        personalizedFor: personality,
        metadata: {
          country: 'Japan',
          estimatedCost: 150,
          bestMonths: ['March', 'April', 'October', 'November']
        }
      },
      {
        id: '2',
        type: 'destination',
        title: 'Santorini, Greece',
        description: 'Stunning sunsets, white-washed buildings, and crystal-clear waters for the perfect romantic getaway.',
        reasoning: `The peaceful atmosphere matches your current ${personality.mood} mood perfectly.`,
        confidence: 0.88,
        personalizedFor: personality,
        metadata: {
          country: 'Greece',
          estimatedCost: 120,
          bestMonths: ['May', 'June', 'September', 'October']
        }
      },
      {
        id: '3',
        type: 'destination',
        title: 'Bali, Indonesia',
        description: 'Tropical paradise perfect for relaxation and spiritual discovery.',
        reasoning: `The wellness and nature focus perfectly matches your ${personality.interests.join(', ')} interests.`,
        confidence: 0.85,
        personalizedFor: personality,
        metadata: {
          country: 'Indonesia',
          estimatedCost: 80,
          bestMonths: ['April', 'May', 'June', 'July', 'August', 'September']
        }
      },
      {
        id: '4',
        type: 'destination',
        title: 'Paris, France',
        description: 'The City of Light offers world-class art, cuisine, and romantic ambiance.',
        reasoning: `Perfect for your ${personality.travelStyle} style with amazing cultural experiences.`,
        confidence: 0.90,
        personalizedFor: personality,
        metadata: {
          country: 'France',
          estimatedCost: 180,
          bestMonths: ['April', 'May', 'June', 'September', 'October']
        }      }
    ];

    return recommendations;
  }

  private getMockItinerary(destination: Destination, duration: number): string {
    return `# ${duration}-Day Itinerary for ${destination.name}

## Day 1: Arrival & First Impressions
**Morning:**
- Arrive and check into accommodation
- Welcome breakfast at local café
- Orientation walk around main area

**Afternoon:**
- Visit main landmark/attraction
- Lunch at recommended restaurant
- Explore local market or shopping district

**Evening:**
- Sunset viewing at scenic spot
- Traditional dinner experience
- Early rest to overcome travel fatigue

## Day 2: Cultural Immersion
**Morning:**
- Museum or cultural site visit
- Coffee at local favorite spot
- Historical district exploration

**Afternoon:**
- Hands-on cultural activity/workshop
- Local lunch experience
- Park or garden visit

**Evening:**
- Local entertainment or show
- Dinner at highly-rated restaurant
- Evening stroll in vibrant area

${duration > 2 ? '## Day 3: Adventure & Discovery\n...' : ''}

*This itinerary is personalized based on your preferences and can be adjusted based on your mood and energy levels.*`;
  }

  private getMockTravelTips(destination: Destination): string[] {
    return [
      `Learn a few basic phrases in the local language - locals appreciate the effort`,
      `Download offline maps before you go to avoid data charges`,
      `Pack layers as weather can change quickly in ${destination.name}`,
      `Try the local street food - it's often the most authentic experience`,
      `Book popular attractions in advance to avoid disappointment`,
      `Keep copies of important documents in separate locations`,
      `Respect local customs and dress codes, especially at religious sites`
    ];
  }
}

export const geminiService = new GeminiService();

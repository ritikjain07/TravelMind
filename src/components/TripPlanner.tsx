import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Plus, X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { useUser, useAppContext } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import type { ItineraryItem, Trip } from '../types';

interface TripPlannerProps {
  onNavigate?: (tab: string) => void;
  preselectedDestination?: {
    name: string;
    country: string;
    estimatedCost?: number;
  };
}

export function TripPlanner({ onNavigate, preselectedDestination }: TripPlannerProps) {
  const user = useUser();
  const { dispatch } = useAppContext();
  const [tripDetails, setTripDetails] = useState({
    title: '',
    destination: preselectedDestination ? `${preselectedDestination.name}, ${preselectedDestination.country}` : '',
    startDate: '',
    endDate: '',
    budget: preselectedDestination?.estimatedCost ? String(preselectedDestination.estimatedCost * 7) : '', // Estimate for 7 days
    travelers: 1,
  });
  const [itinerary, setItinerary] = useState<Partial<ItineraryItem>[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  // Set smart defaults based on preselected destination
  useEffect(() => {
    if (preselectedDestination && !tripDetails.title) {
      // Set default dates (2 weeks from today for 7 days)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 14);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      setTripDetails(prev => ({
        ...prev,
        title: `${preselectedDestination.name} Adventure`,
        destination: `${preselectedDestination.name}, ${preselectedDestination.country}`,
        budget: preselectedDestination.estimatedCost ? String(preselectedDestination.estimatedCost * 7) : prev.budget,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  }, [preselectedDestination]);

  const calculateDuration = () => {
    if (tripDetails.startDate && tripDetails.endDate) {
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };
  const generateAIItinerary = async () => {
    if (!user?.preferences || !user?.personality || !tripDetails.destination) {
      alert('Please complete your profile and trip details first');
      return;
    }

    // Validate duration is reasonable
    const duration = calculateDuration();
    if (duration > 30) {
      alert('Please select a trip duration of 30 days or less for AI generation');
      return;
    }

    setIsGeneratingItinerary(true);
    try {
      console.log('Generating AI itinerary for:', {
        destination: tripDetails.destination,
        duration,
        budget: tripDetails.budget,
        travelers: tripDetails.travelers
      });

      const destination = {
        id: 'temp',
        name: tripDetails.destination,
        country: 'Unknown',
        description: '',
        imageUrl: '',
        averageCost: Number(tripDetails.budget) || 100,
        bestMonths: [],
        activities: [],
        mood: [],
        travelStyle: [],
        coordinates: { lat: 0, lng: 0 }
      };

      const itineraryText = await geminiService.generateItinerary(
        destination,
        user.preferences,
        user.personality,
        duration
      );

      console.log('Generated itinerary text:', itineraryText);

      // Parse the generated itinerary into structured items
      const parsedItinerary = parseItineraryText(itineraryText, duration);
      
      if (parsedItinerary.length === 0) {
        throw new Error('No activities could be parsed from the generated itinerary');
      }

      setItinerary(parsedItinerary);
      
      alert(`🎉 AI itinerary generated successfully! Added ${parsedItinerary.length} activities to your trip.`);
    } catch (error) {
      console.error('Failed to generate AI itinerary:', error);
      alert('Failed to generate itinerary. Please try again or create manually. Check the console for details.');
    } finally {
      setIsGeneratingItinerary(false);
    }
  };  const parseItineraryText = (text: string, duration: number): Partial<ItineraryItem>[] => {
    const items: Partial<ItineraryItem>[] = [];
    
    try {
      console.log('🔍 Raw input text length:', text.length);
      console.log('🔍 First 200 chars:', JSON.stringify(text.substring(0, 200)));
      
      // Clean the text and split into lines - handle different line endings
      const cleanText = text
        .replace(/\*\*/g, '')           // Remove bold markdown
        .replace(/\#/g, '')             // Remove hash symbols
        .replace(/\r\n/g, '\n')         // Normalize Windows line endings
        .replace(/\r/g, '\n');          // Normalize Mac line endings
      
      const lines = cleanText.split('\n')
        .map(line => line.trim())       // Trim each line
        .filter(line => line.length > 0); // Remove empty lines
      
      console.log('🔍 Total lines after processing:', lines.length);      
      let currentDay = 1;
      let currentTime = '09:00';
      let activitiesFound = 0;
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const trimmedLine = line.trim();
        
        console.log(`🔍 Line ${lineIndex + 1}/${lines.length}:`, JSON.stringify(trimmedLine.substring(0, 80)));
        
        // Skip empty lines and headers
        if (!trimmedLine || trimmedLine.startsWith('Hey ') || trimmedLine.startsWith('Stoked ') ||
            trimmedLine.startsWith('**Important Notes:**') || trimmedLine.startsWith('This is just') ||
            trimmedLine.startsWith('Best,') || trimmedLine.startsWith('[Your Name') ||
            trimmedLine.startsWith('Have an amazing') || trimmedLine.startsWith('* **Transportation:') ||
            trimmedLine.startsWith('* **Festivals:') || trimmedLine.startsWith('* **Budget:') ||
            trimmedLine.startsWith('* **Accommodation:') || trimmedLine.startsWith('Cheers,')) {
          console.log('Skipping line:', trimmedLine);
          continue;
        }
        
        // Look for day markers
        const dayMatch = trimmedLine.match(/Day\s+(\d+)/);
        if (dayMatch) {
          currentDay = parseInt(dayMatch[1]);
          currentTime = '09:00'; // Reset time for new day
          continue;
        }
        
        // Extract time of day and set current time
        if (trimmedLine.toLowerCase().includes('morning')) {
          currentTime = '09:00';
          continue;
        } else if (trimmedLine.toLowerCase().includes('afternoon')) {
          currentTime = '14:00';
          continue;
        } else if (trimmedLine.toLowerCase().includes('evening') || trimmedLine.toLowerCase().includes('night')) {
          currentTime = '18:00';
          continue;
        }        // Debug: Check if line starts with * and contains time patterns
        if (trimmedLine.startsWith('*') && (trimmedLine.includes('Morning') || trimmedLine.includes('Afternoon') || trimmedLine.includes('Evening'))) {
          console.log('🎯 FOUND ACTIVITY LINE:', JSON.stringify(trimmedLine));
          console.log('🎯 Line length:', trimmedLine.length);
          console.log('🎯 Character codes:', trimmedLine.split('').slice(0, 10).map(c => c.charCodeAt(0)));
        }
          // Extract activities - Updated patterns for actual Gemini format
        const activityPatterns = [
          // Primary patterns for the actual Gemini format: * Morning (9:00 AM - 12:00 PM): Activity
          /^\*\s*(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,                    // * Morning (9:00 AM - 12:00 PM): Activity
          /^\*\s*(Morning|Afternoon|Evening)\s*&\s*(Afternoon|Evening):\s*(.+)/i,      // * Morning & Afternoon: Activity
          /^\*\s*(Morning|Afternoon|Evening):\s*(.+)/i,                                // * Morning: Activity
          
          // Fallback patterns for other possible formats
          /^\*\s*\*\*(Morning|Afternoon|Evening)\s*\([^)]*\):\*\*\s*(.+)/i,           // * **Morning (time):** Activity
          /^\*\s*\*\*(Morning|Afternoon|Evening)\*\*:\s*(.+)/i,                       // * **Morning**: Activity
          /^(Morning|Afternoon|Evening)\s*\([^)]*\):\s*(.+)/i,                        // Morning (time): Activity
          /^(Morning|Afternoon|Evening):\s*(.+)/i                                     // Morning: Activity
        ];
        
        let activityLineMatch = null;
        for (let i = 0; i < activityPatterns.length; i++) {
          const pattern = activityPatterns[i];
          activityLineMatch = trimmedLine.match(pattern);
          if (activityLineMatch) {
            console.log('✅ MATCHED pattern #' + i + ':', pattern.source);
            console.log('✅ MATCHED line:', trimmedLine);
            console.log('✅ MATCH GROUPS:', activityLineMatch);
            break;
          } else if (trimmedLine.startsWith('*') && (trimmedLine.includes('Morning') || trimmedLine.includes('Afternoon') || trimmedLine.includes('Evening'))) {
            console.log('❌ Pattern #' + i + ' failed:', pattern.source);
            console.log('❌ Testing against:', JSON.stringify(trimmedLine.substring(0, 30)));
          }
        }          if (activityLineMatch) {
            // Handle different match group structures based on pattern matched
            let timeOfDay, activityText;
            
            if (activityLineMatch.length === 3) {
              // Standard pattern: [fullMatch, timeOfDay, activityText]
              [, timeOfDay, activityText] = activityLineMatch;
            } else if (activityLineMatch.length === 4) {
              // Pattern with & separator: [fullMatch, timeOfDay1, timeOfDay2, activityText]
              [, timeOfDay, , activityText] = activityLineMatch;
            }
            
            // Skip if we couldn't extract the required data
            if (!timeOfDay || !activityText) {
              console.log('❌ Missing timeOfDay or activityText:', { timeOfDay, activityText });
              continue;
            }
            
            console.log('✅ MATCHED activity:', { timeOfDay, activityText: activityText.substring(0, 50) });
            
            // Extract time from the parentheses - handle new format: (9:00 AM - 12:00 PM)
            const timeMatch = trimmedLine.match(/\(([^)]*)\)/);
            let extractedTime = null;
            
            if (timeMatch && timeMatch[1]) {
              const timeStr = timeMatch[1];
              console.log('🕐 Extracting time from:', timeStr);
              
              // Handle formats like "9:00 AM - 12:00 PM" or "9:00 AM" or "9am-12pm"
              const timePatterns = [
                /(\d{1,2}):(\d{2})\s*(AM|PM)/i,           // 9:00 AM
                /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-/i,       // 9:00 AM - (start time from range)
                /(\d{1,2})\s*(AM|PM)/i,                   // 9 AM
                /(\d{1,2})\s*(am|pm)/i                    // 9am
              ];
              
              for (const pattern of timePatterns) {
                const timeConversion = timeStr.match(pattern);
                if (timeConversion) {
                  let hours = parseInt(timeConversion[1]);
                  const minutes = timeConversion[2] ? parseInt(timeConversion[2]) : 0;
                  const ampm = timeConversion[3];
                  
                  // Convert to 24-hour format
                  if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
                    hours += 12;
                  } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
                    hours = 0;
                  }
                  
                  extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                  console.log('🕐 Converted time:', extractedTime);
                  break;
                }
              }
            }
          
          // Use extracted time or fall back to default time based on period
          if (extractedTime) {
            currentTime = extractedTime;
          } else {
            switch (timeOfDay.toLowerCase()) {
              case 'morning':
                currentTime = '09:00';
                break;
              case 'afternoon':
                currentTime = '14:00';
                break;
              case 'evening':
                currentTime = '18:00';
                break;
            }
          }
            // Extract cost info from the line (look for $number patterns in various formats)
          const costPatterns = [
            /\$(\d+)/g,           // Standard $number
            /~\$(\d+)/g,          // Approximate ~$number  
            /\(\$(\d+)/g,         // In parentheses ($number
            /\(\~\$(\d+)/g        // In parentheses (~$number
          ];
          
          let estimatedCost = 30; // Default
          for (const pattern of costPatterns) {
            const costMatch = trimmedLine.match(pattern);
            if (costMatch) {
              estimatedCost = parseInt(costMatch[0].replace(/[^\d]/g, ''));
              break;
            }
          }
          
          // Clean up activity text - remove cost references and extra info
          const cleanActivity = activityText
            .replace(/\([^)]*\$[^)]*\)/g, '') // Remove cost info in parentheses
            .replace(/\$\d+[^.]*\.?/g, '') // Remove standalone cost mentions
            .replace(/~\$\d+[^.]*\.?/g, '') // Remove approximate costs
            .replace(/\s+/g, ' ')
            .trim();
              if (cleanActivity.length > 10) {
              activitiesFound++;
              
              // Try to extract location from activity text
              let location = tripDetails.destination;
              let finalActivityName = cleanActivity;
              
              // Look for specific location patterns
              const locationPatterns = [
                /(?:at|in|visit|to)\s+([A-Z][^,.\n]*(?:[A-Z][^,.\n]*)*)/i,
                /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g // Proper nouns
              ];
              
              for (const pattern of locationPatterns) {
                const locationMatch = cleanActivity.match(pattern);
                if (locationMatch && locationMatch[1]) {
                  const extractedLocation = locationMatch[1].trim();
                  if (extractedLocation.length > 3 && extractedLocation.length < 50) {
                    location = extractedLocation;
                    break;
                  }
                }
              }
              
              // Determine activity type based on content
              let type: 'transport' | 'accommodation' | 'activity' | 'meal' | 'sightseeing' = 'activity';
              const lowerActivity = cleanActivity.toLowerCase();
              
              if (lowerActivity.includes('breakfast') || lowerActivity.includes('lunch') || 
                  lowerActivity.includes('dinner') || lowerActivity.includes('meal') ||
                  lowerActivity.includes('restaurant') || lowerActivity.includes('café')) {
                type = 'meal';
              } else if (lowerActivity.includes('hotel') || lowerActivity.includes('check') || 
                        lowerActivity.includes('accommodation')) {
                type = 'accommodation';
              } else if (lowerActivity.includes('drive') || lowerActivity.includes('flight') || 
                        lowerActivity.includes('train') || lowerActivity.includes('taxi') ||
                        lowerActivity.includes('transport')) {
                type = 'transport';
              } else if (lowerActivity.includes('visit') || lowerActivity.includes('explore') || 
                        lowerActivity.includes('see') || lowerActivity.includes('tour') ||
                        lowerActivity.includes('museum') || lowerActivity.includes('temple')) {
                type = 'sightseeing';
              }
              
              items.push({
                day: currentDay,
                time: currentTime,
                activity: finalActivityName,
                location: location,
                description: '',
                estimatedCost: estimatedCost,
                duration: type === 'meal' ? 90 : type === 'transport' ? 60 : 120,
                type: type
              });
              
              console.log('✅ Added activity #' + activitiesFound + ':', {
                day: currentDay,
                time: currentTime,
                activity: finalActivityName,
                location: location,
                cost: estimatedCost,
                type: type
              });}
          continue;
        }        
        // Debug: Log lines that don't match any activity pattern but are substantial
        if (trimmedLine.length > 10 && !trimmedLine.startsWith('Hey ') && !trimmedLine.startsWith('Stoked ')) {
          console.log('❌ NO MATCH for substantial line:', JSON.stringify(trimmedLine.substring(0, 60)));
        }
      }
      
      console.log(`🎯 PARSING COMPLETE: Found ${activitiesFound} activities out of ${lines.length} lines`);
      
      // Sort by day and time, limit to reasonable number
      const sortedItems = items
        .sort((a, b) => {
          if (a.day !== b.day) return (a.day || 0) - (b.day || 0);
          return (a.time || '').localeCompare(b.time || '');
        })
        .slice(0, duration * 4); // Max 4 activities per day
        
      console.log('📊 Sorted and filtered items:', sortedItems.length);
      return sortedItems;
      
    } catch (error) {
      console.error('Error parsing itinerary:', error);
      // Return a basic structure if parsing fails
      return [{
        day: 1,
        time: '09:00',
        activity: 'Explore the main attractions',
        location: tripDetails.destination,
        description: 'AI-generated itinerary parsing failed, please add activities manually',
        estimatedCost: 50,
        duration: 180,
        type: 'activity'
      }];
    }
  };
  const addItineraryItem = () => {
    // Smart defaults based on existing itinerary
    const lastItem = itinerary[itinerary.length - 1];
    const nextDay = lastItem ? lastItem.day || 1 : 1;
    let nextTime = '09:00';
    
    if (lastItem?.time) {
      // Calculate next time slot (2 hours later)
      const [hours, minutes] = lastItem.time.split(':').map(Number);
      const nextHour = (hours + 2) % 24;
      nextTime = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // If we've gone past 22:00, move to next day at 09:00
      if (nextHour >= 22 || nextHour < 9) {
        nextTime = '09:00';
      }
    }
    
    setItinerary([...itinerary, {
      day: nextDay,
      time: nextTime,
      activity: '',
      location: tripDetails.destination,
      description: '',
      estimatedCost: 25, // Smart default based on typical activity cost
      duration: 120, // 2 hours default
      type: 'activity'
    }]);
  };

  const removeItineraryItem = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const updateItineraryItem = (index: number, field: string, value: any) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setTripDetails(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card">
          <MapPin className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Your Dream Trip</h2>
          <p className="text-gray-600 mb-6">
            Complete your personality profile first to get AI-powered trip planning assistance.
          </p>          <button 
            onClick={() => onNavigate?.('profile')}
            className="btn-primary"
          >
            Create My Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan Your Trip</h1>
        <p className="text-xl text-gray-600">
          Create detailed itineraries with AI assistance tailored to your {user.personality.travelStyle} style
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { step: 1, title: 'Trip Details', icon: MapPin },
          { step: 2, title: 'Build Itinerary', icon: Calendar },
          { step: 3, title: 'Review & Save', icon: Clock }
        ].map(({ step, title, icon: Icon }) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step 
                ? 'bg-primary-500 border-primary-500 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > step ? (
                <span className="text-sm">✓</span>
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step ? 'text-primary-600' : 'text-gray-400'
            }`}>
              {title}
            </span>
            {step < 3 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step ? 'bg-primary-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>      {/* Step 1: Trip Details */}
      {currentStep === 1 && (
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Details</h2>
          
          {preselectedDestination && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Smart defaults loaded from your selected destination!
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                We've pre-filled some details based on {preselectedDestination.name}. Feel free to customize them.
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Title
              </label>
              <input
                type="text"
                value={tripDetails.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Tokyo Adventure 2025"
                className="input-field"
              />
              {!tripDetails.title && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Give your trip a memorable name
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                value={tripDetails.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Tokyo, Japan"
                className="input-field"
              />
              {!tripDetails.destination && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Include city and country for best results
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tripDetails.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={tripDetails.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={tripDetails.startDate || new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
            </div>

            {tripDetails.startDate && tripDetails.endDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-medium">
                    {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''} trip
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Perfect for AI itinerary generation!
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tripDetails.travelers}
                  onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total Budget (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tripDetails.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., 2000"
                  className="input-field"
                />
                {tripDetails.budget && calculateDuration() > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${Math.round(Number(tripDetails.budget) / calculateDuration())} per day
                  </p>
                )}
              </div>
            </div>
          </div><div className="flex justify-end mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!tripDetails.title || !tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Itinerary
              {calculateDuration() > 1 && (
                <span className="ml-2 text-sm">({calculateDuration()} days)</span>
              )}
            </button>
          </div>
          
          {(!tripDetails.title || !tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate) && (
            <p className="text-sm text-amber-600 mt-3 text-center">
              Please fill in all required fields to continue
            </p>
          )}
        </div>
      )}

      {/* Step 2: Build Itinerary */}
      {currentStep === 2 && (
        <div className="space-y-6">          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Build Your Itinerary</h2>
            <div className="flex space-x-3">
              <button
                onClick={generateAIItinerary}
                disabled={isGeneratingItinerary || !tripDetails.destination}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate AI-powered itinerary based on your profile"
              >
                {isGeneratingItinerary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Generate</span>
                  </>
                )}
              </button>
              {itinerary.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all activities and start over?')) {
                      setItinerary([]);
                    }
                  }}
                  className="btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50"
                  title="Clear all activities"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
              <button
                onClick={addItineraryItem}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>{itinerary.length === 0 ? (
            <div className="card text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Itinerary</h3>
              <p className="text-gray-600 mb-6">
                Add activities manually or let our AI create a personalized itinerary for you based on your 
                {user.personality.travelStyle} travel style and {user.personality.mood} mood.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={generateAIItinerary}
                  disabled={isGeneratingItinerary || !tripDetails.destination}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingItinerary ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating AI Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate AI Itinerary</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={addItineraryItem}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manually</span>
                </button>
              </div>
              
              {!tripDetails.destination && (
                <p className="text-sm text-amber-600 mt-3">
                  💡 Complete trip details first to enable AI itinerary generation
                </p>
              )}
              
              {tripDetails.destination && calculateDuration() > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Ready to generate a {calculateDuration()}-day itinerary for {tripDetails.destination}!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* AI Generation Success Message */}
              {itinerary.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      AI Itinerary Generated Successfully!
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    {itinerary.length} activities planned for your {calculateDuration()}-day trip. 
                    You can edit, remove, or add more activities below.
                  </p>
                </div>
              )}
              
              {itinerary.map((item, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Activity {index + 1}</h3>
                    <button
                      onClick={() => removeItineraryItem(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.day || 1}
                        onChange={(e) => updateItineraryItem(index, 'day', parseInt(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={item.time || '09:00'}
                        onChange={(e) => updateItineraryItem(index, 'time', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={item.type || 'activity'}
                        onChange={(e) => updateItineraryItem(index, 'type', e.target.value)}
                        className="input-field"
                      >
                        <option value="activity">Activity</option>
                        <option value="meal">Meal</option>
                        <option value="transport">Transport</option>
                        <option value="accommodation">Accommodation</option>
                        <option value="sightseeing">Sightseeing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.estimatedCost || 0}
                        onChange={(e) => updateItineraryItem(index, 'estimatedCost', parseFloat(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        value={item.activity || ''}
                        onChange={(e) => updateItineraryItem(index, 'activity', e.target.value)}
                        placeholder="e.g., Visit Senso-ji Temple"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => updateItineraryItem(index, 'location', e.target.value)}
                        placeholder="e.g., Asakusa, Tokyo"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                      placeholder="Add notes, tips, or details about this activity..."
                      rows={2}
                      className="input-field"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary"
            >
              Back to Details
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={itinerary.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Trip
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Save */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Your Trip</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trip Summary */}
            <div className="lg:col-span-1">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Destination:</span>
                    <p className="font-medium">{tripDetails.destination}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <p className="font-medium">
                      {tripDetails.startDate} to {tripDetails.endDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Travelers:</span>
                    <p className="font-medium">{tripDetails.travelers} person(s)</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Budget:</span>
                    <p className="font-medium">${tripDetails.budget}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Activities:</span>
                    <p className="font-medium">{itinerary.length} planned</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estimated Cost:</span>
                    <p className="font-medium text-primary-600">
                      ${itinerary.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Preview */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary Overview</h3>
                <div className="space-y-3">
                  {itinerary.length === 0 ? (
                    <p className="text-gray-500">No activities planned yet.</p>
                  ) : (
                    itinerary.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 min-w-[80px]">
                          Day {item.day} - {item.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.activity}</p>
                          <p className="text-sm text-gray-600">{item.location}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${item.estimatedCost || 0}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="btn-secondary"
            >
              Back to Itinerary
            </button>            <button
              className="btn-primary"
              onClick={() => {
                try {
                  // Create a complete trip object
                  const completedTrip: Trip = {
                    id: 'trip-' + Date.now(),
                    title: tripDetails.title,
                    destination: {
                      id: 'dest-' + Date.now(),
                      name: tripDetails.destination.split(',')[0].trim(),
                      country: tripDetails.destination.split(',')[1]?.trim() || 'Unknown',
                      description: `Trip to ${tripDetails.destination}`,
                      imageUrl: '',
                      averageCost: Number(tripDetails.budget) / calculateDuration() || 100,
                      bestMonths: [],
                      activities: [],
                      mood: [],
                      travelStyle: [],
                      coordinates: { lat: 0, lng: 0 }
                    },
                    startDate: new Date(tripDetails.startDate),
                    endDate: new Date(tripDetails.endDate),
                    budget: Number(tripDetails.budget) || 0,
                    travelers: tripDetails.travelers,
                    itinerary: itinerary.map((item, index) => ({
                      id: 'item-' + Date.now() + '-' + index,
                      day: item.day || 1,
                      time: item.time || '09:00',
                      activity: item.activity || 'Untitled Activity',
                      location: item.location || tripDetails.destination,
                      description: item.description || '',
                      estimatedCost: item.estimatedCost || 0,
                      duration: item.duration || 120,
                      type: item.type || 'activity',
                      bookingInfo: {
                        isBooked: false
                      }
                    })),
                    status: 'planning' as const,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };

                  // Save to context
                  dispatch({ type: 'SET_CURRENT_TRIP', payload: completedTrip });
                  
                  console.log('Trip saved successfully:', completedTrip);
                  alert('🎉 Trip saved successfully! You can now view it in "My Trips"');
                  
                  // Navigate to My Trips to show the saved trip
                  setTimeout(() => onNavigate?.('trips'), 1000);
                } catch (error) {
                  console.error('Error saving trip:', error);
                  alert('Failed to save trip. Please try again.');
                }
              }}
            >
              Save Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

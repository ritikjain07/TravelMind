import { useState } from 'react';
import { Sparkles, Heart, Mountain, Camera, Coffee, Users } from 'lucide-react';
import { usePersonality } from '../context/AppContext';
import type { PersonalityProfile } from '../types';

interface PersonalityProfilerProps {
  onNavigate?: (tab: string) => void;
}

export function PersonalityProfiler({ onNavigate }: PersonalityProfilerProps) {
  const { personality, updatePersonality } = usePersonality();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PersonalityProfile>>({
    interests: [],
    ...personality
  });

  const steps = [
    {
      title: "What's your travel vibe?",
      question: "How would you describe your ideal travel experience?",
      options: [
        { value: 'adventure', label: 'Adventure & Thrills', icon: Mountain, description: 'Adrenaline-pumping activities and off-the-beaten-path experiences' },
        { value: 'relaxation', label: 'Peace & Relaxation', icon: Coffee, description: 'Spa days, beaches, and stress-free environments' },
        { value: 'cultural', label: 'Cultural Immersion', icon: Camera, description: 'Museums, local traditions, and authentic experiences' },
        { value: 'luxury', label: 'Luxury & Comfort', icon: Sparkles, description: 'High-end accommodations and premium experiences' },
        { value: 'budget', label: 'Budget-Friendly', icon: Heart, description: 'Making the most of every dollar with smart choices' },
        { value: 'family', label: 'Family Fun', icon: Users, description: 'Kid-friendly activities and family bonding time' }
      ],
      key: 'travelStyle' as keyof PersonalityProfile
    },
    {
      title: "How active are you?",
      question: "What's your preferred activity level while traveling?",
      options: [
        { value: 'low', label: 'Low Key', description: 'Leisurely pace with plenty of rest time' },
        { value: 'moderate', label: 'Balanced', description: 'Mix of activities and relaxation' },
        { value: 'high', label: 'High Energy', description: 'Packed schedule with lots to see and do' }
      ],
      key: 'activityLevel' as keyof PersonalityProfile
    },
    {
      title: "Who do you travel with?",
      question: "What's your ideal travel group?",
      options: [
        { value: 'solo', label: 'Solo Explorer', description: 'Just me, myself, and I' },
        { value: 'couple', label: 'Romantic Getaway', description: 'With my significant other' },
        { value: 'small-group', label: 'Close Friends', description: 'Small group of 3-5 people' },
        { value: 'large-group', label: 'The More the Merrier', description: 'Large group or family gathering' }
      ],
      key: 'socialPreference' as keyof PersonalityProfile
    },
    {
      title: "How do you plan?",
      question: "What's your planning style?",
      options: [
        { value: 'spontaneous', label: 'Wing It', description: 'Figure it out as I go' },
        { value: 'flexible', label: 'Loose Plan', description: 'General outline with room for spontaneity' },
        { value: 'structured', label: 'Detailed Itinerary', description: 'Every hour planned and scheduled' }
      ],
      key: 'planningStyle' as keyof PersonalityProfile
    },
    {
      title: "What's your current mood?",
      question: "How are you feeling about your next trip?",
      options: [
        { value: 'excited', label: 'Excited & Energetic', description: 'Ready for anything and everything!' },
        { value: 'stressed', label: 'Need to Unwind', description: 'Looking to escape and recharge' },
        { value: 'curious', label: 'Curious & Learning', description: 'Want to discover and learn new things' },
        { value: 'adventurous', label: 'Adventure Seeking', description: 'Craving new challenges and experiences' },
        { value: 'peaceful', label: 'Seeking Peace', description: 'Need tranquility and mindfulness' }
      ],
      key: 'mood' as keyof PersonalityProfile
    }
  ];

  const interests = [
    'Food & Dining', 'Art & Museums', 'History', 'Nature & Wildlife', 'Photography',
    'Music & Festivals', 'Sports', 'Shopping', 'Architecture', 'Beaches',
    'Mountains', 'Nightlife', 'Wellness & Spa', 'Local Culture', 'Adventure Sports'
  ];

  const handleAnswer = (value: string) => {
    const step = steps[currentStep];
    setAnswers(prev => ({
      ...prev,
      [step.key]: value
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Move to interests selection
      setCurrentStep(steps.length);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setAnswers(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };  const handleComplete = () => {
    // Ensure all required fields are present
    const completeProfile: PersonalityProfile = {
      travelStyle: answers.travelStyle || 'cultural',
      activityLevel: answers.activityLevel || 'moderate',
      socialPreference: answers.socialPreference || 'couple',
      planningStyle: answers.planningStyle || 'flexible',
      mood: answers.mood || 'excited',
      interests: answers.interests || []
    };
    
    if (completeProfile.interests && completeProfile.interests.length > 0) {
      updatePersonality(completeProfile);
      
      // Add a small delay to ensure state update completes before navigation
      setTimeout(() => {
        onNavigate?.('discover');
      }, 100);
    }
  };

  const progress = currentStep <= steps.length - 1 
    ? ((currentStep + 1) / (steps.length + 1)) * 100
    : 100;

  if (currentStep === steps.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What interests you most?</h2>
          <p className="text-gray-600">Select all that apply to personalize your recommendations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {interests.map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                answers.interests?.includes(interest)
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleComplete}
            disabled={!answers.interests || answers.interests.length === 0}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete My Profile ✨
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length + 1}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
        <p className="text-lg text-gray-600">{currentStepData.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentStepData.options.map((option) => {
          const Icon = 'icon' in option ? option.icon : null;
          return (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="card hover:shadow-xl hover:scale-105 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                {Icon && (
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, Heart, Mountain, Camera, Coffee, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3 }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const optionVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto p-6">
        {/* Animated Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 mb-6 border border-white/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
            </motion.div>
            <span className="text-purple-800 font-medium">See Yourself Profile</span>
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover Your Travel Personality
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Answer a few questions to unlock personalized AI recommendations tailored just for you
          </p>
        </motion.div>

        {/* Enhanced Progress Bar */}
        <motion.div 
          className="mb-12"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length + 1}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
            
            {/* Progress indicators */}
            <div className="flex justify-between mt-2">
              {[...Array(steps.length + 1)].map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === steps.length ? (
            // Interests Selection
            <motion.div
              key="interests"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="card-premium max-w-4xl mx-auto"
            >
              <motion.div 
                className="text-center mb-8"
                variants={itemVariants}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What interests you most?</h2>
                <p className="text-lg text-gray-600">Select all that apply to personalize your recommendations</p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
                variants={containerVariants}
              >                {interests.map((interest) => (
                  <motion.button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    variants={optionVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      answers.interests?.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    {interest}
                    {answers.interests?.includes(interest) && (
                      <motion.div
                        className="mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-4 h-4 mx-auto" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div 
                className="text-center space-y-4"
                variants={itemVariants}
              >
                <button
                  onClick={handleComplete}
                  disabled={!answers.interests || answers.interests.length === 0}
                  className="btn-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-full relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Complete My Profile</span>
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </button>
                
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn-secondary px-8 py-3 text-sm flex items-center space-x-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          ) : (
            // Question Steps
            <motion.div
              key={currentStep}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-5xl mx-auto"
            >
              {/* Question */}
              <motion.div 
                className="text-center mb-12"
                variants={itemVariants}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentStepData.title}</h2>
                <p className="text-xl text-gray-600">{currentStepData.question}</p>
              </motion.div>

              {/* Options */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                variants={containerVariants}
              >                {currentStepData.options.map((option) => {
                  const Icon = 'icon' in option ? option.icon : null;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      variants={optionVariants}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="card-premium text-left group cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start space-x-4">
                        {Icon && (
                          <motion.div 
                            className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </motion.div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-purple-600 transition-colors">
                            {option.label}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">{option.description}</p>
                        </div>
                      </div>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Navigation */}
              <motion.div 
                className="flex justify-center space-x-4"
                variants={itemVariants}
              >
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn-secondary px-6 py-3 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

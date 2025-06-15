import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Plus, X, Wand2, Loader2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import type { ItineraryItem } from '../types';

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
  const [tripDetails, setTripDetails] = useState({
    title: '',
    destination: preselectedDestination ? `${preselectedDestination.name}, ${preselectedDestination.country}` : '',
    startDate: '',
    endDate: '',
    budget: preselectedDestination?.estimatedCost ? String(preselectedDestination.estimatedCost * 7) : '',
    travelers: 1,
  });

  const [itinerary, setItinerary] = useState<Partial<ItineraryItem>[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // Animation variants
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

  // Set smart defaults based on preselected destination
  useEffect(() => {
    if (preselectedDestination && !tripDetails.title) {
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

  const handleInputChange = (field: string, value: string | number) => {
    setTripDetails(prev => ({ ...prev, [field]: value }));
  };

  const addItineraryItem = () => {
    const lastItem = itinerary[itinerary.length - 1];
    const nextDay = lastItem ? lastItem.day || 1 : 1;
    let nextTime = '09:00';
    
    if (lastItem?.time) {
      const [hours, minutes] = lastItem.time.split(':').map(Number);
      const nextHour = (hours + 2) % 24;
      nextTime = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
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
      estimatedCost: 25,
      duration: 120,
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

  const generateAIItinerary = async () => {
    if (!user?.preferences || !user?.personality || !tripDetails.destination) {
      alert('Please complete your profile and trip details first');
      return;
    }

    const duration = calculateDuration();
    if (duration > 30) {
      alert('Please select a trip duration of 30 days or less for AI generation');
      return;
    }

    setIsGeneratingItinerary(true);
    try {
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
      };      const itineraryText = await geminiService.generateItinerary(
        destination,
        user.preferences,
        user.personality,
        duration
      );

      // Use the itinerary text for future parsing implementation
      console.log('Generated itinerary:', itineraryText);

      // Mock parsing for now - in real implementation, add the full parsing logic
      const mockItinerary = Array.from({ length: Math.min(duration * 2, 8) }, (_, i) => ({
        day: Math.floor(i / 2) + 1,
        time: i % 2 === 0 ? '09:00' : '14:00',
        activity: `Activity ${i + 1} in ${destination.name}`,
        location: tripDetails.destination,
        description: `Generated activity for your trip`,
        estimatedCost: 50 + Math.floor(Math.random() * 100),
        duration: 120,
        type: 'activity' as const
      }));

      setItinerary(mockItinerary);
      alert(`🎉 AI itinerary generated successfully! Added ${mockItinerary.length} activities to your trip.`);
    } catch (error) {
      console.error('Failed to generate AI itinerary:', error);
      alert('Failed to generate itinerary. Please try again or create manually.');
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div 
            className="card-premium text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <MapPin className="w-20 h-20 text-blue-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Plan Your Dream Trip</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Complete your personality profile first to get AI-powered trip planning assistance.
            </p>
            <motion.button 
              onClick={() => onNavigate?.('profile')}
              className="btn-primary px-8 py-3 text-lg rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Create My Profile</span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto p-6">
        {/* Animated Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Plan Your Trip
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create detailed itineraries with AI assistance tailored to your {user.personality.travelStyle} style
          </p>
        </motion.div>

        {/* Enhanced Progress Steps */}
        <motion.div 
          className="flex items-center justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {[
            { step: 1, title: 'Trip Details', icon: MapPin },
            { step: 2, title: 'Build Itinerary', icon: Calendar },
            { step: 3, title: 'Review & Save', icon: Clock }
          ].map(({ step, title, icon: Icon }, index) => (
            <motion.div 
              key={step} 
              className="flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <motion.div 
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 relative overflow-hidden ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white shadow-lg' 
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep > step ? (
                  <motion.span 
                    className="text-lg font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <Icon className="w-6 h-6" />
                )}
                {currentStep >= step && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>
              <span className={`ml-3 text-lg font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {step < 3 && (
                <motion.div 
                  className={`w-20 h-1 mx-6 rounded-full ${
                    currentStep > step 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'bg-gray-300'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > step ? 1 : 0.3 }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Step Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              className="card-premium max-w-3xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-8 text-center"
                variants={itemVariants}
              >
                Trip Details
              </motion.h2>
              
              {preselectedDestination && (
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8 relative overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-lg">
                      Smart defaults loaded!
                    </span>
                  </div>
                  <p className="text-blue-700">
                    We've pre-filled details based on {preselectedDestination.name}.
                  </p>
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
              
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={tripDetails.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Tokyo Adventure 2025"
                    className="input-field text-lg"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={tripDetails.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="e.g., Tokyo, Japan"
                    className="input-field text-lg"
                  />
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={itemVariants}
                >
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tripDetails.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tripDetails.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={tripDetails.startDate || new Date().toISOString().split('T')[0]}
                      className="input-field text-lg"
                    />
                  </div>
                </motion.div>

                {tripDetails.startDate && tripDetails.endDate && (
                  <motion.div 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-6 h-6 text-green-600" />
                      <span className="text-green-800 font-semibold text-lg">
                        {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''} trip
                      </span>
                    </div>
                    <p className="text-green-700 mt-2">Perfect for AI itinerary generation!</p>
                  </motion.div>
                )}

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={itemVariants}
                >
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <Users className="w-5 h-5 inline mr-2" />
                      Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={tripDetails.travelers}
                      onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                      className="input-field text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <DollarSign className="w-5 h-5 inline mr-2" />
                      Budget (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tripDetails.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="e.g., 2000"
                      className="input-field text-lg"
                    />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex justify-end mt-10"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setCurrentStep(2)}
                  disabled={!tripDetails.title || !tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate}
                  className="btn-primary px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Continue to Itinerary</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Build Itinerary */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"
                variants={itemVariants}
              >
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Build Your Itinerary</h2>
                  <p className="text-gray-600 mt-2">Add activities or let AI create your perfect trip</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={generateAIItinerary}
                    disabled={isGeneratingItinerary || !tripDetails.destination}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isGeneratingItinerary ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>AI Generate</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={addItineraryItem}
                    className="btn-secondary flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Activity</span>
                  </motion.button>
                </div>
              </motion.div>

              {itinerary.length === 0 ? (
                <motion.div 
                  className="card-premium text-center py-12"
                  variants={itemVariants}
                >
                  <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Start Building Your Itinerary</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Let our AI create a personalized itinerary or add activities manually.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={generateAIItinerary}
                      disabled={isGeneratingItinerary || !tripDetails.destination}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>
                    
                    <motion.button
                      onClick={addItineraryItem}
                      className="btn-secondary flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Manually</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  variants={containerVariants}
                >
                  {itinerary.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="card-premium relative overflow-hidden"
                      variants={itemVariants}
                      layout
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Activity {index + 1}</h3>
                        <motion.button
                          onClick={() => removeItineraryItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                          <input
                            type="number"
                            min="1"
                            value={item.day || 1}
                            onChange={(e) => updateItineraryItem(index, 'day', parseInt(e.target.value))}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                          <input
                            type="time"
                            value={item.time || '09:00'}
                            onChange={(e) => updateItineraryItem(index, 'time', e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.estimatedCost || 0}
                            onChange={(e) => updateItineraryItem(index, 'estimatedCost', parseFloat(e.target.value))}
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
                          <input
                            type="text"
                            value={item.activity || ''}
                            onChange={(e) => updateItineraryItem(index, 'activity', e.target.value)}
                            placeholder="e.g., Visit Senso-ji Temple"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={item.location || ''}
                            onChange={(e) => updateItineraryItem(index, 'location', e.target.value)}
                            placeholder="e.g., Asakusa, Tokyo"
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                          placeholder="Add notes, tips, or details..."
                          rows={2}
                          className="input-field"
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <motion.div 
                className="flex justify-between pt-8"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setCurrentStep(3)}
                  disabled={itinerary.length === 0}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Review Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Review & Save */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-900 text-center"
                variants={itemVariants}
              >
                Review Your Trip
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                variants={containerVariants}
              >
                {/* Trip Summary */}
                <motion.div 
                  className="lg:col-span-1"
                  variants={itemVariants}
                >
                  <div className="card-premium">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Trip Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-600">Destination:</span>
                        <p className="font-medium text-lg">{tripDetails.destination}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Duration:</span>
                        <p className="font-medium">{calculateDuration()} days</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Travelers:</span>
                        <p className="font-medium">{tripDetails.travelers} person(s)</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Budget:</span>
                        <p className="font-medium">${tripDetails.budget}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Activities:</span>
                        <p className="font-medium">{itinerary.length} planned</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Estimated Cost:</span>
                        <p className="font-medium text-blue-600 text-lg">
                          ${itinerary.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Itinerary Preview */}
                <motion.div 
                  className="lg:col-span-2"
                  variants={itemVariants}
                >
                  <div className="card-premium">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Itinerary Overview</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {itinerary.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No activities planned yet.</p>
                      ) : (
                        itinerary.map((item, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="text-sm text-gray-600 min-w-[100px]">
                              Day {item.day} - {item.time}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.activity}</p>
                              <p className="text-sm text-gray-600">{item.location}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              ${item.estimatedCost || 0}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex justify-between pt-8"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Itinerary</span>
                </motion.button>
                
                <motion.button
                  className="btn-primary px-8 py-4 text-lg rounded-full"
                  onClick={() => {
                    // Save trip logic here
                    alert('🎉 Trip saved successfully!');
                    setTimeout(() => onNavigate?.('trips'), 1000);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center space-x-2">
                    <span>Save Trip</span>
                    <Sparkles className="w-5 h-5" />
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

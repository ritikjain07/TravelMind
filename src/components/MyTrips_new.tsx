import { useState } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Edit3, Trash2, Share, Star, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/AppContext';
import type { Trip } from '../types';

interface MyTripsProps {
  onNavigate?: (tab: string) => void;
}

export function MyTrips({ onNavigate }: MyTripsProps) {
  const user = useUser();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'planning' | 'booked' | 'completed' | 'cancelled'>('all');
  const [trips] = useState<Trip[]>([
    // Mock trips for demonstration
    {
      id: '1',
      title: 'Tokyo Adventure 2025',
      destination: {
        id: '1',
        name: 'Tokyo',
        country: 'Japan',
        description: 'The bustling capital of Japan',
        imageUrl: '',
        averageCost: 150,
        bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
        activities: ['culture', 'food', 'shopping'],
        mood: ['excited', 'curious'],
        travelStyle: ['cultural', 'adventure'],
        coordinates: { lat: 35.6762, lng: 139.6503 }
      },
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-22'),
      budget: 2500,
      itinerary: [],
      status: 'planning' as const,
      travelers: 2,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      title: 'Bali Wellness Retreat',
      destination: {
        id: '2',
        name: 'Bali',
        country: 'Indonesia',
        description: 'Tropical paradise for relaxation',
        imageUrl: '',
        averageCost: 80,
        bestMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        activities: ['wellness', 'beach', 'nature'],
        mood: ['peaceful', 'stressed'],
        travelStyle: ['relaxation', 'wellness'],
        coordinates: { lat: -8.3405, lng: 115.0920 }
      },
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-18'),
      budget: 1800,
      itinerary: [],
      status: 'booked' as const,
      travelers: 1,
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-12-10')
    }
  ]);

  const filteredTrips = selectedStatus === 'all' 
    ? trips 
    : trips.filter(trip => trip.status === selectedStatus);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="max-w-md mx-auto p-6 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="card-premium"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Calendar className="w-20 h-20 text-blue-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Travel Journey</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Complete your personality profile to start planning and tracking your trips.
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            My Trips
          </h1>
          <p className="text-xl text-gray-600">
            Manage your travel plans and memories
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          className="flex space-x-2 mb-12 glass rounded-2xl p-2 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {[
            { key: 'all', label: 'All Trips', count: trips.length },
            { key: 'planning', label: 'Planning', count: trips.filter(t => t.status === 'planning').length },
            { key: 'booked', label: 'Booked', count: trips.filter(t => t.status === 'booked').length },
            { key: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
          ].map(({ key, label, count }, index) => (
            <motion.button
              key={key}
              onClick={() => setSelectedStatus(key as any)}
              className={`relative flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedStatus === key
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {selectedStatus === key && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl"
                  layoutId="activeFilter"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{label} ({count})</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Trips Grid */}
        <AnimatePresence mode="wait">
          {filteredTrips.length === 0 ? (
            <motion.div 
              className="card-premium text-center max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                {selectedStatus === 'all' ? 'No trips yet' : `No ${selectedStatus} trips`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {selectedStatus === 'all' 
                  ? 'Start planning your first adventure!'
                  : `You don't have any ${selectedStatus} trips.`
                }
              </p>
              <motion.button 
                onClick={() => onNavigate?.('plan')}
                className="btn-primary px-8 py-3 text-lg rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Plan New Trip</span>
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  className="card-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  layout
                >
                  {/* Trip Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-gray-600 flex items-center mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.destination.name}, {trip.destination.country}
                      </p>
                    </div>
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </motion.div>
                  </div>

                  {/* Enhanced Trip Image */}
                  <motion.div 
                    className="h-48 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl mb-6 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-center text-white"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MapPin className="w-16 h-16 mx-auto mb-3 drop-shadow-lg" />
                        <p className="text-lg font-semibold opacity-90">{trip.destination.name}</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Trip Details */}
                  <div className="space-y-4 mb-6">
                    {[
                      { icon: Calendar, text: `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`, color: 'text-blue-500' },
                      { icon: Clock, text: `${calculateDuration(trip.startDate, trip.endDate)} days`, color: 'text-purple-500' },
                      { icon: Users, text: `${trip.travelers} traveler${trip.travelers > 1 ? 's' : ''}`, color: 'text-orange-500' },
                      { icon: DollarSign, text: `$${trip.budget.toLocaleString()}`, color: 'text-green-500' }
                    ].map((detail, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <detail.icon className={`w-4 h-4 mr-3 ${detail.color}`} />
                        <span>{detail.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Trip Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <motion.button
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium py-3 px-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </motion.button>
                    
                    {[
                      { icon: Share, color: 'green' },
                      { icon: Star, color: 'yellow' },
                      { icon: Trash2, color: 'red' }
                    ].map((action, i) => (
                      <motion.button
                        key={i}
                        className={`p-3 bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-600 rounded-xl transition-all duration-300`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <action.icon className="w-4 h-4" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Floating Action Button */}
        <motion.button 
          onClick={() => onNavigate?.('plan')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: "spring", bounce: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Plus className="w-8 h-8 mx-auto" />
          </motion.div>
          
          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </div>
    </div>
  );
}

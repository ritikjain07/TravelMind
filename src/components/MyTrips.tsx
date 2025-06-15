import { useState } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Edit3, Trash2, Share, Star } from 'lucide-react';
import { useUser } from '../context/AppContext';
import type { Trip } from '../types';

interface MyTripsProps {
  onNavigate?: (tab: string) => void;
}

export function MyTrips({ onNavigate }: MyTripsProps) {
  const user = useUser();
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
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-17'),
      budget: 1800,
      itinerary: [],
      status: 'booked' as const,
      travelers: 1,
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-12-10')
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<'all' | 'planning' | 'booked' | 'completed' | 'cancelled'>('all');

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
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card">
          <Calendar className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Journey</h2>
          <p className="text-gray-600 mb-6">
            Complete your personality profile to start planning and tracking your trips.
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-xl text-gray-600">
          Manage your travel plans and memories
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Trips', count: trips.length },
          { key: 'planning', label: 'Planning', count: trips.filter(t => t.status === 'planning').length },
          { key: 'booked', label: 'Booked', count: trips.filter(t => t.status === 'booked').length },
          { key: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedStatus === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="card text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedStatus === 'all' ? 'No trips yet' : `No ${selectedStatus} trips`}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedStatus === 'all' 
              ? 'Start planning your first adventure!'
              : `You don't have any ${selectedStatus} trips.`
            }
          </p>          <button 
            onClick={() => onNavigate?.('plan')}
            className="btn-primary"
          >
            Plan New Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card hover:shadow-xl transition-all duration-300 group">
              {/* Trip Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {trip.title}
                  </h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.destination.name}, {trip.destination.country}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Trip Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-90">{trip.destination.name}</p>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{calculateDuration(trip.startDate, trip.endDate)} days</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />
                  <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  <span>${trip.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Trip Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-colors duration-200">
                  <Share className="w-4 h-4" />
                </button>
                <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 p-2 rounded-lg transition-colors duration-200">
                  <Star className="w-4 h-4" />
                </button>
                <button className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate?.('plan')}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <svg 
          className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

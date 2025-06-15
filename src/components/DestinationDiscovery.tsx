import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Sparkles, Heart, Loader2 } from 'lucide-react';
import { useUser } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { DestinationCard } from './DestinationCard';
import { WelcomeHero } from './WelcomeHero';
import type { AIRecommendation } from '../types';

function LoadingCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  );
}

interface DestinationDiscoveryProps {
  onNavigate?: (tab: string, recommendation?: AIRecommendation) => void;
}

export function DestinationDiscovery({ onNavigate }: DestinationDiscoveryProps) {
  const user = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);  useEffect(() => {
    if (user?.preferences && user?.personality) {
      loadRecommendations();
    }
  }, [user]);

  // Additional effect to handle immediate loading when component mounts with existing user
  useEffect(() => {
    // Small delay to ensure any state updates from navigation are complete
    const timer = setTimeout(() => {
      if (user?.preferences && user?.personality && recommendations.length === 0 && !isLoading) {
        loadRecommendations();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);  const loadRecommendations = async () => {
    if (!user?.preferences || !user?.personality) return;

    setIsLoading(true);
    try {
      const recs = await geminiService.generateDestinationRecommendations(
        user.preferences,
        user.personality,
        searchQuery
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (user?.preferences && user?.personality) {
      loadRecommendations();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  if (!user) {
    return (
      <>
        <WelcomeHero />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <div className="card">
            <Sparkles className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Complete your "See Yourself" profile to unlock personalized AI-powered destination recommendations tailored just for you.
            </p>            <button 
              onClick={() => onNavigate?.('profile')}
              className="btn-primary"
            >
              Create My Profile ✨
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Discover Your Perfect Destination
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered recommendations tailored just for you
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tell me what you're looking for... (e.g., 'peaceful beach destination for relaxation')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-field pl-12 pr-24"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-2 px-4 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>      {/* Personality-based suggestions */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Based on your {user.personality.travelStyle} style and {user.personality.mood} mood
          </h2>
        </div>{isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : recommendations.length > 0 ? (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <DestinationCard
                key={rec.id}
                recommendation={rec}
                index={index}
                onExplore={() => setSelectedRecommendation(rec)}
                onSave={(recommendation) => {
                  // Handle saving to favorites - could dispatch to context
                  console.log('Saving recommendation:', recommendation);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble loading your personalized recommendations. Try refreshing or check the console for details.
            </p>
            <button
              onClick={loadRecommendations}
              className="btn-primary"
            >
              Load Recommendations
            </button>
          </div>
        )}
      </div>

      {/* Quick filters */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Inspiration</h3>
        <div className="flex flex-wrap gap-3">
          {[
            'Beach paradise', 'Mountain adventure', 'City exploration', 
            'Cultural immersion', 'Food journey', 'Wellness retreat',
            'Family fun', 'Solo adventure', 'Romantic getaway'
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setSearchQuery(filter);
                handleSearch();
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors duration-200"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRecommendation.title}
                </h2>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="h-64 bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg mb-6 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-white" />
              </div>
              
              <p className="text-gray-600 mb-6">
                {selectedRecommendation.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Daily Budget</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    ${selectedRecommendation.metadata.estimatedCost}
                  </span>
                </div>
                
                <div className="card bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">AI Confidence</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(selectedRecommendation.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Why this matches you:</h3>
                <p className="text-gray-600">{selectedRecommendation.reasoning}</p>
              </div>
                <div className="flex space-x-3">                <button 
                  onClick={() => {
                    setSelectedRecommendation(null);
                    onNavigate?.('plan', selectedRecommendation);
                  }}
                  className="btn-primary flex-1"
                >
                  Start Planning Trip
                </button>
                <button className="btn-secondary">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Heart, MapPin, Calendar, Users, DollarSign, Clock } from 'lucide-react';
import type { AIRecommendation } from '../types';

interface DestinationCardProps {
  recommendation: AIRecommendation;
  onSave?: (recommendation: AIRecommendation) => void;
  onExplore?: (recommendation: AIRecommendation) => void;
}

export function DestinationCard({ recommendation, onSave, onExplore }: DestinationCardProps) {  const {
    title,
    description,
    confidence,
    metadata
  } = recommendation;

  // Extract data from metadata with fallbacks
  const estimatedCost = metadata?.estimatedCost || '$100-200';
  const bestTimeToVisit = metadata?.bestTimeToVisit || 'Year-round';
  const recommendedDuration = metadata?.recommendedDuration || '3-5 days';
  const location = metadata?.location || 'Unknown';
  const personalizedTips = metadata?.personalizedTips || [];

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group">
      {/* Header with destination name and confidence */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-primary-600">
            {Math.round(confidence * 100)}% match
          </div>
          <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {description}
      </p>

      {/* Quick info grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
          <span>{estimatedCost}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          <span>{bestTimeToVisit}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-purple-500" />
          <span>{recommendedDuration}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 text-orange-500" />
          <span>{recommendation.type}</span>
        </div>
      </div>

      {/* Personalized tips */}
      {personalizedTips && personalizedTips.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Personalized for you:</h4>
          <ul className="space-y-1">
            {personalizedTips.slice(0, 3).map((tip: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onExplore?.(recommendation)}
          className="flex-1 btn-primary text-sm py-2"
        >
          Explore Details
        </button>
        <button
          onClick={() => onSave?.(recommendation)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Save to favorites"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

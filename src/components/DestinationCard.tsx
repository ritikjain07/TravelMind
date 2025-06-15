import { Heart, MapPin, Calendar, Users, DollarSign, Clock, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { AIRecommendation } from '../types';

interface DestinationCardProps {
  recommendation: AIRecommendation;
  onSave?: (recommendation: AIRecommendation) => void;
  onExplore?: (recommendation: AIRecommendation) => void;
  index?: number;
}

export function DestinationCard({ recommendation, onSave, onExplore, index = 0 }: DestinationCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const {
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
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut" as const
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onSave?.(recommendation);
  };

  return (
    <motion.div
      className="card-premium hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
      
      {/* Floating confidence badge */}
      <motion.div 
        className="absolute top-4 right-4 z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <div className="glass rounded-full px-3 py-1 border border-white/30">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-700">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hero image placeholder with gradient */}
      <motion.div 
        className="h-48 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl mb-6 relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <MapPin className="w-12 h-12 text-white drop-shadow-lg" />
          </motion.div>
        </div>
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={isHovered ? { x: "100%" } : {}}
          transition={{ duration: 0.8 }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {title}
          </h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p 
          className="text-gray-700 mb-6 line-clamp-3 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          {description}
        </motion.p>

        {/* Info grid with modern styling */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.6 }}
        >
          {[
            { icon: DollarSign, text: estimatedCost, color: 'text-green-500' },
            { icon: Calendar, text: bestTimeToVisit, color: 'text-blue-500' },
            { icon: Clock, text: recommendedDuration, color: 'text-purple-500' },
            { icon: Users, text: recommendation.type, color: 'text-orange-500' }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
              <span className="truncate">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Personalized tips */}
        {personalizedTips && personalizedTips.length > 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.7 }}
          >
            <div className="flex items-center mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
              <h4 className="font-medium text-gray-900">Personalized for you:</h4>
            </div>
            <div className="space-y-2">
              {personalizedTips.slice(0, 2).map((tip: string, tipIndex: number) => (
                <motion.div
                  key={tipIndex}
                  className="text-sm text-gray-600 flex items-start bg-blue-50 rounded-lg p-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.8 + tipIndex * 0.1 }}
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {tip}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div 
          className="flex space-x-3 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.9 }}
        >
          <motion.button
            onClick={() => onExplore?.(recommendation)}
            className="flex-1 btn-primary text-sm py-3 rounded-xl font-medium relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Explore Details</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
          
          <motion.button
            onClick={handleLike}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isLiked 
                ? 'text-red-500 bg-red-50' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Save to favorites"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ zIndex: -1 }}
      />
    </motion.div>
  );
}

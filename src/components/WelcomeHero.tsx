import { Sparkles, MapPin, Heart, Zap } from 'lucide-react';

export function WelcomeHero() {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white bg-opacity-80 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <span className="text-primary-800 font-medium">AI-Powered Travel Planning</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Perfect Trip is Just
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {' '}One Click Away
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover personalized destinations tailored to your personality, mood, and travel style. 
          Let our AI travel companion create unforgettable experiences just for you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Know Yourself</h3>
            <p className="text-gray-600 text-sm">
              Complete our "See Yourself" profile to understand your unique travel personality
            </p>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Recommendations</h3>
            <p className="text-gray-600 text-sm">
              Get intelligent destination suggestions powered by Google's Gemini AI
            </p>
          </div>
          
          <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Perfect Matches</h3>
            <p className="text-gray-600 text-sm">
              Discover destinations that align perfectly with your mood and preferences
            </p>
          </div>
        </div>
        
        <div className="animate-bounce-gentle">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mx-auto flex items-center justify-center">
            <span className="text-white text-sm">↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

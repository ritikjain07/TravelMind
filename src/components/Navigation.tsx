import { Plane, MapPin, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'plan', label: 'Plan Trip', icon: Plane },
    { id: 'trips', label: 'My Trips', icon: MapPin },
    { id: 'profile', label: 'See Yourself', icon: User },
  ];

  return (
    <motion.nav 
      className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl bg-white/80"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Plane className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              TravelMind
            </span>
          </motion.div>

          {/* Navigation tabs */}
          <div className="flex space-x-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <motion.div
                    className={`relative z-10 flex items-center space-x-2 ${isActive ? 'text-white' : ''}`}
                  >
                    <motion.div
                      animate={isActive ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.div>

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Mobile menu icon for smaller screens */}
          <div className="sm:hidden">
            <motion.button
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

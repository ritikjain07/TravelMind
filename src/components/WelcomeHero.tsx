import { Sparkles, MapPin, Heart, Zap, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

export function WelcomeHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
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

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, #ec4899 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, #3b82f6 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-20 px-6">
        <motion.div 
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 mb-8 border border-white/20"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
            <span className="text-white font-medium">AI-Powered Travel Planning</span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-yellow-300 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Main heading */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
            variants={itemVariants}
          >
            Your Perfect Trip is
            <br />
            <motion.span 
              className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              One Click Away
            </motion.span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Discover personalized destinations tailored to your personality, mood, and travel style. 
            Let our AI travel companion create unforgettable experiences just for you.
          </motion.p>
          
          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="mb-16"
          >
            <motion.button
              className="btn-primary text-xl px-12 py-4 rounded-full font-semibold relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => {}}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Plane className="w-6 h-6" />
                <span>Start Your Journey</span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </motion.div>
          
          {/* Feature cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
            variants={containerVariants}
          >
            {[
              {
                icon: Heart,
                title: "Know Yourself",
                description: "Complete our 'See Yourself' profile to understand your unique travel personality",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: Zap,
                title: "AI Recommendations",
                description: "Get intelligent destination suggestions powered by Google's Gemini AI",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: MapPin,
                title: "Perfect Matches",
                description: "Discover destinations that align perfectly with your mood and preferences",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card-premium p-8 text-center group cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-4 text-xl">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <motion.div
                  className="w-0 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mt-4 group-hover:w-full transition-all duration-300"
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Floating scroll indicator */}
          <motion.div
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className="cursor-pointer"
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full mx-auto flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span 
                className="text-white text-xl font-bold"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↓
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

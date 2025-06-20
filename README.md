# TravelMind - AI-Powered Travel Planner 🌍✈️

A sleek, modern travel planning web application that creates personalized, intelligent travel itineraries using AI. Built with React, TypeScript, Tailwind CSS, and powered by Google's Gemini API.

## ✨ Features

### 🧠 "See Yourself" Personality Profiling
- Interactive personality assessment to understand your travel style
- Mood-based recommendations that adapt to how you're feeling
- Customized travel suggestions based on your unique profile

### 🤖 AI-Powered Intelligence
- **Smart Destination Discovery**: Get personalized destination recommendations
- **Intelligent Itinerary Planning**: AI-generated travel plans tailored to your preferences
- **Contextual Travel Tips**: Location-specific advice based on your personality
- **Optimized Routes**: Efficient travel routing suggestions

### 🎨 Modern User Experience
- Beautiful, responsive design with Tailwind CSS
- Intuitive navigation and smooth animations
- Real-time loading states and error handling
- Mobile-first responsive design

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (ultra-fast development)
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: Google Gemini API
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd travelPlanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env .env.local
   
   # Add your Gemini API key
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Main navigation
│   ├── PersonalityProfiler.tsx  # "See Yourself" feature
│   └── DestinationDiscovery.tsx # AI destination finder
├── context/            # React Context for state management
├── services/           # API services (Gemini integration)
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🎯 Key Features Explained

### Personality-Based Recommendations
The app uses a sophisticated personality profiling system that considers:
- **Travel Style**: Adventure, relaxation, cultural, luxury, budget, family
- **Activity Level**: Low, moderate, high energy preferences
- **Social Preferences**: Solo, couple, small group, large group travel
- **Planning Style**: Spontaneous, flexible, or structured approach
- **Current Mood**: Excited, stressed, curious, adventurous, peaceful
- **Interests**: Personalized based on individual preferences

### AI Integration
- **Contextual Prompting**: Sends detailed user profiles to Gemini API
- **Intelligent Parsing**: Processes AI responses into structured data
- **Fallback Handling**: Graceful degradation with mock data when API unavailable
- **Confidence Scoring**: AI recommendations include confidence levels

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

The app uses a custom Tailwind CSS configuration with:
- **Primary Colors**: Blue gradient palette
- **Accent Colors**: Purple/pink accent palette
- **Typography**: Inter font family
- **Components**: Reusable button, card, and input styles
- **Animations**: Smooth transitions and micro-interactions

## 🔮 Future Enhancements

- [ ] Real-time itinerary collaboration
- [ ] Integration with booking platforms
- [ ] Offline mode for saved trips
- [ ] Social features and trip sharing
- [ ] Budget tracking and expense management
- [ ] Weather integration
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI-powered recommendations
- Tailwind CSS for the beautiful design system
- Lucide React for the icon library
- The React and Vite teams for the excellent developer experience
  },
})
```
#   T r a v e l M i n d  
 
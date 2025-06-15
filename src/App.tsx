
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { PersonalityProfiler } from './components/PersonalityProfiler';
import { DestinationDiscovery } from './components/DestinationDiscovery';
import { TripPlanner } from './components/TripPlanner';
import { MyTrips } from './components/MyTrips';
import { Footer } from './components/Footer';
import type { AIRecommendation } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState('discover');
  const [preselectedDestination, setPreselectedDestination] = useState<{
    name: string;
    country: string;
    estimatedCost?: number;
  } | undefined>(undefined);

  const handleNavigateWithDestination = (tab: string, recommendation?: AIRecommendation) => {
    if (recommendation && tab === 'plan') {
      // Extract destination info from recommendation
      const destInfo = {
        name: recommendation.title.split(',')[0].trim(),
        country: recommendation.metadata?.country || 'Unknown',
        estimatedCost: recommendation.metadata?.estimatedCost || undefined
      };
      setPreselectedDestination(destInfo);
    } else {
      setPreselectedDestination(undefined);
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <DestinationDiscovery onNavigate={handleNavigateWithDestination} />;
      case 'plan':
        return <TripPlanner onNavigate={setActiveTab} preselectedDestination={preselectedDestination} />;
      case 'trips':
        return <MyTrips onNavigate={setActiveTab} />;
      case 'profile':
        return <PersonalityProfiler onNavigate={setActiveTab} />;
      default:
        return <DestinationDiscovery onNavigate={handleNavigateWithDestination} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

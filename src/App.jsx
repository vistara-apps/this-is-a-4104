import React, { useState, useEffect } from 'react'
import AppHeader from './components/AppHeader'
import OnboardingFlow from './components/OnboardingFlow'
import Dashboard from './components/Dashboard'
import LegalGuides from './components/LegalGuides'
import EncounterSupport from './components/EncounterSupport'
import SubscriptionModal from './components/SubscriptionModal'

function App() {
  const [currentView, setCurrentView] = useState('onboarding')
  const [user, setUser] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
    if (hasCompletedOnboarding) {
      setCurrentView('dashboard')
      // Load user data
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      setUser(userData)
    }
  }, [])

  const handleOnboardingComplete = (userData) => {
    setUser(userData)
    localStorage.setItem('hasCompletedOnboarding', 'true')
    localStorage.setItem('userData', JSON.stringify(userData))
    setCurrentView('dashboard')
  }

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const handleSubscribe = () => {
    setShowSubscriptionModal(true)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
          />
        )
      case 'guides':
        return (
          <LegalGuides 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
          />
        )
      case 'encounter':
        return (
          <EncounterSupport 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
          />
        )
      default:
        return <Dashboard user={user} onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
        {currentView !== 'onboarding' && (
          <AppHeader 
            user={user} 
            currentView={currentView}
            onNavigate={handleNavigation}
          />
        )}
        
        {renderCurrentView()}
        
        {showSubscriptionModal && (
          <SubscriptionModal 
            onClose={() => setShowSubscriptionModal(false)}
            onSubscribe={(plan) => {
              console.log('Subscribed to:', plan)
              setShowSubscriptionModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
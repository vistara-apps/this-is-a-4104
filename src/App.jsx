import React, { useState, useEffect } from 'react'
import AppHeader from './components/AppHeader'
import OnboardingFlow from './components/OnboardingFlow'
import Dashboard from './components/Dashboard'
import LegalGuides from './components/LegalGuides'
import EncounterSupport from './components/EncounterSupport'
import SubscriptionModal from './components/SubscriptionModal'
import dataService from './lib/dataService'

function App() {
  const [currentView, setCurrentView] = useState('loading')
  const [user, setUser] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Initialize data service
      await dataService.initialize()
      
      // Check if user is authenticated
      const currentUser = dataService.user
      if (currentUser) {
        setUser(currentUser)
        setCurrentView('dashboard')
      } else {
        // Check if user has completed onboarding locally
        const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
        if (hasCompletedOnboarding) {
          setCurrentView('dashboard')
          // Load user data from localStorage as fallback
          const userData = JSON.parse(localStorage.getItem('userData') || '{}')
          setUser(userData)
        } else {
          setCurrentView('onboarding')
        }
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      // Fallback to local storage check
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
      setCurrentView(hasCompletedOnboarding ? 'dashboard' : 'onboarding')
      setIsInitialized(true)
    }
  }

  const handleOnboardingComplete = async (userData) => {
    try {
      // If user provided email/password, register them
      if (userData.email && userData.password) {
        const result = await dataService.register(userData.email, userData.password, {
          preferredLanguage: userData.preferredLanguage,
          emergencyContacts: userData.emergencyContacts
        })
        
        if (result.success) {
          setUser(result.user)
        } else {
          console.error('Registration failed:', result.error)
          // Fall back to local storage
          setUser(userData)
        }
      } else {
        setUser(userData)
      }
      
      localStorage.setItem('hasCompletedOnboarding', 'true')
      localStorage.setItem('userData', JSON.stringify(userData))
      setCurrentView('dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Fallback to local storage
      setUser(userData)
      localStorage.setItem('hasCompletedOnboarding', 'true')
      localStorage.setItem('userData', JSON.stringify(userData))
      setCurrentView('dashboard')
    }
  }

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const handleSubscribe = async () => {
    try {
      if (dataService.user) {
        // User is authenticated, proceed with Stripe checkout
        const result = await dataService.upgradeSubscription('premium')
        if (!result.success) {
          console.error('Subscription failed:', result.error)
          setShowSubscriptionModal(true)
        }
      } else {
        // Show subscription modal for unauthenticated users
        setShowSubscriptionModal(true)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setShowSubscriptionModal(true)
    }
  }

  const renderCurrentView = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading KnowYourRights.ai...</p>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
            dataService={dataService}
          />
        )
      case 'guides':
        return (
          <LegalGuides 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
            dataService={dataService}
          />
        )
      case 'encounter':
        return (
          <EncounterSupport 
            user={user} 
            onNavigate={handleNavigation}
            onSubscribe={handleSubscribe}
            dataService={dataService}
          />
        )
      default:
        return <Dashboard user={user} onNavigate={handleNavigation} dataService={dataService} />
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

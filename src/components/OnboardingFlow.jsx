import React, { useState } from 'react'
import { ChevronRight, Shield, Globe, Users, Smartphone } from 'lucide-react'

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    email: '',
    preferredLanguage: 'en',
    emergencyContacts: [],
    hasLocationPermission: false,
    hasNotificationPermission: false
  })

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      onComplete(userData)
    }
  }

  const handlePermissionRequest = async (type) => {
    if (type === 'location') {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        setUserData(prev => ({ ...prev, hasLocationPermission: true }))
      } catch (error) {
        console.log('Location permission denied')
      }
    } else if (type === 'notification') {
      try {
        const permission = await Notification.requestPermission()
        setUserData(prev => ({ 
          ...prev, 
          hasNotificationPermission: permission === 'granted' 
        }))
      } catch (error) {
        console.log('Notification permission denied')
      }
    }
  }

  const addEmergencyContact = () => {
    const name = prompt('Contact Name:')
    const phone = prompt('Phone Number:')
    if (name && phone) {
      setUserData(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { name, phone }]
      }))
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <Shield size={80} className="mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Welcome to KnowYourRights.ai</h2>
            <p className="text-gray-600 mb-8">
              Your pocket guide to rights and smooth interactions during police encounters.
              Get instant access to essential legal information, scripts, and emergency tools.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <span>Concise, actionable legal guides</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-primary" />
                <span>Multilingual scripts and support</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-primary" />
                <span>One-tap recording and alerts</span>
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Essential Permissions</h2>
            <p className="text-gray-600 mb-6">
              To provide the best protection, we need access to your location and notifications.
            </p>
            
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold mb-2">Location Access</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Enables state-specific legal information and emergency alerts with your location.
                </p>
                <button
                  onClick={() => handlePermissionRequest('location')}
                  className={`w-full py-2 px-4 rounded transition-all ${
                    userData.hasLocationPermission 
                      ? 'bg-green-500 text-white' 
                      : 'bg-primary text-white hover:opacity-90'
                  }`}
                  disabled={userData.hasLocationPermission}
                >
                  {userData.hasLocationPermission ? 'Permission Granted' : 'Grant Location Access'}
                </button>
              </div>
              
              <div className="card">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Receive important alerts and reminders about your rights.
                </p>
                <button
                  onClick={() => handlePermissionRequest('notification')}
                  className={`w-full py-2 px-4 rounded transition-all ${
                    userData.hasNotificationPermission 
                      ? 'bg-green-500 text-white' 
                      : 'bg-primary text-white hover:opacity-90'
                  }`}
                  disabled={userData.hasNotificationPermission}
                >
                  {userData.hasNotificationPermission ? 'Permission Granted' : 'Grant Notification Access'}
                </button>
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Language Preference</h2>
            <p className="text-gray-600 mb-6">
              Choose your preferred language for guides and emergency scripts.
            </p>
            
            <div className="space-y-3">
              {[
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Español' },
                { code: 'fr', name: 'Français' },
                { code: 'de', name: 'Deutsch' }
              ].map(lang => (
                <label key={lang.code} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={userData.preferredLanguage === lang.code}
                    onChange={(e) => setUserData(prev => ({ 
                      ...prev, 
                      preferredLanguage: e.target.value 
                    }))}
                    className="mr-3"
                  />
                  <span className="font-medium">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Emergency Contacts</h2>
            <p className="text-gray-600 mb-6">
              Add trusted contacts who will be notified during emergency situations.
            </p>
            
            <div className="space-y-4 mb-6">
              {userData.emergencyContacts.map((contact, index) => (
                <div key={index} className="card flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.phone}</div>
                  </div>
                  <button
                    onClick={() => setUserData(prev => ({
                      ...prev,
                      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
                    }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {userData.emergencyContacts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No emergency contacts added yet
                </div>
              )}
            </div>
            
            <button
              onClick={addEmergencyContact}
              className="w-full btn-secondary mb-4"
            >
              Add Emergency Contact
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              You can add or modify contacts later in settings
            </p>
          </div>
        )
      
      case 5:
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
              <p className="text-gray-600 mb-6">
                Your rights protection toolkit is ready. Access guides, scripts, and emergency tools anytime.
              </p>
            </div>
            
            <div className="card text-left mb-6">
              <h3 className="font-semibold mb-3">Quick Tutorial:</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Guides:</strong> Tap to access state-specific rights information</li>
                <li>• <strong>Encounter:</strong> One-tap recording and emergency alerts</li>
                <li>• <strong>Scripts:</strong> Pre-written phrases in your language</li>
              </ul>
            </div>
            
            <div className="card bg-accent/10 border border-accent/20">
              <h3 className="font-semibold mb-2">🔒 Upgrade to Premium</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get advanced state-specific details, enhanced recording, and cloud storage for $2.99/month.
              </p>
              <button className="text-accent font-semibold text-sm">
                Learn More →
              </button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="flex-1">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Step {step} of 5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
        
        {renderStep()}
      </div>
      
      <div className="pt-6">
        <button
          onClick={handleNext}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {step === 5 ? 'Get Started' : 'Continue'}
          <ChevronRight size={20} />
        </button>
        
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export default OnboardingFlow
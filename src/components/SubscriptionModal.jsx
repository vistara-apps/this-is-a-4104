import React, { useState } from 'react'
import { X, Check, Star, AlertCircle } from 'lucide-react'
import Button from './Button'
import CardDisplay from './CardDisplay'
import { SUBSCRIPTION_PLANS, formatPrice } from '../lib/stripe'
import dataService from '../lib/dataService'

const SubscriptionModal = ({ onClose, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubscribe = async (planId) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      if (dataService.user) {
        // User is authenticated, proceed with Stripe checkout
        const result = await dataService.upgradeSubscription(planId)
        if (result.success) {
          onSubscribe(planId)
        } else {
          setError(result.error || 'Failed to start subscription process')
        }
      } else {
        // User needs to sign up first
        setError('Please complete onboarding first to subscribe')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setError('Failed to start subscription process. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Premium Plan */}
            <CardDisplay className="border-2 border-primary">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-accent fill-current" size={24} />
                <h3 className="text-xl font-semibold">{SUBSCRIPTION_PLANS.premium.name} Plan</h3>
                <span className="bg-accent/10 text-accent px-2 py-1 rounded text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary mb-1">
                  {formatPrice(SUBSCRIPTION_PLANS.premium.price)}
                </div>
                <div className="text-gray-600">per {SUBSCRIPTION_PLANS.premium.interval}</div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {SUBSCRIPTION_PLANS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSubscribe('premium')}
                className="w-full btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Start Premium Trial'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                7-day free trial, then $2.99/month. Cancel anytime.
              </p>
            </CardDisplay>

            {/* Free Plan for Comparison */}
            <CardDisplay>
              <h3 className="text-lg font-semibold mb-4">{SUBSCRIPTION_PLANS.free.name} Plan</h3>
              
              <div className="mb-4">
                <div className="text-2xl font-bold mb-1">{formatPrice(SUBSCRIPTION_PLANS.free.price)}</div>
                <div className="text-gray-600">{SUBSCRIPTION_PLANS.free.interval}</div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full"
                disabled={isProcessing}
              >
                Continue with Free
              </Button>
            </CardDisplay>

            {/* Why Upgrade Section */}
            <div className="text-center">
              <h4 className="font-semibold mb-3">Why Upgrade?</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl mb-1">⚖️</div>
                  <div className="font-medium">State-Specific</div>
                  <div className="text-gray-600">Detailed local laws</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="font-medium">Multilingual</div>
                  <div className="text-gray-600">10+ languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">☁️</div>
                  <div className="font-medium">Cloud Storage</div>
                  <div className="text-gray-600">Secure recordings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚨</div>
                  <div className="font-medium">Enhanced Alerts</div>
                  <div className="text-gray-600">Better protection</div>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Secure payments powered by Stripe</p>
              <p className="mt-1">
                Your subscription helps maintain and improve these critical rights protection tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal

import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key')

/**
 * Subscription plans configuration
 */
export const SUBSCRIPTION_PLANS = {
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 2.99,
    interval: 'month',
    features: [
      'State-specific legal guides',
      'Enhanced recording features',
      'Cloud storage for recordings',
      'Priority customer support',
      'Advanced multilingual scripts',
      'Unlimited shareable cards'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium'
  },
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      'Basic legal guides',
      'Essential scripts in English',
      'Basic recording functionality',
      'Limited shareable cards (5/month)'
    ]
  }
}

/**
 * Create a Stripe checkout session for subscription
 * @param {string} planId - The subscription plan ID
 * @param {string} userId - The user ID
 * @param {string} userEmail - The user's email
 * @returns {Promise<void>} Redirects to Stripe checkout
 */
export const createCheckoutSession = async (planId, userId, userEmail) => {
  try {
    const stripe = await stripePromise
    
    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan || plan.price === 0) {
      throw new Error('Invalid subscription plan')
    }

    // In a real application, this would be a call to your backend API
    // For demo purposes, we'll simulate the checkout session creation
    const checkoutSession = await createCheckoutSessionAPI({
      priceId: plan.stripePriceId,
      userId,
      userEmail,
      successUrl: `${window.location.origin}/subscription/success`,
      cancelUrl: `${window.location.origin}/subscription/cancel`
    })

    // Redirect to Stripe checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSession.id
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to start checkout process')
  }
}

/**
 * Simulate backend API call to create checkout session
 * In production, this would be an actual API call to your backend
 */
const createCheckoutSessionAPI = async (params) => {
  // This is a mock implementation
  // In production, you would call your backend API like:
  // const response = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params)
  // })
  // return response.json()

  console.log('Creating checkout session with params:', params)
  
  // Mock response for demo
  return {
    id: 'cs_mock_' + Math.random().toString(36).substr(2, 9),
    url: 'https://checkout.stripe.com/mock-session'
  }
}

/**
 * Create a customer portal session for managing subscription
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<string>} Portal session URL
 */
export const createPortalSession = async (customerId) => {
  try {
    // In production, this would be a backend API call
    const portalSession = await createPortalSessionAPI({
      customerId,
      returnUrl: window.location.origin
    })

    return portalSession.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Failed to access customer portal')
  }
}

/**
 * Mock backend API call for customer portal
 */
const createPortalSessionAPI = async (params) => {
  console.log('Creating portal session with params:', params)
  
  // Mock response
  return {
    url: 'https://billing.stripe.com/mock-portal'
  }
}

/**
 * Validate subscription status
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription status
 */
export const validateSubscription = async (subscriptionId) => {
  try {
    // In production, this would validate with your backend
    const subscription = await validateSubscriptionAPI(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error validating subscription:', error)
    return { status: 'inactive', plan: 'free' }
  }
}

/**
 * Mock subscription validation
 */
const validateSubscriptionAPI = async (subscriptionId) => {
  console.log('Validating subscription:', subscriptionId)
  
  // Mock response
  return {
    id: subscriptionId,
    status: 'active',
    plan: 'premium',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const result = await cancelSubscriptionAPI(subscriptionId)
    return result
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Mock subscription cancellation
 */
const cancelSubscriptionAPI = async (subscriptionId) => {
  console.log('Canceling subscription:', subscriptionId)
  
  return {
    id: subscriptionId,
    status: 'canceled',
    canceledAt: new Date().toISOString()
  }
}

/**
 * Get subscription usage and limits
 * @param {string} planId - Current plan ID
 * @param {Object} usage - Current usage stats
 * @returns {Object} Usage information with limits
 */
export const getSubscriptionLimits = (planId, usage = {}) => {
  const limits = {
    free: {
      shareableCards: 5,
      cloudStorage: 0, // MB
      stateSpecificGuides: false,
      enhancedRecording: false,
      prioritySupport: false
    },
    premium: {
      shareableCards: -1, // unlimited
      cloudStorage: 1000, // MB
      stateSpecificGuides: true,
      enhancedRecording: true,
      prioritySupport: true
    }
  }

  const planLimits = limits[planId] || limits.free
  
  return {
    limits: planLimits,
    usage: {
      shareableCards: usage.shareableCards || 0,
      cloudStorage: usage.cloudStorage || 0
    },
    canUseFeature: (feature) => {
      if (feature === 'shareableCards') {
        return planLimits.shareableCards === -1 || usage.shareableCards < planLimits.shareableCards
      }
      return planLimits[feature] || false
    }
  }
}

/**
 * Format price for display
 * @param {number} price - Price in dollars
 * @param {string} currency - Currency code
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

/**
 * Check if user has active subscription
 * @param {Object} user - User object with subscription info
 * @returns {boolean} Whether user has active premium subscription
 */
export const hasActiveSubscription = (user) => {
  if (!user?.subscriptionStatus) return false
  
  const validStatuses = ['active', 'trialing']
  return validStatuses.includes(user.subscriptionStatus)
}

/**
 * Get feature availability for user
 * @param {Object} user - User object
 * @param {string} feature - Feature name to check
 * @returns {boolean} Whether feature is available
 */
export const isFeatureAvailable = (user, feature) => {
  const isPremium = hasActiveSubscription(user)
  
  const featureMap = {
    stateSpecificGuides: isPremium,
    enhancedRecording: isPremium,
    cloudStorage: isPremium,
    unlimitedCards: isPremium,
    prioritySupport: isPremium,
    multilingualScripts: isPremium
  }
  
  return featureMap[feature] || false
}

export default {
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  createPortalSession,
  validateSubscription,
  cancelSubscription,
  getSubscriptionLimits,
  formatPrice,
  hasActiveSubscription,
  isFeatureAvailable
}

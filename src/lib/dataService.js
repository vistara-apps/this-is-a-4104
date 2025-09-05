import { 
  supabase, 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  getLegalGuides,
  createLegalGuide,
  getScripts,
  createScript,
  saveRecording,
  getUserRecordings,
  createGeneratedCard,
  getGeneratedCard,
  uploadRecording
} from './supabase'

import { 
  generateLegalGuide, 
  generateScripts, 
  generateShareableCard,
  validateOpenAIConnection
} from './openai'

import { 
  createCheckoutSession,
  hasActiveSubscription,
  isFeatureAvailable,
  getSubscriptionLimits,
  SUBSCRIPTION_PLANS
} from './stripe'

/**
 * Comprehensive data service that orchestrates all backend integrations
 */
class DataService {
  constructor() {
    this.user = null
    this.isInitialized = false
  }

  /**
   * Initialize the data service
   */
  async initialize() {
    try {
      // Check current user session
      this.user = await getCurrentUser()
      
      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', this.user?.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          this.user = null
        }
      })

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize data service:', error)
      return false
    }
  }

  /**
   * Authentication methods
   */
  async register(email, password, userData = {}) {
    try {
      const result = await signUp(email, password, {
        preferredLanguage: userData.preferredLanguage || 'en',
        emergencyContacts: userData.emergencyContacts || []
      })
      
      this.user = result.user
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message }
    }
  }

  async login(email, password) {
    try {
      const result = await signIn(email, password)
      this.user = result.user
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }

  async logout() {
    try {
      await signOut()
      this.user = null
      return { success: true }
    } catch (error) {
      console.error('Logout failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Legal guides management
   */
  async getAvailableGuides(filters = {}) {
    try {
      // First try to get from database
      const dbGuides = await getLegalGuides(filters)
      
      // If no guides found and user has premium, generate some
      if (dbGuides.length === 0 && this.isPremiumUser()) {
        await this.generateInitialGuides()
        return await getLegalGuides(filters)
      }
      
      return dbGuides
    } catch (error) {
      console.error('Failed to get guides:', error)
      return this.getFallbackGuides(filters)
    }
  }

  async generateGuideContent(scenario, state = 'General', language = 'en') {
    try {
      // Check if user can access this feature
      if (state !== 'General' && !isFeatureAvailable(this.user, 'stateSpecificGuides')) {
        throw new Error('State-specific guides require premium subscription')
      }

      const content = await generateLegalGuide(scenario, state, language)
      
      // Save to database if user is authenticated
      if (this.user) {
        await createLegalGuide({
          state,
          title: `${scenario} Rights - ${state}`,
          content,
          language,
          category: this.categorizeScenario(scenario)
        })
      }
      
      return content
    } catch (error) {
      console.error('Failed to generate guide:', error)
      throw error
    }
  }

  /**
   * Scripts management
   */
  async getScriptsForScenario(scenario, language = 'en') {
    try {
      // Try database first
      let scripts = await getScripts(scenario, language)
      
      // If no scripts found, generate them
      if (scripts.length === 0) {
        const generatedScripts = await generateScripts(scenario, language)
        
        // Save to database
        for (const script of generatedScripts) {
          await createScript({
            scenario,
            language,
            script_text: JSON.stringify(script)
          })
        }
        
        return generatedScripts
      }
      
      // Parse stored scripts
      return scripts.map(s => JSON.parse(s.script_text))
    } catch (error) {
      console.error('Failed to get scripts:', error)
      return this.getFallbackScripts(scenario, language)
    }
  }

  /**
   * Recording management
   */
  async startRecording(options = {}) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: options.video || false
      })
      
      return {
        success: true,
        stream,
        mediaRecorder: new MediaRecorder(stream)
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      return { success: false, error: error.message }
    }
  }

  async saveRecordingFile(blob, duration, type = 'audio') {
    try {
      if (!this.user) {
        throw new Error('User must be authenticated to save recordings')
      }

      // Check storage limits for free users
      if (!this.isPremiumUser()) {
        const usage = await this.getStorageUsage()
        if (usage.recordings >= 5) {
          throw new Error('Free users can only save 5 recordings. Upgrade to premium for unlimited storage.')
        }
      }

      // Upload file to Supabase storage
      const file = new File([blob], `recording-${Date.now()}.${type === 'video' ? 'webm' : 'wav'}`, {
        type: blob.type
      })
      
      const filePath = await uploadRecording(file, this.user.id)
      
      // Save recording metadata
      const recording = await saveRecording(this.user.id, filePath, duration, type)
      
      return { success: true, recording }
    } catch (error) {
      console.error('Failed to save recording:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserRecordingHistory() {
    try {
      if (!this.user) return []
      
      const recordings = await getUserRecordings(this.user.id)
      return recordings
    } catch (error) {
      console.error('Failed to get recording history:', error)
      return []
    }
  }

  /**
   * Shareable cards
   */
  async generateRightsCard(location, scenario = 'general') {
    try {
      // Check usage limits for free users
      if (!this.isPremiumUser()) {
        const usage = await this.getUsageStats()
        const limits = getSubscriptionLimits('free', usage)
        
        if (!limits.canUseFeature('shareableCards')) {
          throw new Error('Monthly card limit reached. Upgrade to premium for unlimited cards.')
        }
      }

      const emergencyContacts = this.user?.user_metadata?.emergencyContacts || []
      const cardContent = await generateShareableCard(location, emergencyContacts, scenario)
      
      // Save to database if user is authenticated
      if (this.user) {
        const card = await createGeneratedCard(this.user.id, cardContent)
        return { success: true, card }
      }
      
      return { success: true, card: cardContent }
    } catch (error) {
      console.error('Failed to generate rights card:', error)
      return { success: false, error: error.message }
    }
  }

  async getSharedCard(cardId) {
    try {
      const card = await getGeneratedCard(cardId)
      return { success: true, card }
    } catch (error) {
      console.error('Failed to get shared card:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Subscription management
   */
  async upgradeSubscription(planId = 'premium') {
    try {
      if (!this.user) {
        throw new Error('User must be authenticated to upgrade')
      }

      await createCheckoutSession(planId, this.user.id, this.user.email)
      return { success: true }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error)
      return { success: false, error: error.message }
    }
  }

  isPremiumUser() {
    return hasActiveSubscription(this.user)
  }

  getAvailableFeatures() {
    const features = {}
    const featureList = [
      'stateSpecificGuides',
      'enhancedRecording', 
      'cloudStorage',
      'unlimitedCards',
      'prioritySupport',
      'multilingualScripts'
    ]
    
    featureList.forEach(feature => {
      features[feature] = isFeatureAvailable(this.user, feature)
    })
    
    return features
  }

  /**
   * Emergency contact management
   */
  async updateEmergencyContacts(contacts) {
    try {
      if (!this.user) {
        throw new Error('User must be authenticated')
      }

      const { error } = await supabase.auth.updateUser({
        data: { emergencyContacts: contacts }
      })

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update emergency contacts:', error)
      return { success: false, error: error.message }
    }
  }

  async sendEmergencyAlert(location, message = 'Emergency situation - location shared') {
    try {
      const contacts = this.user?.user_metadata?.emergencyContacts || []
      
      if (contacts.length === 0) {
        throw new Error('No emergency contacts configured')
      }

      // In a real app, this would send SMS/email alerts
      // For now, we'll simulate the alert
      console.log('Sending emergency alert to contacts:', contacts)
      console.log('Location:', location)
      console.log('Message:', message)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, contactsNotified: contacts.length }
    } catch (error) {
      console.error('Failed to send emergency alert:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Utility methods
   */
  async getUsageStats() {
    try {
      if (!this.user) return {}
      
      // Get user's usage statistics
      const recordings = await getUserRecordings(this.user.id)
      
      return {
        recordings: recordings.length,
        shareableCards: 0, // Would be calculated from database
        storageUsed: 0 // Would be calculated from file sizes
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {}
    }
  }

  async getStorageUsage() {
    const stats = await this.getUsageStats()
    return {
      recordings: stats.recordings || 0,
      storageUsed: stats.storageUsed || 0
    }
  }

  categorizeScenario(scenario) {
    const categoryMap = {
      'traffic stop': 'traffic',
      'street encounter': 'street', 
      'home search': 'property',
      'arrest': 'arrest',
      'questioning': 'street'
    }
    
    return categoryMap[scenario.toLowerCase()] || 'general'
  }

  async generateInitialGuides() {
    const scenarios = [
      { scenario: 'traffic stop', category: 'traffic' },
      { scenario: 'street encounter', category: 'street' },
      { scenario: 'home search', category: 'property' }
    ]
    
    for (const { scenario, category } of scenarios) {
      try {
        const content = await generateLegalGuide(scenario)
        await createLegalGuide({
          state: 'General',
          title: `${scenario} Rights`,
          content,
          language: 'en',
          category
        })
      } catch (error) {
        console.error(`Failed to generate ${scenario} guide:`, error)
      }
    }
  }

  getFallbackGuides(filters = {}) {
    // Return static fallback guides when API is unavailable
    return [
      {
        id: 'fallback-1',
        title: 'Traffic Stop Rights',
        category: 'traffic',
        state: 'General',
        content: '# Traffic Stop Rights\n\n## Your Key Rights\n- Right to remain silent\n- Right to refuse searches\n- Right to ask if you\'re free to go\n\n## What to Do\n1. Pull over safely\n2. Keep hands visible\n3. Be polite but firm\n\n## What NOT to Do\n- Don\'t argue or resist\n- Don\'t volunteer information\n- Don\'t consent to searches'
      }
    ]
  }

  getFallbackScripts(scenario, language) {
    const scripts = {
      'en': [
        {
          phrase: "I exercise my right to remain silent.",
          context: "When asked questions beyond identification"
        },
        {
          phrase: "Am I free to go?",
          context: "To determine if you're being detained"
        },
        {
          phrase: "I do not consent to any searches.",
          context: "When asked to search person or property"
        }
      ]
    }
    
    return scripts[language] || scripts['en']
  }
}

// Create singleton instance
const dataService = new DataService()

export default dataService

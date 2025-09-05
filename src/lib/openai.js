import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

/**
 * Generate concise legal rights summary for a specific scenario
 * @param {string} scenario - The legal scenario (e.g., "traffic stop", "street encounter")
 * @param {string} state - The state for state-specific laws (optional)
 * @param {string} language - The language for the response (default: 'en')
 * @returns {Promise<string>} Generated legal guide content
 */
export const generateLegalGuide = async (scenario, state = 'General', language = 'en') => {
  try {
    const prompt = `Create a concise, mobile-optimized legal rights guide for: ${scenario}${state !== 'General' ? ` in ${state}` : ''}.

Requirements:
- Write in ${language === 'en' ? 'English' : language}
- Use clear, actionable language
- Include specific rights, what to do, and what NOT to do
- Keep it under 500 words
- Use bullet points and short paragraphs
- Focus on practical, immediate guidance
- Include disclaimer about seeking legal counsel

Format as markdown with clear sections:
# [Title]
## Your Key Rights
## What to Do
## What NOT to Do
## Important Notes

Make it accessible for someone in a high-stress situation.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a legal rights educator who creates clear, concise guides for civilians during police encounters. Focus on constitutional rights and practical advice. Always include disclaimers about seeking professional legal counsel."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating legal guide:', error)
    throw new Error('Failed to generate legal guide')
  }
}

/**
 * Generate multilingual scripts for common police encounter scenarios
 * @param {string} scenario - The scenario type
 * @param {string} language - Target language
 * @returns {Promise<Array>} Array of script objects
 */
export const generateScripts = async (scenario, language = 'en') => {
  try {
    const languageMap = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese (Simplified)'
    }

    const targetLanguage = languageMap[language] || 'English'

    const prompt = `Generate 5-7 essential phrases for ${scenario} encounters in ${targetLanguage}.

Requirements:
- Clear, respectful, and assertive language
- Phrases that assert constitutional rights
- Easy to remember and pronounce
- Include phonetic pronunciation if not English
- Cover key situations: asserting rights, asking questions, declining searches

Return as JSON array with objects containing:
- "phrase": the actual phrase
- "pronunciation": phonetic guide (if not English)
- "context": when to use this phrase
- "translation": English translation (if not English)

Example scenarios: traffic stop, street questioning, home visit, arrest situation`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a multilingual legal rights educator. Create clear, respectful phrases that help people assert their constitutional rights during police encounters. Always prioritize de-escalation and legal compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.2
    })

    const response = completion.choices[0].message.content
    
    // Try to parse JSON response
    try {
      return JSON.parse(response)
    } catch (parseError) {
      // If JSON parsing fails, return a structured fallback
      console.warn('Failed to parse OpenAI response as JSON, using fallback')
      return generateFallbackScripts(scenario, language)
    }
  } catch (error) {
    console.error('Error generating scripts:', error)
    return generateFallbackScripts(scenario, language)
  }
}

/**
 * Generate a shareable digital card with user's rights and emergency info
 * @param {Object} userLocation - User's current location
 * @param {Object} emergencyContacts - User's emergency contacts
 * @param {string} scenario - Current scenario type
 * @returns {Promise<Object>} Generated card content
 */
export const generateShareableCard = async (userLocation, emergencyContacts, scenario = 'general') => {
  try {
    const prompt = `Create a concise digital rights card for someone in a ${scenario} situation.

Location: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown'}
Emergency Contacts: ${emergencyContacts?.length || 0} contacts available

Include:
- Essential rights summary (3-4 key points)
- Emergency contact information
- Location information
- Timestamp
- QR code text for sharing

Format as JSON with:
- "title": card title
- "rights": array of key rights
- "location": location info
- "timestamp": current time
- "emergencyInfo": contact details
- "shareText": text for sharing/QR code

Keep it concise but comprehensive for emergency situations.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are creating emergency rights cards that can be quickly shared during police encounters. Focus on essential information that could be critical in emergency situations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.2
    })

    const response = completion.choices[0].message.content
    
    try {
      const cardData = JSON.parse(response)
      return {
        ...cardData,
        timestamp: new Date().toISOString(),
        location: userLocation,
        emergencyContacts: emergencyContacts
      }
    } catch (parseError) {
      // Fallback card structure
      return generateFallbackCard(userLocation, emergencyContacts, scenario)
    }
  } catch (error) {
    console.error('Error generating shareable card:', error)
    return generateFallbackCard(userLocation, emergencyContacts, scenario)
  }
}

/**
 * Fallback scripts when OpenAI is unavailable
 */
const generateFallbackScripts = (scenario, language) => {
  const scripts = {
    'en': [
      {
        phrase: "I exercise my right to remain silent.",
        context: "When asked questions beyond identification",
        pronunciation: null,
        translation: null
      },
      {
        phrase: "Am I free to go?",
        context: "To determine if you're being detained",
        pronunciation: null,
        translation: null
      },
      {
        phrase: "I do not consent to any searches.",
        context: "When asked to search person or property",
        pronunciation: null,
        translation: null
      },
      {
        phrase: "I want to speak to my attorney.",
        context: "If arrested or detained",
        pronunciation: null,
        translation: null
      },
      {
        phrase: "I am not resisting arrest.",
        context: "If being arrested",
        pronunciation: null,
        translation: null
      }
    ],
    'es': [
      {
        phrase: "Ejerzo mi derecho a permanecer en silencio.",
        context: "Cuando te hagan preguntas más allá de la identificación",
        pronunciation: "eh-HAIR-so mee deh-REH-cho ah pair-mah-neh-SAIR en see-LEN-see-oh",
        translation: "I exercise my right to remain silent."
      },
      {
        phrase: "¿Soy libre de irme?",
        context: "Para determinar si estás siendo detenido",
        pronunciation: "soy LEE-breh deh EER-meh",
        translation: "Am I free to go?"
      },
      {
        phrase: "No consiento a ningún registro.",
        context: "Cuando pidan registrar persona o propiedad",
        pronunciation: "no con-see-EN-to ah neen-GOON reh-HEES-tro",
        translation: "I do not consent to any searches."
      }
    ]
  }

  return scripts[language] || scripts['en']
}

/**
 * Fallback card when OpenAI is unavailable
 */
const generateFallbackCard = (userLocation, emergencyContacts, scenario) => {
  return {
    title: "Know Your Rights Card",
    rights: [
      "Right to remain silent",
      "Right to refuse searches",
      "Right to ask if you're free to go",
      "Right to an attorney"
    ],
    location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Location unavailable",
    timestamp: new Date().toISOString(),
    emergencyInfo: emergencyContacts?.length ? `${emergencyContacts.length} emergency contacts available` : "No emergency contacts set",
    shareText: `Know Your Rights - Emergency Card\nGenerated: ${new Date().toLocaleString()}\nLocation: ${userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Unknown"}`
  }
}

/**
 * Validate OpenAI API key and connection
 */
export const validateOpenAIConnection = async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test connection" }],
      max_tokens: 5
    })
    return true
  } catch (error) {
    console.error('OpenAI connection failed:', error)
    return false
  }
}

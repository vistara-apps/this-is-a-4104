import React, { useState } from 'react'
import { Volume2, Copy, Check } from 'lucide-react'
import CardDisplay from './CardDisplay'
import Button from './Button'

const ScriptViewer = ({ scripts, language = 'en' }) => {
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(null)
  
  const availableLanguages = Object.keys(scripts)
  const currentScripts = scripts[language] || scripts.en || []
  
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.log('Copy failed:', error)
    }
  }
  
  const speakText = (text, index) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US'
      utterance.rate = 0.8 // Slightly slower for clarity
      
      utterance.onstart = () => setIsPlaying(index)
      utterance.onend = () => setIsPlaying(null)
      utterance.onerror = () => setIsPlaying(null)
      
      speechSynthesis.speak(utterance)
    }
  }
  
  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsPlaying(null)
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Emergency Scripts</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tap any script to hear it spoken aloud, or copy to clipboard.
        </p>
      </div>
      
      {availableLanguages.length > 1 && (
        <div className="flex gap-2 mb-4">
          {availableLanguages.map(lang => (
            <span
              key={lang}
              className={`px-3 py-1 rounded-full text-sm ${
                lang === language 
                  ? 'bg-primary text-white' 
                  : 'bg-surface text-text'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang.toUpperCase()}
            </span>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {currentScripts.map((script, index) => (
          <CardDisplay
            key={index}
            variant="interactive"
            className="hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-lg leading-relaxed flex-1">
                "{script}"
              </p>
              
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="iconOnly"
                  onClick={() => {
                    if (isPlaying === index) {
                      stopSpeaking()
                    } else {
                      speakText(script, index)
                    }
                  }}
                  className={`p-2 rounded ${
                    isPlaying === index 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title={isPlaying === index ? 'Stop speaking' : 'Speak aloud'}
                >
                  {isPlaying === index ? (
                    <div className="w-4 h-4 bg-current rounded-sm" />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </Button>
                
                <Button
                  variant="iconOnly"
                  onClick={() => copyToClipboard(script, index)}
                  className={`p-2 rounded ${
                    copiedIndex === index
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Tap the script to copy, or use the speak button to hear it aloud
              </p>
            </div>
          </CardDisplay>
        ))}
      </div>
      
      {currentScripts.length === 0 && (
        <CardDisplay className="text-center py-8">
          <p className="text-gray-500">No scripts available for this section yet.</p>
        </CardDisplay>
      )}
      
      <CardDisplay className="bg-yellow-50 border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-yellow-700">
          Practice these phrases beforehand. In stressful situations, 
          familiar words come more naturally and help you stay calm.
        </p>
      </CardDisplay>
    </div>
  )
}

export default ScriptViewer
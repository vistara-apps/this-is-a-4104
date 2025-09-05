import React, { useState, useRef, useEffect } from 'react'
import { Video, Square, Users, MapPin, Phone, AlertTriangle, Shield } from 'lucide-react'
import CardDisplay from './CardDisplay'
import Button from './Button'
import RecordingControl from './RecordingControl'

const EncounterSupport = ({ user, onNavigate, onSubscribe }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasAlerted, setHasAlerted] = useState(false)
  const [location, setLocation] = useState(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.log('Location error:', error)
      )
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const quickScripts = [
    "I exercise my right to remain silent.",
    "Am I free to go?",
    "I do not consent to any searches.",
    "I want to speak to my attorney.",
    "I am not resisting arrest."
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        console.log('Recording saved:', url)
        // Here you would typically save to cloud storage
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Send alert to emergency contacts
      sendEmergencyAlert()
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to start recording. Please check camera and microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const sendEmergencyAlert = () => {
    if (user?.emergencyContacts?.length > 0 && location) {
      const message = `EMERGENCY ALERT: I am currently in a police encounter. My location is approximately ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}. Time: ${new Date().toLocaleString()}`
      
      // In a real app, this would send SMS/notifications
      console.log('Sending emergency alert:', message)
      console.log('To contacts:', user.emergencyContacts)
      
      setHasAlerted(true)
      
      // Simulate sending notifications
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Emergency Alert Sent', {
            body: `Alert sent to ${user.emergencyContacts.length} emergency contact(s)`,
            icon: '/icon-192x192.png'
          })
        })
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateShareableCard = () => {
    const cardContent = {
      name: user?.email?.split('@')[0] || 'User',
      rights: 'I have the right to remain silent and refuse searches',
      contacts: user?.emergencyContacts || [],
      location: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location unavailable',
      timestamp: new Date().toLocaleString()
    }
    
    // In a real app, this would generate a shareable URL
    const shareableUrl = `https://knowyourrights.ai/card/${btoa(JSON.stringify(cardContent))}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Rights Information',
        text: 'Emergency contact information and rights summary',
        url: shareableUrl
      })
    } else {
      navigator.clipboard.writeText(shareableUrl)
      alert('Shareable link copied to clipboard!')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Shield size={48} className="mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Encounter Support</h1>
        <p className="text-gray-600">
          Stay safe with recording, alerts, and quick access to scripts
        </p>
      </div>

      {/* Recording Section */}
      <CardDisplay className="text-center">
        <h2 className="font-semibold mb-4">Quick Record & Alert</h2>
        
        {isRecording ? (
          <div className="space-y-4">
            <div className="text-2xl font-mono text-red-600">
              🔴 {formatTime(recordingTime)}
            </div>
            <p className="text-sm text-gray-600">
              Recording in progress. Emergency contacts {hasAlerted ? 'have been' : 'are being'} notified.
            </p>
            <RecordingControl
              variant="stop"
              onClick={stopRecording}
              className="mx-auto"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Tap to start recording and automatically alert your emergency contacts with your location.
            </p>
            <RecordingControl
              variant="start"
              onClick={startRecording}
              className="mx-auto"
            />
            
            {(!user?.emergencyContacts || user.emergencyContacts.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">No Emergency Contacts</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Add emergency contacts in settings to enable automatic alerts.
                </p>
              </div>
            )}
          </div>
        )}
      </CardDisplay>

      {/* Quick Scripts */}
      <div>
        <h3 className="font-semibold mb-4">Quick Scripts</h3>
        <div className="space-y-2">
          {quickScripts.map((script, index) => (
            <CardDisplay
              key={index}
              variant="interactive"
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => {
                // Read script aloud or copy to clipboard
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(script)
                  utterance.lang = user?.preferredLanguage === 'es' ? 'es-ES' : 'en-US'
                  speechSynthesis.speak(utterance)
                }
                navigator.clipboard.writeText(script)
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{script}</p>
                <div className="text-xs text-gray-500">Tap to speak</div>
              </div>
            </CardDisplay>
          ))}
        </div>
        
        <Button
          variant="secondary"
          className="w-full mt-4"
          onClick={() => onNavigate('guides')}
        >
          View All Scripts
        </Button>
      </div>

      {/* Emergency Information */}
      <CardDisplay>
        <h3 className="font-semibold mb-4">Emergency Information</h3>
        
        <div className="space-y-3">
          {location && (
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-gray-500" />
              <div>
                <div className="font-medium">Current Location</div>
                <div className="text-sm text-gray-600">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Users size={20} className="text-gray-500" />
            <div>
              <div className="font-medium">Emergency Contacts</div>
              <div className="text-sm text-gray-600">
                {user?.emergencyContacts?.length || 0} contact(s) configured
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-gray-500" />
            <div>
              <div className="font-medium">Emergency Services</div>
              <div className="text-sm text-gray-600">
                Call 911 for immediate assistance
              </div>
            </div>
          </div>
        </div>
        
        <Button
          variant="secondary"
          className="w-full mt-4"
          onClick={generateShareableCard}
        >
          Generate Shareable Card
        </Button>
      </CardDisplay>

      {/* Safety Reminders */}
      <CardDisplay className="bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Safety Reminders</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Stay calm and keep hands visible</li>
          <li>• Don't argue or resist physically</li>
          <li>• Clearly state you're exercising your rights</li>
          <li>• Record everything if possible</li>
          <li>• Ask for a lawyer if arrested</li>
        </ul>
      </CardDisplay>
    </div>
  )
}

export default EncounterSupport
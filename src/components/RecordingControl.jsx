import React from 'react'
import { Video, Square } from 'lucide-react'

const RecordingControl = ({ 
  variant = 'start', 
  onClick, 
  className = '', 
  disabled = false 
}) => {
  const isStart = variant === 'start'
  
  const baseClasses = `
    w-20 h-20 rounded-full font-semibold transition-all duration-200 
    focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `
  
  const variantClasses = isStart
    ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 hover:shadow-xl'
    : 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-300 hover:shadow-xl'
  
  const classes = `${baseClasses} ${variantClasses} ${className}`
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      title={isStart ? 'Start Recording' : 'Stop Recording'}
    >
      {isStart ? (
        <Video size={32} className="mx-auto" />
      ) : (
        <Square size={24} className="mx-auto" />
      )}
    </button>
  )
}

export default RecordingControl
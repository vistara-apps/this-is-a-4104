import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary',
    secondary: 'bg-surface text-text hover:bg-opacity-80 focus:ring-surface border border-gray-300',
    iconOnly: 'p-2 hover:bg-gray-100 focus:ring-gray-300'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-sm',
    default: 'px-6 py-3 rounded-md',
    lg: 'px-8 py-4 text-lg rounded-lg'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
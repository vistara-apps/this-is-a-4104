import React from 'react'

const CardDisplay = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-card transition-all duration-200'
  
  const variantClasses = {
    default: 'p-6',
    interactive: 'p-4 hover:shadow-lg cursor-pointer hover:-translate-y-0.5'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  if (onClick) {
    return (
      <button
        className={`${classes} text-left w-full`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default CardDisplay
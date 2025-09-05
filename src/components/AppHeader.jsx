import React from 'react'
import { Menu, User, Home, FileText, Shield } from 'lucide-react'

const AppHeader = ({ user, currentView, onNavigate }) => {
  return (
    <header className="bg-primary text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">KnowYourRights.ai</h1>
        <div className="flex items-center gap-2">
          <User size={20} />
          <span className="text-sm">{user?.email || 'User'}</span>
        </div>
      </div>
      
      <nav className="flex justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${
            currentView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <Home size={20} />
          <span className="text-xs">Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('guides')}
          className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${
            currentView === 'guides' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <FileText size={20} />
          <span className="text-xs">Guides</span>
        </button>
        
        <button
          onClick={() => onNavigate('encounter')}
          className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${
            currentView === 'encounter' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <Shield size={20} />
          <span className="text-xs">Encounter</span>
        </button>
      </nav>
    </header>
  )
}

export default AppHeader
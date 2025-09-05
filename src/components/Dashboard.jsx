import React from 'react'
import { Shield, FileText, Users, Star, ArrowRight } from 'lucide-react'
import CardDisplay from './CardDisplay'
import Button from './Button'

const Dashboard = ({ user, onNavigate, onSubscribe }) => {
  const quickActions = [
    {
      title: 'Know Your Rights',
      description: 'Essential guides for police encounters',
      icon: FileText,
      action: () => onNavigate('guides'),
      color: 'bg-blue-500'
    },
    {
      title: 'Emergency Scripts',
      description: 'What to say in multiple languages',
      icon: Users,
      action: () => onNavigate('guides'),
      color: 'bg-green-500'
    },
    {
      title: 'Start Encounter',
      description: 'Record & alert emergency contacts',
      icon: Shield,
      action: () => onNavigate('encounter'),
      color: 'bg-red-500'
    }
  ]

  const recentGuides = [
    { title: 'Traffic Stop Rights', category: 'Traffic', state: 'General' },
    { title: 'Stop and Frisk', category: 'Street', state: 'General' },
    { title: 'Home Search', category: 'Property', state: 'General' }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="text-gray-600 mb-4">
          Your rights protection toolkit is ready. Stay informed and stay safe.
        </p>
        
        {!user?.subscriptionStatus && (
          <div className="bg-accent/10 border border-accent/20 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} className="text-accent" />
              <span className="font-semibold text-sm">Upgrade to Premium</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Get state-specific guides, enhanced recording, and cloud storage
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSubscribe}
              className="text-accent border-accent hover:bg-accent/10"
            >
              Learn More
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <CardDisplay
              key={index}
              variant="interactive"
              onClick={action.action}
              className="cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-md ${action.color} text-white`}>
                  <action.icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </CardDisplay>
          ))}
        </div>
      </div>

      {/* Recent Guides */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Recent Guides</h3>
          <button
            onClick={() => onNavigate('guides')}
            className="text-primary text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {recentGuides.map((guide, index) => (
            <CardDisplay key={index} variant="interactive" className="cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{guide.title}</h4>
                  <p className="text-sm text-gray-600">{guide.category} • {guide.state}</p>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </CardDisplay>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Status */}
      {user?.emergencyContacts?.length > 0 && (
        <div className="card bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Emergency Contacts Ready</h3>
          <p className="text-sm text-green-700">
            {user.emergencyContacts.length} contact{user.emergencyContacts.length !== 1 ? 's' : ''} will be notified during emergencies
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
import React, { useState } from 'react'
import { Search, Filter, ArrowLeft, MapPin, Star, Lock } from 'lucide-react'
import CardDisplay from './CardDisplay'
import Button from './Button'
import ScriptViewer from './ScriptViewer'

const LegalGuides = ({ user, onNavigate, onSubscribe }) => {
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showScripts, setShowScripts] = useState(false)

  const categories = [
    { id: 'all', name: 'All Guides' },
    { id: 'traffic', name: 'Traffic Stops' },
    { id: 'street', name: 'Street Encounters' },
    { id: 'property', name: 'Property Rights' },
    { id: 'arrest', name: 'Arrest Procedures' }
  ]

  const guides = [
    {
      id: 1,
      title: 'Traffic Stop Rights',
      category: 'traffic',
      state: 'General',
      isPremium: false,
      summary: 'Essential rights during traffic stops',
      content: `
# Traffic Stop Rights

## Your Key Rights
- **Right to remain silent** - You are not required to answer questions beyond providing license, registration, and insurance
- **Right to refuse searches** - Police need your consent or a warrant to search your vehicle
- **Right to leave** - You can ask "Am I free to go?" to determine if you're being detained

## What to Do
1. **Pull over safely** - Use turn signal, pull to the right, turn off engine
2. **Stay calm** - Keep hands visible on steering wheel
3. **Be polite but firm** - "I exercise my right to remain silent"
4. **Don't consent to searches** - "I do not consent to any searches"

## What NOT to Do
- Don't argue or resist
- Don't reach for documents until asked
- Don't volunteer information
- Don't consent to vehicle searches

## Important Notes
- Police can order you out of the vehicle
- They can pat you down if they suspect weapons
- Record the interaction if possible
      `
    },
    {
      id: 2,
      title: 'Stop and Frisk Laws',
      category: 'street',
      state: 'General',
      isPremium: false,
      summary: 'Understanding pedestrian stops',
      content: `
# Stop and Frisk Laws

## Your Rights
- **Ask if you're free to leave** - "Officer, am I free to go?"
- **Right to remain silent** - You don't have to answer questions
- **Right to refuse consent** - "I do not consent to any search"

## Legal Requirements for Police
Police can only stop you if they have **reasonable suspicion** that you're involved in criminal activity.

## What You Can Do
1. Stay calm and don't run
2. Keep your hands visible
3. Ask "Am I free to go?"
4. If not free to leave, ask "What crime do you suspect me of?"
5. Say "I exercise my right to remain silent"

## Frisk/Pat-Down Rules
- Police can only frisk for weapons if they reasonably suspect you're armed
- Must be limited to outer clothing
- Cannot search for drugs during frisk unless weapons are found
      `
    },
    {
      id: 3,
      title: 'Home Search Protections',
      category: 'property',
      state: 'General',
      isPremium: true,
      summary: 'Fourth Amendment protections for your home',
      content: `
# Home Search Protections

## Fourth Amendment Protection
Your home has the strongest protection under the Constitution. Police generally need a warrant to enter.

## When Police Can Enter
- **With a valid warrant**
- **Hot pursuit** of a fleeing suspect
- **Immediate danger** to life or safety
- **Preventing destruction of evidence**
- **Your consent** (you can revoke this)

## What to Say
- "I do not consent to your entry"
- "Do you have a warrant?"
- "I'm exercising my constitutional rights"

## What to Do
1. Don't open the door fully
2. Step outside to talk (closes door behind you)
3. Ask to see the warrant
4. Don't physically resist
5. Say clearly you don't consent

## Important Notes
- Anyone living there can consent to entry
- Police can't enter based on anonymous tips alone
- Emergency aid exception requires real emergency
      `
    },
    {
      id: 4,
      title: 'Arrest Procedures & Rights',
      category: 'arrest',
      state: 'General',
      isPremium: true,
      summary: 'Know your rights when being arrested',
      content: `
# Arrest Procedures & Rights

## Miranda Rights
Police must read you your rights when:
- You are in custody AND
- They want to interrogate you

## Your Rights During Arrest
- **Right to remain silent**
- **Right to an attorney**
- **Right to have attorney present during questioning**
- **Right to have attorney appointed if you can't afford one**

## What to Do
1. Don't resist physically
2. Say "I want to exercise my right to remain silent"
3. Say "I want to speak to a lawyer"
4. Don't answer questions without lawyer present
5. Remember details for later

## What NOT to Do
- Don't fight or flee
- Don't lie to police
- Don't talk about the case
- Don't sign anything without lawyer

## After Arrest
- You have right to phone call
- Ask for lawyer immediately
- Don't discuss case with cellmates
- Bond/bail may be available
      `
    }
  ]

  const scripts = {
    traffic: {
      en: [
        "Officer, I exercise my right to remain silent.",
        "I do not consent to any searches of my vehicle.",
        "Am I free to go?",
        "I would like to speak to my attorney."
      ],
      es: [
        "Oficial, ejercito mi derecho a permanecer en silencio.",
        "No consiento a ningún registro de mi vehículo.",
        "¿Soy libre de irme?",
        "Me gustaría hablar con mi abogado."
      ]
    },
    street: {
      en: [
        "Am I free to go?",
        "I exercise my right to remain silent.",
        "I do not consent to any search.",
        "What crime do you suspect me of?"
      ],
      es: [
        "¿Soy libre de irme?",
        "Ejercito mi derecho a permanecer en silencio.",
        "No consiento a ningún registro.",
        "¿De qué crimen me sospecha?"
      ]
    }
  }

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (selectedGuide) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 border-b bg-primary text-white">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => setSelectedGuide(null)}>
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold">{selectedGuide.title}</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin size={14} />
                <span>{selectedGuide.state}</span>
                {selectedGuide.isPremium && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>Premium</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showScripts ? "secondary" : "primary"}
              size="sm"
              onClick={() => setShowScripts(false)}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              Guide
            </Button>
            <Button
              variant={!showScripts ? "secondary" : "primary"}
              size="sm"
              onClick={() => setShowScripts(true)}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              Scripts
            </Button>
          </div>
        </div>

        <div className="p-4">
          {showScripts ? (
            <ScriptViewer
              scripts={scripts[selectedGuide.category] || { en: ["Scripts coming soon..."] }}
              language={user?.preferredLanguage || 'en'}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              {selectedGuide.isPremium && !user?.subscriptionStatus ? (
                <div className="text-center py-12">
                  <Lock size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold mb-2">Premium Content</h3>
                  <p className="text-gray-600 mb-6">
                    Upgrade to access detailed state-specific guides and advanced content.
                  </p>
                  <Button onClick={onSubscribe} className="btn-primary">
                    Upgrade to Premium - $2.99/mo
                  </Button>
                </div>
              ) : (
                <div className="whitespace-pre-line leading-relaxed">
                  {selectedGuide.content}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Legal Guides</h1>
        <p className="text-gray-600">
          Concise, actionable information about your rights
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-3">
        {filteredGuides.map(guide => (
          <CardDisplay
            key={guide.id}
            variant="interactive"
            onClick={() => setSelectedGuide(guide)}
            className="cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{guide.title}</h3>
                  {guide.isPremium && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded text-xs text-accent">
                      <Star size={12} />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{guide.summary}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>{guide.state}</span>
                  <span>•</span>
                  <span className="capitalize">{guide.category}</span>
                </div>
              </div>
              <div className="ml-4">
                {guide.isPremium && !user?.subscriptionStatus ? (
                  <Lock size={16} className="text-gray-400" />
                ) : (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          </CardDisplay>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No guides found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default LegalGuides
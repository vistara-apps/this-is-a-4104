import { createClient } from '@supabase/supabase-js'

// These would be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema helper functions
export const createTables = async () => {
  // This would typically be done via Supabase migrations
  // Including here for reference to the data model
  
  const userTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      preferred_language TEXT DEFAULT 'en',
      emergency_contacts JSONB DEFAULT '[]',
      subscription_status TEXT DEFAULT 'free',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  const legalGuideTableSQL = `
    CREATE TABLE IF NOT EXISTS legal_guides (
      guide_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      state TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      category TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  const scriptTableSQL = `
    CREATE TABLE IF NOT EXISTS scripts (
      script_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scenario TEXT NOT NULL,
      language TEXT NOT NULL,
      script_text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  const recordingTableSQL = `
    CREATE TABLE IF NOT EXISTS recordings (
      recording_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id),
      file_path TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      duration INTEGER,
      type TEXT NOT NULL
    );
  `
  
  const generatedCardTableSQL = `
    CREATE TABLE IF NOT EXISTS generated_cards (
      card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id),
      content JSONB NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      shareable_url TEXT
    );
  `
  
  // Note: In production, these would be created via Supabase migrations
  console.log('Database schema defined. Use Supabase migrations to create tables.')
}

// User management functions
export const signUp = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Legal guides functions
export const getLegalGuides = async (filters = {}) => {
  let query = supabase.from('legal_guides').select('*')
  
  if (filters.state) {
    query = query.eq('state', filters.state)
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters.language) {
    query = query.eq('language', filters.language)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const createLegalGuide = async (guide) => {
  const { data, error } = await supabase
    .from('legal_guides')
    .insert([guide])
    .select()
  
  if (error) throw error
  return data[0]
}

// Scripts functions
export const getScripts = async (scenario, language = 'en') => {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('scenario', scenario)
    .eq('language', language)
  
  if (error) throw error
  return data
}

export const createScript = async (script) => {
  const { data, error } = await supabase
    .from('scripts')
    .insert([script])
    .select()
  
  if (error) throw error
  return data[0]
}

// Recording functions
export const saveRecording = async (userId, filePath, duration, type) => {
  const { data, error } = await supabase
    .from('recordings')
    .insert([{
      user_id: userId,
      file_path: filePath,
      duration,
      type
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const getUserRecordings = async (userId) => {
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
  
  if (error) throw error
  return data
}

// Generated cards functions
export const createGeneratedCard = async (userId, content) => {
  const cardId = crypto.randomUUID()
  const shareableUrl = `${window.location.origin}/card/${cardId}`
  
  const { data, error } = await supabase
    .from('generated_cards')
    .insert([{
      card_id: cardId,
      user_id: userId,
      content,
      shareable_url: shareableUrl
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const getGeneratedCard = async (cardId) => {
  const { data, error } = await supabase
    .from('generated_cards')
    .select('*')
    .eq('card_id', cardId)
    .single()
  
  if (error) throw error
  return data
}

// File upload functions
export const uploadRecording = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, file)
  
  if (error) throw error
  return data.path
}

export const getRecordingUrl = async (filePath) => {
  const { data } = supabase.storage
    .from('recordings')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

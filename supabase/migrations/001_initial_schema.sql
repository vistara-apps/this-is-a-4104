-- KnowYourRights.ai Database Schema
-- This migration creates all the necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  emergency_contacts JSONB DEFAULT '[]',
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal guides table
CREATE TABLE IF NOT EXISTS public.legal_guides (
  guide_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  category TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scripts table for multilingual phrases
CREATE TABLE IF NOT EXISTS public.scripts (
  script_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario TEXT NOT NULL,
  language TEXT NOT NULL,
  script_text JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
  recording_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER,
  type TEXT NOT NULL CHECK (type IN ('audio', 'video')),
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated cards table
CREATE TABLE IF NOT EXISTS public.generated_cards (
  card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shareable_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions/activity log
CREATE TABLE IF NOT EXISTS public.user_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  device_info JSONB,
  location JSONB
);

-- Usage statistics table
CREATE TABLE IF NOT EXISTS public.usage_stats (
  stat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  feature_used TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_legal_guides_category ON public.legal_guides(category);
CREATE INDEX IF NOT EXISTS idx_legal_guides_state ON public.legal_guides(state);
CREATE INDEX IF NOT EXISTS idx_legal_guides_language ON public.legal_guides(language);
CREATE INDEX IF NOT EXISTS idx_scripts_scenario ON public.scripts(scenario);
CREATE INDEX IF NOT EXISTS idx_scripts_language ON public.scripts(language);
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_timestamp ON public.recordings(timestamp);
CREATE INDEX IF NOT EXISTS idx_generated_cards_user_id ON public.generated_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_feature ON public.usage_stats(feature_used);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_guides_updated_at BEFORE UPDATE ON public.legal_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON public.scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = user_id);

-- Recordings policies
CREATE POLICY "Users can view own recordings" ON public.recordings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON public.recordings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON public.recordings
    FOR DELETE USING (auth.uid() = user_id);

-- Generated cards policies
CREATE POLICY "Users can view own cards" ON public.generated_cards
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own cards" ON public.generated_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.generated_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.generated_cards
    FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage stats policies
CREATE POLICY "Users can view own stats" ON public.usage_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.usage_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Legal guides and scripts are publicly readable
CREATE POLICY "Legal guides are publicly readable" ON public.legal_guides
    FOR SELECT USING (true);

CREATE POLICY "Scripts are publicly readable" ON public.scripts
    FOR SELECT USING (true);

-- Insert some initial data
INSERT INTO public.legal_guides (state, title, content, language, category, is_premium) VALUES
('General', 'Traffic Stop Rights', '# Traffic Stop Rights

## Your Key Rights
- **Right to remain silent** - You are not required to answer questions beyond providing license, registration, and insurance
- **Right to refuse searches** - Police need your consent or a warrant to search your vehicle
- **Right to leave** - You can ask "Am I free to go?" to determine if you''re being detained

## What to Do
1. **Pull over safely** - Use turn signal, pull to the right, turn off engine
2. **Stay calm** - Keep hands visible on steering wheel
3. **Be polite but firm** - "I exercise my right to remain silent"
4. **Don''t consent to searches** - "I do not consent to any searches"

## What NOT to Do
- Don''t argue or resist
- Don''t reach for documents until asked
- Don''t volunteer information
- Don''t consent to vehicle searches

## Important Notes
- Police can order you out of the vehicle
- You must provide license, registration, and insurance when requested
- Remain calm and respectful throughout the encounter

**Disclaimer:** This is general information only. Consult with a qualified attorney for legal advice specific to your situation.', 'en', 'traffic', false),

('General', 'Street Encounter Rights', '# Street Encounter Rights

## Your Key Rights
- **Right to remain silent** - You don''t have to answer questions
- **Right to leave** - If not detained, you can walk away
- **Right to refuse searches** - Police need consent or probable cause

## What to Do
1. **Ask if you''re free to go** - "Am I being detained or am I free to go?"
2. **Stay calm** - Keep hands visible
3. **Don''t resist** - Even if you believe the stop is unlawful
4. **Remember details** - Mental notes for later

## What NOT to Do
- Don''t run or resist
- Don''t argue about your rights
- Don''t consent to searches
- Don''t provide false information

## Important Notes
- Police may pat you down for weapons if they have reasonable suspicion
- You have the right to ask why you''re being stopped
- Anything you say can be used against you

**Disclaimer:** This is general information only. Consult with a qualified attorney for legal advice specific to your situation.', 'en', 'street', false),

('General', 'Home Search Rights', '# Home Search Rights

## Your Key Rights
- **Right to refuse entry** - Police need a warrant, consent, or exigent circumstances
- **Right to see the warrant** - You can ask to see and read any warrant
- **Right to remain silent** - You don''t have to answer questions

## What to Do
1. **Ask to see the warrant** - Read it carefully
2. **Don''t consent to searches** - "I do not consent to any searches"
3. **Stay calm** - Don''t interfere with the search
4. **Observe and remember** - Take mental notes

## What NOT to Do
- Don''t physically resist
- Don''t consent to searches
- Don''t answer questions without an attorney
- Don''t sign anything

## Important Notes
- Police can enter without a warrant in emergency situations
- A warrant must be specific about what can be searched
- You have the right to have an attorney present

**Disclaimer:** This is general information only. Consult with a qualified attorney for legal advice specific to your situation.', 'en', 'property', false);

-- Insert initial scripts
INSERT INTO public.scripts (scenario, language, script_text) VALUES
('traffic_stop', 'en', '[
  {
    "phrase": "I exercise my right to remain silent.",
    "context": "When asked questions beyond identification",
    "pronunciation": null,
    "translation": null
  },
  {
    "phrase": "Am I free to go?",
    "context": "To determine if you are being detained",
    "pronunciation": null,
    "translation": null
  },
  {
    "phrase": "I do not consent to any searches.",
    "context": "When asked to search person or vehicle",
    "pronunciation": null,
    "translation": null
  },
  {
    "phrase": "I want to speak to my attorney.",
    "context": "If arrested or detained",
    "pronunciation": null,
    "translation": null
  },
  {
    "phrase": "I am not resisting arrest.",
    "context": "If being arrested",
    "pronunciation": null,
    "translation": null
  }
]'),

('traffic_stop', 'es', '[
  {
    "phrase": "Ejerzo mi derecho a permanecer en silencio.",
    "context": "Cuando te hagan preguntas más allá de la identificación",
    "pronunciation": "eh-HAIR-so mee deh-REH-cho ah pair-mah-neh-SAIR en see-LEN-see-oh",
    "translation": "I exercise my right to remain silent."
  },
  {
    "phrase": "¿Soy libre de irme?",
    "context": "Para determinar si estás siendo detenido",
    "pronunciation": "soy LEE-breh deh EER-meh",
    "translation": "Am I free to go?"
  },
  {
    "phrase": "No consiento a ningún registro.",
    "context": "Cuando pidan registrar persona o vehículo",
    "pronunciation": "no con-see-EN-to ah neen-GOON reh-HEES-tro",
    "translation": "I do not consent to any searches."
  },
  {
    "phrase": "Quiero hablar con mi abogado.",
    "context": "Si eres arrestado o detenido",
    "pronunciation": "kee-EH-ro ah-BLAR con mee ah-bo-GAH-do",
    "translation": "I want to speak to my attorney."
  },
  {
    "phrase": "No me estoy resistiendo al arresto.",
    "context": "Si estás siendo arrestado",
    "pronunciation": "no meh es-TOY reh-sees-tee-EN-do al ah-RRES-to",
    "translation": "I am not resisting arrest."
  }
]');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, preferred_language, emergency_contacts)
  VALUES (NEW.id, NEW.email, 'en', '[]');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);

-- Storage policies for recordings bucket
CREATE POLICY "Users can upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own recordings" ON storage.objects
  FOR DELETE USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

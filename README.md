# KnowYourRights.ai

> Your pocket guide to rights and smooth interactions.

A mobile-first web application providing concise, actionable legal rights information and support tools for individuals during police encounters.

## 🚀 Features

### Core Features
- **Know-Your-Rights Summaries**: One-page, mobile-optimized guides covering essential rights
- **Multilingual Scripts**: Pre-written 'what-to-say' scripts in multiple languages
- **One-Tap Recording & Alert**: Quick audio/video recording with emergency contact alerts
- **Auto-Generated Shareable Cards**: Digital cards with key rights and emergency info

### Premium Features
- State-specific legal guides
- Enhanced recording features with cloud storage
- Advanced multilingual scripts (10+ languages)
- Unlimited shareable cards
- Priority customer support

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-3.5 for content generation
- **Payments**: Stripe for subscriptions
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/this-is-a-4104.git
cd this-is-a-4104
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=KnowYourRights.ai
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migration:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
# in your Supabase SQL editor
```

### 4. Stripe Setup

1. Create a Stripe account and get your publishable key
2. Create a product and price for the premium subscription ($2.99/month)
3. Set up webhooks for subscription events (optional for development)

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AppHeader.jsx
│   ├── Dashboard.jsx
│   ├── LegalGuides.jsx
│   ├── EncounterSupport.jsx
│   ├── OnboardingFlow.jsx
│   └── SubscriptionModal.jsx
├── lib/                 # Core services
│   ├── supabase.js     # Database operations
│   ├── openai.js       # AI content generation
│   ├── stripe.js       # Payment processing
│   └── dataService.js  # Unified data layer
├── App.jsx             # Main app component
└── main.jsx           # App entry point

supabase/
└── migrations/         # Database schema
    └── 001_initial_schema.sql
```

## 🗄 Database Schema

The app uses the following main tables:

- **users**: User profiles and preferences
- **legal_guides**: Legal rights content by state/category
- **scripts**: Multilingual phrase collections
- **recordings**: User recording metadata
- **generated_cards**: Shareable rights cards
- **usage_stats**: Feature usage tracking

## 🔧 API Integrations

### Supabase
- **Authentication**: User signup/login
- **Database**: PostgreSQL with Row Level Security
- **Storage**: File uploads for recordings
- **Real-time**: Live updates (future feature)

### OpenAI
- **Content Generation**: Legal guides and scripts
- **Multilingual Support**: Translations and pronunciations
- **Personalization**: Location-specific content

### Stripe
- **Subscriptions**: Premium plan management
- **Payments**: Secure payment processing
- **Customer Portal**: Self-service billing

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔒 Security Features

- **Row Level Security**: Database access control
- **Authentication**: Supabase Auth with JWT
- **HTTPS Only**: Secure data transmission
- **Input Validation**: XSS and injection protection
- **Rate Limiting**: API abuse prevention

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach
- **Touch Friendly**: Large tap targets
- **Offline Support**: Service worker caching (future)
- **PWA Ready**: Installable web app
- **Performance**: Optimized loading and rendering

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📈 Analytics & Monitoring

- **Usage Tracking**: Feature usage statistics
- **Error Monitoring**: Sentry integration (future)
- **Performance**: Web Vitals tracking
- **User Feedback**: In-app feedback system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: Contact support for premium users
- **Community**: Join our Discord (coming soon)

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core features implementation
- ✅ Basic subscription system
- ✅ Mobile-responsive design

### Phase 2 (Next)
- [ ] Advanced state-specific content
- [ ] Offline mode support
- [ ] Enhanced emergency features
- [ ] Legal consultation network

### Phase 3 (Future)
- [ ] AI-powered legal advice
- [ ] Community features
- [ ] Integration with legal services
- [ ] Advanced analytics

## 🙏 Acknowledgments

- **Legal Experts**: For rights information validation
- **Open Source**: Built on amazing open source tools
- **Community**: Beta testers and early users
- **Design**: Inspired by accessibility-first principles

---

**Disclaimer**: This app provides general legal information only and does not constitute legal advice. Always consult with a qualified attorney for legal advice specific to your situation.

Built with ❤️ for civil rights and community safety.

# Smart Prompt Generator

A comprehensive visual prompt builder with AI-powered assistant generation, desktop audio recording, and meeting-driven development workflows.

## ✨ Key Features

### 🎨 **Visual Builder System**
- Drag-and-drop component library with 50+ pre-configured elements
- 14 component categories (Authentication, Navigation, Data Display, etc.)
- Feature templates for SaaS, E-commerce, and Social platforms
- Component relationships and dependency management

### 🤖 **AI-Powered Assistant Generation**
- Generate role-specific AI assistant prompts from meeting summaries
- Support for 6 assistant types: Manager, Frontend, Backend, Database, UI/UX, QA
- Contextual prompt creation using Gemini Pro 2.5
- Copy-paste ready prompts with regeneration capabilities

### 🎙️ **Advanced Audio Recording**
- Desktop audio capture (like Loom, audio-only)
- Real-time transcription with Google Gemini Pro 1.5
- Speaker identification and structured AI summaries
- Meeting-to-development workflow integration

### 🔐 **Secure Authentication**
- Native Supabase authentication with Google OAuth
- Complete user data isolation with Row Level Security
- Secure file storage with user-scoped access

### 💾 **Comprehensive Data Management**
- Complete project lifecycle management
- Component library with search and filtering
- Audio transcript storage with AI processing
- Version-controlled assistant prompt generation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Query + Nuqs (URL state)
- **Drag & Drop**: @dnd-kit/core
- **Audio**: Web Audio API + MediaRecorder API

### Backend & Database
- **Authentication**: Native Supabase Auth (migrated from NextAuth)
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Storage**: Supabase Storage for audio files
- **API**: Next Safe Actions (type-safe server actions)

### AI & Processing
- **AI Models**: Google Gemini Pro 1.5 & Pro 2.5
- **Audio Processing**: Real-time transcription and summarization
- **Prompt Generation**: Contextual AI assistant creation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Supabase account (optional for JWT-only mode)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-prompt-generator.git
   cd smart-prompt-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your environment variables:
   ```env
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Google Gemini AI
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

   # Google OAuth (configured in Supabase Dashboard)
   # No additional environment variables needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Setup

This application requires a Supabase database for full functionality. The database includes:

- **Authentication System**: Users, sessions, and OAuth management
- **Project Management**: Projects, components, and collaboration
- **Audio System**: Recordings, transcripts, and AI summaries
- **Component Library**: 50+ components across 14 categories
- **AI Assistant System**: Generated prompts with versioning

### Quick Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration scripts in `/database/migrations/` 
3. Execute seed data in `/database/seeds/` for the component library
4. Configure Google OAuth in Supabase Dashboard

For detailed setup, see `/database/README.md`.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main dashboard
│   ├── projects/          # Project management
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── audio/            # Audio recording & playback
│   ├── visual-builder/   # Drag-and-drop builder
│   └── dashboard/        # Dashboard components
├── lib/                  # Core utilities
│   ├── services/         # API services
│   ├── audio/           # Audio processing
│   └── supabase/        # Database client
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── database/            # Database schema & migrations
│   ├── migrations/      # SQL migration files
│   ├── seeds/          # Component library data
│   └── types/          # Database type definitions
├── docs/               # Documentation
│   ├── initial-prompts/ # AI assistant prompts
│   ├── session-prompts/ # Session guidelines
│   └── implementation/ # Technical guides
└── agent-sessions/     # AI assistant status tracking
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## 📊 Current Status

- **🏗️ Infrastructure**: 95% Complete (Database extensions done)
- **🔐 Authentication**: ✅ Complete (Native Supabase Auth)
- **🎙️ Audio Recording**: ✅ Complete (Desktop capture + AI transcription)
- **🤖 AI Integration**: ✅ Complete (Gemini Pro transcription + prompt generation)
- **🎨 Component Library**: ✅ Ready (50+ components, seed data prepared)
- **📱 Visual Builder**: 🚧 In Progress (Drag-and-drop canvas next)

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Authentication system
- [x] Audio recording and transcription
- [x] AI-powered assistant prompt generation
- [x] Database schema and security

### Phase 2: Visual Builder 🚧
- [ ] Drag-and-drop canvas implementation
- [ ] Component library integration
- [ ] Real-time collaboration features

### Phase 3: Advanced Features 📋
- [ ] Component relationship validation
- [ ] Advanced audio processing
- [ ] Multi-user project collaboration
- [ ] Export and deployment features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
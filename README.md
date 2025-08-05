# Smart Prompt Generator

A visual prompt builder with AI-powered generation and desktop audio recording capabilities.

## Features

- 🎨 **Visual Builder** - Drag-and-drop interface for creating prompts
- 🔐 **Authentication** - Google OAuth login with Auth.js v5
- 🎙️ **Audio Recording** - Desktop audio capture capabilities
- 🤖 **AI Integration** - Google Gemini Pro for prompt generation
- 💾 **Cloud Storage** - Supabase for data persistence

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Authentication**: Auth.js v5 (NextAuth)
- **Database**: Supabase
- **AI**: Google Gemini Pro 1.5
- **State**: React Query + Nuqs

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
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Supabase (optional for JWT-only mode)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Google Gemini
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The app currently uses JWT sessions for authentication, so a database is not required for basic functionality. 

For full features (saving projects, component library), see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Shadcn/UI components
│   ├── builder/     # Visual builder components
│   └── audio/       # Audio recording components
├── lib/             # Utilities and configurations
├── hooks/           # Custom React hooks
├── services/        # API services
└── types/           # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
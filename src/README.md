# Source Code Structure

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (marketing)/       # Public marketing pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── auth/             # Authentication pages
│   └── api/              # API routes
├── components/           # React components
│   ├── ui/              # Shadcn/UI components
│   ├── layout/          # Layout components (header, sidebar, etc.)
│   ├── builder/         # Visual builder components
│   └── audio/           # Audio recording components
├── lib/                 # Utility functions and configurations
│   ├── auth/           # Authentication configuration
│   ├── supabase/       # Supabase client setup
│   ├── actions/        # Server actions
│   ├── validations/    # Zod schemas
│   └── constants/      # App constants
├── hooks/              # Custom React hooks
├── services/           # External service integrations
└── types/              # TypeScript type definitions
```

## Key Files

- `app/layout.tsx` - Root layout with providers
- `middleware.ts` - Authentication middleware
- `lib/utils.ts` - Utility functions
- `types/database.ts` - Supabase database types
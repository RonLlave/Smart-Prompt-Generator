# 🧠 Refactored AI Manager Prompts - Visual Prompt Builder

## 🎯 **Manager Assistant Analysis Prompt**

```
VISUAL PROMPT BUILDER + AUDIO RECORDING PLATFORM ANALYSIS

PROJECT OVERVIEW:
Build a comprehensive Visual Prompt Builder web application that allows users to:
1. Import meeting summaries to initialize projects
2. Drag and drop web application components visually
3. Record desktop audio during meetings (with audioblob storage)
4. Generate specialized AI prompts for different development assistants
5. Manage projects with collaboration features

TECHNICAL STACK ANALYSIS:
- Next.js 14+ (TypeScript, App Router) - Fullstack framework
- Auth.js v5 (Google OAuth) - Authentication system
- Supabase (Database + Storage) - Backend services
- Shadcn/UI (Component library) - UI framework
- React Hook Form + Zod (Form handling) - Form management
- Next Safe Action (Server actions) - Type-safe server functions
- Nuqs (URL state management) - Query state management

COMPONENT ARCHITECTURE DETECTED:
- Authentication system (Google OAuth with Auth.js v5)
- Visual drag-and-drop canvas with real-time positioning
- Desktop audio recording with blob processing
- Real-time collaboration features
- AI prompt generation engine (Google Gemini Pro 1.5)
- Project management system with visual components
- File storage integration for audio files

COMPLEXITY ASSESSMENT: Advanced (Multi-modal interface, real-time features, AI integration, audio processing)

RECOMMENDED TASK SEGMENTATION:
1. Developer Assistant: Complete fullstack implementation (frontend + backend + Auth.js)
2. Database Assistant: Supabase schema, RLS policies, storage configuration
3. Audio Assistant: Specialized desktop audio capture, blob processing, transcription

DEPLOYMENT RESPONSIBILITY: User will handle deployment configuration independently

Proceeding with specialized prompt generation for each assistant...
```

---

## 👨‍💻 **Developer Assistant Prompt**

```
BUILD VISUAL PROMPT BUILDER - COMPLETE FULLSTACK NEXT.JS APPLICATION

MISSION: Develop the complete fullstack Visual Prompt Builder application with drag-and-drop interface, authentication, audio recording integration, and AI-powered prompt generation.

TECHNICAL STACK:
- Next.js 14+ with App Router (TypeScript)
- Auth.js v5 (Google OAuth)
- Shadcn/UI components
- React Hook Form + Zod validation
- Next Safe Action (type-safe server actions)
- Nuqs (URL state management)
- Supabase client (database + storage)
- Google Gemini Pro 1.5 API
- @dnd-kit/core (drag-and-drop)
- Web Audio API integration

===============================
AUTHENTICATION SYSTEM (Auth.js v5)
===============================

1. AUTH.JS CONFIGURATION
```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtected = nextUrl.pathname.startsWith('/dashboard') || 
                           nextUrl.pathname.startsWith('/projects')
      
      if (isOnProtected) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig

// auth.ts
import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
})
```

2. MIDDLEWARE SETUP
```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') ||
                          nextUrl.pathname.startsWith('/projects') ||
                          nextUrl.pathname.startsWith('/api/protected')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/api/protected') && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
```

===============================
FRONTEND IMPLEMENTATION
===============================

1. AUTHENTICATION PAGES
```typescript
// app/auth/signin/page.tsx
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Visual Prompt Builder</h2>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
        </div>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <Button type="submit" className="w-full">
            Continue with Google
          </Button>
        </form>
      </div>
    </div>
  )
}
```

2. DASHBOARD LAYOUT & COMPONENTS
```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { UserStats } from "@/components/dashboard/user-stats"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CreateProjectDialog />
      </div>
      
      <UserStats userId={session.user.id} />
      <ProjectGrid userId={session.user.id} />
    </div>
  )
}

// components/dashboard/project-grid.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string
  updated_at: string
  component_count: number
}

export function ProjectGrid({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading projects...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {project.component_count} components
              </span>
              <Button asChild>
                <Link href={`/projects/${project.id}`}>
                  Open Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

3. VISUAL CANVAS INTERFACE
```typescript
// app/projects/[id]/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { VisualBuilder } from "@/components/visual-builder/visual-builder"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  return <VisualBuilder projectId={params.id} userId={session.user.id} />
}

// components/visual-builder/visual-builder.tsx
"use client"
import { useState, useEffect } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { ComponentSidebar } from "./component-sidebar"
import { DesignCanvas } from "./design-canvas"
import { ConfigurationPanel } from "./configuration-panel"
import { AudioRecorder } from "./audio-recorder"
import { PromptGenerator } from "./prompt-generator"

export function VisualBuilder({ projectId, userId }: { projectId: string, userId: string }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [canvasComponents, setCanvasComponents] = useState([])
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [project, setProject] = useState(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.id === 'canvas-drop-area') {
      const componentType = active.id as string
      const newComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        position: { x: 100, y: 100 },
        configuration: {}
      }
      
      setCanvasComponents(prev => [...prev, newComponent])
      // Save to database via server action
    }
    
    setActiveId(null)
  }

  return (
    <div className="h-screen flex">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <ComponentSidebar />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            <DesignCanvas 
              components={canvasComponents}
              onComponentSelect={setSelectedComponent}
            />
            <ConfigurationPanel 
              selectedComponent={selectedComponent}
              projectId={projectId}
            />
          </div>
          
          <div className="border-t p-4">
            <div className="flex justify-between items-center">
              <AudioRecorder projectId={projectId} />
              <PromptGenerator 
                projectId={projectId}
                components={canvasComponents}
              />
            </div>
          </div>
        </div>
        
        <DragOverlay>
          {activeId ? <ComponentPreview id={activeId} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
```

4. DRAG & DROP COMPONENTS
```typescript
// components/visual-builder/component-sidebar.tsx
"use client"
import { useDraggable } from "@dnd-kit/core"

const COMPONENT_CATEGORIES = {
  authentication: [
    { id: 'email-login', name: 'Email/Password Login', icon: '📧' },
    { id: 'social-login', name: 'Social Login', icon: '🔗' },
    { id: 'rbac', name: 'Role-Based Access', icon: '🛡️' },
  ],
  frontend: [
    { id: 'navbar', name: 'Navigation Bar', icon: '🧭' },
    { id: 'dashboard', name: 'Dashboard Layout', icon: '🎛️' },
    { id: 'forms', name: 'Forms & Validation', icon: '📝' },
    { id: 'data-table', name: 'Data Tables', icon: '📊' },
  ],
  backend: [
    { id: 'rest-api', name: 'REST API', icon: '🌐' },
    { id: 'graphql', name: 'GraphQL API', icon: '⚡' },
    { id: 'websocket', name: 'WebSocket', icon: '🔌' },
  ],
  database: [
    { id: 'user-profiles', name: 'User Profiles', icon: '👤' },
    { id: 'crud', name: 'CRUD Operations', icon: '📝' },
    { id: 'search', name: 'Search & Filter', icon: '🔍' },
  ],
}

function DraggableComponent({ component }: { component: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center p-3 bg-white border rounded-lg cursor-grab hover:shadow-md transition-shadow"
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <span className="text-lg mr-3">{component.icon}</span>
      <span className="text-sm font-medium">{component.name}</span>
    </div>
  )
}

export function ComponentSidebar() {
  return (
    <div className="w-80 bg-gray-50 border-r overflow-y-auto">
      <div className="p-4">
        <h3 className="font-semibold mb-4">Component Library</h3>
        
        {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-2">
              {components.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

===============================
BACKEND IMPLEMENTATION
===============================

1. API ROUTES (App Router)
```typescript
// app/api/projects/route.ts
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClientComponentClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      updated_at,
      project_components (count)
    `)
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createClientComponentClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: session.user.id,
      name: body.name,
      description: body.description,
      meeting_summary: body.meetingSummary,
      frontend_framework: body.frontendFramework,
      backend_framework: body.backendFramework,
      database_type: body.databaseType,
      complexity_level: body.complexityLevel
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(project)
}

// app/api/projects/[id]/components/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createClientComponentClient()
  
  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (project?.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: component, error } = await supabase
    .from('project_components')
    .insert({
      project_id: params.id,
      component_type: body.type,
      component_name: body.name,
      display_name: body.displayName,
      position_x: body.position.x,
      position_y: body.position.y,
      configuration: body.configuration || {}
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(component)
}
```

2. SERVER ACTIONS (Next Safe Action)
```typescript
// actions/projects.ts
"use server"
import { action } from '@/lib/safe-action'
import { auth } from '@/auth'
import { z } from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  meetingSummary: z.string().optional(),
  frontendFramework: z.enum(['react', 'vue', 'angular']),
  backendFramework: z.enum(['nodejs', 'python', 'ruby']),
  databaseType: z.enum(['postgresql', 'mysql', 'mongodb']),
  complexityLevel: z.enum(['basic', 'intermediate', 'advanced'])
})

export const createProjectAction = action(
  createProjectSchema,
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: session.user.id,
        ...input
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, project: data }
  }
)

const updateCanvasSchema = z.object({
  projectId: z.string().uuid(),
  canvasData: z.any(),
  components: z.array(z.any())
})

export const updateCanvasAction = action(
  updateCanvasSchema,
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const supabase = createClientComponentClient()
    
    // Update canvas data
    const { error } = await supabase
      .from('projects')
      .update({ 
        canvas_data: input.canvasData,
        updated_at: new Date().toISOString()
      })
      .eq('id', input.projectId)
      .eq('user_id', session.user.id)

    if (error) throw error
    return { success: true }
  }
)
```

3. GOOGLE GEMINI INTEGRATION
```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro-1.5" })

  async generatePrompts(
    components: any[],
    projectConfig: any
  ): Promise<any> {
    const analysisPrompt = `
    VISUAL PROMPT BUILDER ANALYSIS - WEB APPLICATION DESIGN

    You are an expert AI Manager Assistant analyzing a visual web application design.

    PROJECT CONFIGURATION:
    - Name: ${projectConfig.name}
    - Frontend: ${projectConfig.frontendFramework}
    - Backend: ${projectConfig.backendFramework}
    - Database: ${projectConfig.databaseType}
    - Complexity: ${projectConfig.complexityLevel}
    - Meeting Summary: ${projectConfig.meetingSummary || 'None provided'}

    SELECTED COMPONENTS:
    ${components.map(c => `- ${c.display_name} (${c.component_type}): Position(${c.position_x}, ${c.position_y})`).join('\n')}

    COMPONENT RELATIONSHIPS:
    ${this.analyzeComponentConnections(components)}

    TASK: Generate specialized implementation prompts for these development roles:

    1. FULLSTACK_DEVELOPER_PROMPT:
       - Complete Next.js implementation (frontend + backend)
       - Component integration and data flow
       - API design and database operations
       - Authentication and security
       - 500-700 words, implementation-ready

    2. DATABASE_ENGINEER_PROMPT:
       - Schema optimization for selected components
       - Index strategies and query optimization
       - Data relationships and constraints
       - Performance considerations
       - 300-400 words, technical focus

    3. AUDIO_ENGINEER_PROMPT:
       - Desktop audio integration requirements
       - File processing and storage needs
       - Transcription and analysis features
       - Performance and security considerations
       - 300-400 words, audio-specific

    Return as JSON with keys: fullstack_prompt, database_prompt, audio_prompt
    Each prompt should be detailed, actionable, and specific to the component selection.
    `

    try {
      const result = await this.model.generateContent(analysisPrompt)
      const response = await result.response
      const text = response.text()
      
      const prompts = JSON.parse(text)
      
      return {
        fullstack_prompt: prompts.fullstack_prompt,
        database_prompt: prompts.database_prompt,
        audio_prompt: prompts.audio_prompt,
        generated_at: new Date().toISOString(),
        model_used: 'gemini-pro-1.5',
        input_tokens: this.estimateTokens(analysisPrompt),
        output_tokens: this.estimateTokens(text)
      }
      
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  async processMeetingSummary(summary: string): Promise<any> {
    const prompt = `
    Extract web development requirements from this meeting summary:
    
    "${summary}"
    
    Return JSON with:
    {
      "suggested_components": ["component-id-1", "component-id-2"],
      "technical_requirements": {
        "frontend_framework": "react|vue|angular",
        "backend_framework": "nodejs|python|ruby",
        "database_type": "postgresql|mysql|mongodb",
        "complexity_level": "basic|intermediate|advanced"
      },
      "key_features": ["feature1", "feature2"],
      "integrations_needed": ["auth", "payment", "email"],
      "project_summary": "Brief project description based on meeting"
    }
    `

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return JSON.parse(response.text())
  }

  private analyzeComponentConnections(components: any[]): string {
    return components
      .filter(c => c.connected_to && c.connected_to.length > 0)
      .map(c => `${c.display_name} connects to: ${c.connected_to.join(', ')}`)
      .join('\n') || 'No explicit connections defined'
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }
}

// app/api/prompts/generate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { GeminiService } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await request.json()
  
  // Fetch project and components
  const supabase = createClientComponentClient()
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_components(*)
    `)
    .eq('id', projectId)
    .eq('user_id', session.user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  try {
    const geminiService = new GeminiService()
    const prompts = await geminiService.generatePrompts(
      project.project_components,
      project
    )

    // Save generation to database
    await supabase
      .from('prompt_generations')
      .insert({
        project_id: projectId,
        user_id: session.user.id,
        prompts: prompts,
        components_count: project.project_components.length,
        generation_model: 'gemini-pro-1.5',
        input_tokens: prompts.input_tokens,
        output_tokens: prompts.output_tokens
      })

    return NextResponse.json(prompts)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate prompts: ' + error.message }, 
      { status: 500 }
    )
  }
}
```

===============================
DESKTOP AUDIO RECORDING SYSTEM
===============================

1. DESKTOP AUDIO RECORDER CLASS
```typescript
// lib/audio/desktop-recorder.ts
export class DesktopAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private recordingStartTime: number = 0
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null

  async startRecording(): Promise<void> {
    try {
      // Request desktop audio capture (like Loom but audio-only)
      this.audioStream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      })

      // Set up audio analysis for real-time visualization
      this.setupAudioAnalysis(this.audioStream)

      // Create MediaRecorder with optimal settings
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000
      })

      // Event handlers
      this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
      this.mediaRecorder.onstop = this.handleRecordingStop.bind(this)
      this.mediaRecorder.onerror = this.handleRecordingError.bind(this)

      // Start recording with 1-second chunks
      this.mediaRecorder.start(1000)
      this.recordingStartTime = Date.now()
      
    } catch (error) {
      throw new Error(`Failed to start desktop audio recording: ${error.message}`)
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  private setupAudioAnalysis(stream: MediaStream): void {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    const source = this.audioContext.createMediaStreamSource(stream)
    
    source.connect(this.analyser)
    this.analyser.fftSize = 256
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0
    
    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length
    return average / 255 // Normalize to 0-1
  }

  getWaveformData(): number[] {
    if (!this.analyser || !this.dataArray) return []
    
    this.analyser.getByteFrequencyData(this.dataArray)
    return Array.from(this.dataArray).map(value => value / 255)
  }

  private handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.audioChunks.push(event.data)
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/webm' 
          })
          const duration = (Date.now() - this.recordingStartTime) / 1000
          
          resolve({
            blob: audioBlob,
            duration,
            size: audioBlob.size,
            mimeType: this.mediaRecorder?.mimeType || 'audio/webm',
            startTime: new Date(this.recordingStartTime),
            endTime: new Date()
          })

          this.cleanup()
        } catch (error) {
          reject(error)
        }
      }

      this.mediaRecorder.stop()
      this.audioStream?.getTracks().forEach(track => track.stop())
    })
  }

  private handleRecordingStop(): void {
    // Handled in stopRecording promise
  }

  private handleRecordingError(event: Event): void {
    console.error('Recording error:', event)
    this.cleanup()
  }

  private cleanup(): void {
    this.audioChunks = []
    this.mediaRecorder = null
    this.audioStream = null
    this.audioContext?.close()
    this.audioContext = null
    this.analyser = null
    this.dataArray = null
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  getRecordingDuration(): number {
    if (!this.recordingStartTime) return 0
    return (Date.now() - this.recordingStartTime) / 1000
  }
}

// Audio recording result interface
export interface AudioRecordingResult {
  blob: Blob
  duration: number
  size: number
  mimeType: string
  startTime: Date
  endTime: Date
}
```

2. AUDIO RECORDER REACT COMPONENT
```typescript
// components/audio/audio-recorder.tsx
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DesktopAudioRecorder, AudioRecordingResult } from "@/lib/audio/desktop-recorder"
import { uploadAudioAction } from "@/actions/audio"
import { toast } from "@/components/ui/use-toast"

interface AudioRecorderProps {
  projectId?: string
  onRecordingSaved?: (recording: any) => void
}

export function AudioRecorder({ projectId, onRecordingSaved }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  
  const recorderRef = useRef<DesktopAudioRecorder | null>(null)
  const animationRef = useRef<number>()
  const timerRef = useRef<NodeJS.Timeout>()

  const startRecording = async () => {
    try {
      const recorder = new DesktopAudioRecorder()
      await recorder.startRecording()
      
      recorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start real-time audio monitoring
      startAudioMonitoring()
      
      toast({
        title: "🎵 Recording Started",
        description: "Desktop audio is being captured (like Loom but audio-only)",
      })
      
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const stopRecording = async () => {
    if (!recorderRef.current) return

    try {
      const audioData = await recorderRef.current.stopRecording()
      setIsRecording(false)
      
      // Stop monitoring
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Upload to Supabase storage
      await saveAudioRecording(audioData)
      
    } catch (error) {
      toast({
        title: "Failed to Stop Recording",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const startAudioMonitoring = useCallback(() => {
    const updateAudioData = () => {
      if (!recorderRef.current || !isRecording) return
      
      const level = recorderRef.current.getAudioLevel()
      const waveform = recorderRef.current.getWaveformData()
      
      setAudioLevel(level)
      setWaveformData(waveform.slice(0, 50)) // Limit for performance
      
      animationRef.current = requestAnimationFrame(updateAudioData)
    }
    
    updateAudioData()
  }, [isRecording])

  const saveAudioRecording = async (audioData: AudioRecordingResult) => {
    setIsUploading(true)
    
    try {
      const filename = `meeting-recording-${Date.now()}.webm`
      
      const result = await uploadAudioAction({
        audioBlob: audioData.blob,
        filename,
        projectId,
        duration: audioData.duration,
        originalName: filename,
        startTime: audioData.startTime,
        endTime: audioData.endTime
      })
      
      if (result.success) {
        toast({
          title: "🎉 Recording Saved",
          description: "Audio has been saved to your project",
        })
        onRecordingSaved?.(result.recording)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎵 Desktop Audio Recorder
          {isRecording && <Badge variant="destructive" className="animate-pulse">● REC</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex justify-center">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              size="lg"
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700"
            >
              🎤 Start Desktop Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              size="lg"
              className="animate-pulse"
            >
              ⏹️ Stop Recording ({formatTime(recordingTime)})
            </Button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="space-y-3">
            <div className="text-center bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</div>
              <div className="text-sm text-red-500">Recording desktop audio...</div>
            </div>
            
            {/* Real-time Audio Level Meter */}
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <span>🔊 Audio Level</span>
                <span className="text-xs text-gray-500">
                  {Math.round(audioLevel * 100)}%
                </span>
              </div>
              <Progress 
                value={audioLevel * 100} 
                className="h-3"
                style={{
                  '--progress-background': audioLevel > 0.8 ? '#ef4444' : audioLevel > 0.5 ? '#f59e0b' : '#10b981'
                } as any}
              />
            </div>
            
            {/* Real-time Waveform Visualization */}
            <div className="space-y-2">
              <div className="text-sm font-medium">📊 Live Waveform</div>
              <div className="flex items-end gap-1 h-16 bg-gray-100 rounded p-2 overflow-hidden">
                {waveformData.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-sm transition-all duration-75"
                    style={{
                      height: `${Math.max(value * 100, 2)}%`,
                      width: '2px',
                      minWidth: '2px',
                      backgroundColor: value > 0.8 ? '#ef4444' : value > 0.5 ? '#f59e0b' : '#3b82f6'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 mb-2">📤 Uploading recording...</div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !isUploading && (
          <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded">
            💡 This will capture your desktop audio (like Loom.com but audio-only). 
            Perfect for recording meetings, presentations, or any desktop audio.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

3. AUDIO STORAGE SERVICE INTEGRATION
```typescript
// lib/audio/storage-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class AudioStorageService {
  private supabase = createClientComponentClient()

  async uploadAudioFile(
    audioBlob: Blob,
    userId: string,
    filename: string,
    metadata: {
      projectId?: string
      duration: number
      originalName: string
      startTime: Date
      endTime: Date
    }
  ): Promise<any> {
    try {
      // Generate unique storage path
      const filePath = `${userId}/${Date.now()}-${filename}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('audio-recordings')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get signed URL for secure access
      const { data: { publicUrl } } = this.supabase.storage
        .from('audio-recordings')
        .getPublicUrl(filePath)

      // Save recording metadata to database
      const { data: recordingData, error: dbError } = await this.supabase
        .from('audio_recordings')
        .insert({
          user_id: userId,
          project_id: metadata.projectId,
          filename,
          original_name: metadata.originalName,
          file_size: audioBlob.size,
          duration_seconds: Math.round(metadata.duration),
          mime_type: audioBlob.type,
          storage_path: filePath,
          storage_bucket: 'audio-recordings',
          public_url: publicUrl,
          recording_started_at: metadata.startTime.toISOString(),
          recording_ended_at: metadata.endTime.toISOString(),
          recording_source: 'desktop_audio',
          processing_status: 'uploaded'
        })
        .select()
        .single()

      if (dbError) throw dbError
      return recordingData

    } catch (error) {
      throw new Error(`Failed to save audio recording: ${error.message}`)
    }
  }

  async getAudioRecordings(userId: string, projectId?: string): Promise<any[]> {
    let query = this.supabase
      .from('audio_recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async deleteAudioRecording(recordingId: string, userId: string): Promise<void> {
    // Get recording info first
    const { data: recording } = await this.supabase
      .from('audio_recordings')
      .select('storage_path, user_id')
      .eq('id', recordingId)
      .eq('user_id', userId)
      .single()

    if (!recording) throw new Error('Recording not found')

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('audio-recordings')
      .remove([recording.storage_path])

    if (storageError) throw storageError

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('audio_recordings')
      .delete()
      .eq('id', recordingId)
      .eq('user_id', userId)

    if (dbError) throw dbError
  }
}
```

4. AUDIO PLAYER COMPONENT
```typescript
// components/audio/audio-player.tsx
"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AudioPlayerProps {
  recording: {
    id: string
    filename: string
    public_url: string
    duration_seconds: number
    file_size: number
    created_at: string
    original_name: string
  }
  onDelete?: (id: string) => void
}

export function AudioPlayer({ recording, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const handleEnded = () => setIsPlaying(false)
    const handleLoadStart = () => setIsLoading(true)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium text-sm flex items-center gap-2">
              🎵 {recording.original_name}
              <Badge variant="secondary" className="text-xs">
                Desktop Audio
              </Badge>
            </h4>
            <p className="text-xs text-gray-500">
              {formatFileSize(recording.file_size)} • {formatTime(recording.duration_seconds)} • {formatDate(recording.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <audio
          ref={audioRef}
          src={recording.public_url}
          preload="metadata"
        />
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlayback}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
          </Button>
          
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <span className="text-xs text-gray-500 min-w-[80px] font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs">🔊</span>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
          <span className="text-xs text-gray-500 min-w-[35px]">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2 border-t">
          <Button asChild variant="ghost" size="sm">
            <a href={recording.public_url} download={recording.original_name}>
              📥 Download
            </a>
          </Button>
          
          {onDelete && (
            <Button
              onClick={() => onDelete(recording.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              🗑️ Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

5. AUDIO SERVER ACTIONS
```typescript
// actions/audio.ts
"use server"
import { action } from '@/lib/safe-action'
import { auth } from '@/auth'
import { z } from 'zod'
import { AudioStorageService } from '@/lib/audio/storage-service'

const uploadAudioSchema = z.object({
  audioBlob: z.any(), // Blob type
  filename: z.string(),
  projectId: z.string().uuid().optional(),
  duration: z.number().positive(),
  originalName: z.string(),
  startTime: z.date(),
  endTime: z.date()
})

export const uploadAudioAction = action(
  uploadAudioSchema,
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const audioService = new AudioStorageService()
    
    try {
      const recording = await audioService.uploadAudioFile(
        input.audioBlob,
        session.user.id,
        input.filename,
        {
          projectId: input.projectId,
          duration: input.duration,
          originalName: input.originalName,
          startTime: input.startTime,
          endTime: input.endTime
        }
      )

      return { success: true, recording }
    } catch (error) {
      throw new Error(`Failed to upload audio: ${error.message}`)
    }
  }
)

export const deleteAudioAction = action(
  z.object({
    recordingId: z.string().uuid()
  }),
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const audioService = new AudioStorageService()
    
    try {
      await audioService.deleteAudioRecording(input.recordingId, session.user.id)
      return { success: true }
    } catch (error) {
      throw new Error(`Failed to delete audio: ${error.message}`)
    }
  }
)
```

6. INTEGRATION INTO VISUAL BUILDER
Update the visual-builder.tsx component to include the AudioRecorder:

```typescript
// In components/visual-builder/visual-builder.tsx - add to the bottom section
<div className="border-t p-4">
  <div className="flex justify-between items-center">
    <AudioRecorder 
      projectId={projectId} 
      onRecordingSaved={(recording) => {
        toast({
          title: "Audio Saved",
          description: `Recording saved: ${recording.filename}`
        })
        // Optionally refresh audio recordings list
      }}
    />
    <PromptGenerator 
      projectId={projectId}
      components={canvasComponents}
    />
  </div>
</div>
```

===============================
PERFORMANCE & SECURITY
===============================

1. PERFORMANCE OPTIMIZATIONS
- React.memo for expensive components
- useMemo for complex calculations
- Virtual scrolling for large component lists
- Debounced auto-save (500ms delay)
- Code splitting with dynamic imports
- Image optimization for component icons
- Audio compression before upload
- Efficient waveform rendering with requestAnimationFrame
- Progressive audio loading for playback

2. SECURITY MEASURES
- Auth.js session validation on all protected routes
- Zod schema validation for all inputs
- CSRF protection built into Auth.js
- File upload size limits (100MB for audio files)
- XSS protection with proper sanitization
- API rate limiting for AI endpoints
- Secure audio file storage with signed URLs
- Audio file type validation (webm, wav, mp3, m4a only)

3. ERROR HANDLING
- Global error boundary component
- Toast notifications for user feedback
- Structured error logging
- Graceful fallbacks for failed operations
- Retry mechanisms for network requests
- Browser compatibility checks for audio recording
- Permission denied handling for screen/audio capture

4. BROWSER COMPATIBILITY
- Chrome/Edge: Full desktop audio capture support
- Firefox: Good support with MediaRecorder API
- Safari: Limited support, requires user gestures
- Mobile: Limited desktop capture (as expected)
- Fallback UI for unsupported browsers

ENVIRONMENT VARIABLES REQUIRED:
```bash
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

Build a complete, production-ready fullstack application with desktop audio recording capabilities (like Loom.com but audio-only) that revolutionizes prompt engineering through visual design, making AI-assisted development accessible to both technical and non-technical users.
```

---

## 💾 **Database Assistant Prompt**

```
SETUP SUPABASE DATABASE - VISUAL PROMPT BUILDER SCHEMA

MISSION: Configure complete Supabase database with optimized schema, security policies, and storage for the Visual Prompt Builder application.

DATABASE REQUIREMENTS:
- PostgreSQL with Supabase extensions
- Row Level Security (RLS) for multi-tenancy
- Storage buckets for audio files
- Optimized indexes for performance
- Data integrity with foreign keys
- Auth.js v5 compatibility

SCHEMA IMPLEMENTATION:

1. CORE TABLES SETUP
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Auth.js v5 integration)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true
);

-- Auth.js required tables
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. APPLICATION TABLES
```sql
-- Projects (main visual builder projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_summary TEXT,
  project_type VARCHAR(100) DEFAULT 'web_app',
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Technical configuration
  frontend_framework VARCHAR(100) DEFAULT 'react',
  backend_framework VARCHAR(100) DEFAULT 'nodejs',
  database_type VARCHAR(100) DEFAULT 'postgresql',
  security_level VARCHAR(50) DEFAULT 'standard',
  complexity_level VARCHAR(50) DEFAULT 'intermediate',
  performance_targets JSONB DEFAULT '{}',
  
  -- Visual design data
  canvas_data JSONB DEFAULT '{}',
  process_flow JSONB DEFAULT '{}',
  
  -- AI generation data
  generated_prompts JSONB DEFAULT '{}',
  prompt_generation_status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual dragged components
CREATE TABLE project_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  component_type VARCHAR(100) NOT NULL,
  component_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  
  -- Visual positioning
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 150,
  height INTEGER DEFAULT 80,
  
  -- Component data
  configuration JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '[]',
  connected_to JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio recordings storage
CREATE TABLE audio_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- File metadata
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size BIGINT NOT NULL,
  duration_seconds INTEGER,
  mime_type VARCHAR(100) DEFAULT 'audio/webm',
  
  -- Storage data
  storage_path TEXT NOT NULL,
  storage_bucket VARCHAR(100) DEFAULT 'audio-recordings',
  public_url TEXT,
  
  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'uploaded',
  transcription_text TEXT,
  transcription_summary TEXT,
  transcription_confidence DECIMAL(3,2),
  
  -- Recording metadata
  recording_started_at TIMESTAMP WITH TIME ZONE,
  recording_ended_at TIMESTAMP WITH TIME ZONE,
  recording_source VARCHAR(100) DEFAULT 'desktop_audio',
  
  -- Access control
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI prompt generation history
CREATE TABLE prompt_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Generation request data
  components_count INTEGER NOT NULL,
  complexity_score INTEGER DEFAULT 1,
  generation_model VARCHAR(100) DEFAULT 'gemini-pro-1.5',
  
  -- Generated prompts (JSON structure)
  prompts JSONB NOT NULL DEFAULT '{}',
  manager_analysis TEXT,
  
  -- Token usage and costs
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(8,4) DEFAULT 0.0000,
  
  -- Generation metadata
  generation_time_ms INTEGER,
  generation_status VARCHAR(50) DEFAULT 'completed',
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. PERFORMANCE INDEXES
```sql
-- Essential indexes for query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

CREATE INDEX idx_components_project_id ON project_components(project_id);
CREATE INDEX idx_components_type ON project_components(component_type);

CREATE INDEX idx_audio_user_id ON audio_recordings(user_id);
CREATE INDEX idx_audio_project_id ON audio_recordings(project_id);
CREATE INDEX idx_audio_created_at ON audio_recordings(created_at DESC);
CREATE INDEX idx_audio_processing_status ON audio_recordings(processing_status);

CREATE INDEX idx_generations_project_id ON prompt_generations(project_id);
CREATE INDEX idx_generations_user_id ON prompt_generations(user_id);
CREATE INDEX idx_generations_created_at ON prompt_generations(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_audio_user_status ON audio_recordings(user_id, processing_status);
```

4. ROW LEVEL SECURITY POLICIES
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Project policies
CREATE POLICY "Users can manage own projects" ON projects 
  FOR ALL USING (auth.uid() = user_id);

-- Component policies
CREATE POLICY "Users can manage own project components" ON project_components 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_components.project_id 
      AND user_id = auth.uid()
    )
  );

-- Audio policies
CREATE POLICY "Users can manage own audio" ON audio_recordings 
  FOR ALL USING (auth.uid() = user_id);

-- Prompt generation policies
CREATE POLICY "Users can view own prompt generations" ON prompt_generations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create prompt generations" ON prompt_generations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

5. STORAGE BUCKETS SETUP
```sql
-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'audio-recordings', 
  'audio-recordings', 
  false, 
  104857600, -- 100MB limit
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a']
);

-- Storage policies for audio files
CREATE POLICY "Users can upload own audio files" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own audio files" ON storage.objects 
  FOR SELECT USING (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own audio files" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

6. DATABASE FUNCTIONS & TRIGGERS
```sql
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at 
  BEFORE UPDATE ON project_components 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project complexity score
CREATE OR REPLACE FUNCTION calculate_project_complexity(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  component_count INTEGER;
  connection_count INTEGER;
  complexity_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO component_count 
  FROM project_components 
  WHERE project_id = project_uuid;
  
  SELECT SUM(jsonb_array_length(connected_to)) INTO connection_count 
  FROM project_components 
  WHERE project_id = project_uuid 
  AND jsonb_array_length(connected_to) > 0;
  
  complexity_score := component_count + (COALESCE(connection_count, 0) * 2);
  
  RETURN complexity_score;
END;
$$ LANGUAGE plpgsql;
```

PERFORMANCE OPTIMIZATION:
- Proper indexing strategy for common queries
- JSONB columns for flexible data storage
- Connection pooling with Supabase
- Query optimization with explain plans

SECURITY MEASURES:
- Row Level Security for all user data
- Secure file storage with proper policies  
- Foreign key constraints for data integrity
- File type and size validation

MONITORING SETUP:
- Query performance monitoring
- Storage usage tracking
- Index usage analysis
- Connection pool monitoring

This schema provides a robust foundation for the Visual Prompt Builder with audio capabilities, optimized for performance and security.
```

---

## 🎵 **Audio Assistant Prompt**

```
IMPLEMENT DESKTOP AUDIO RECORDING - WEB AUDIO API + SUPABASE INTEGRATION

MISSION: Build comprehensive desktop audio recording system with blob processing, real-time visualization, storage integration, and optional transcription capabilities.

TECHNICAL REQUIREMENTS:
- Web Audio API for desktop capture
- MediaRecorder API for blob creation
- Real-time waveform visualization
- Supabase storage integration
- Audio compression and optimization
- Cross-browser compatibility

CORE AUDIO IMPLEMENTATION:

1. DESKTOP AUDIO CAPTURE CLASS
```typescript
// lib/audio/desktop-recorder.ts
export class DesktopAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private recordingStartTime: number = 0
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null

  async startRecording(): Promise<void> {
    try {
      // Request desktop audio capture
      this.audioStream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      })

      // Set up audio analysis for visualization
      this.setupAudioAnalysis(this.audioStream)

      // Create MediaRecorder with optimal settings
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000
      })

      // Event handlers
      this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
      this.mediaRecorder.onstop = this.handleRecordingStop.bind(this)
      this.mediaRecorder.onerror = this.handleRecordingError.bind(this)

      // Start recording
      this.mediaRecorder.start(1000) // 1 second chunks
      this.recordingStartTime = Date.now()
      
    } catch (error) {
      throw new Error(`Failed to start recording: ${error.message}`)
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    
    return '' // Browser will choose default
  }

  private setupAudioAnalysis(stream: MediaStream): void {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    const source = this.audioContext.createMediaStreamSource(stream)
    
    source.connect(this.analyser)
    this.analyser.fftSize = 256
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0
    
    this.analyser.getByteFrequencyData(this.dataArray)
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length
    return average / 255 // Normalize to 0-1
  }

  getWaveformData(): number[] {
    if (!this.analyser || !this.dataArray) return []
    
    this.analyser.getByteFrequencyData(this.dataArray)
    return Array.from(this.dataArray).map(value => value / 255)
  }

  private handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.audioChunks.push(event.data)
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/webm' 
          })
          const duration = (Date.now() - this.recordingStartTime) / 1000
          
          resolve({
            blob: audioBlob,
            duration,
            size: audioBlob.size,
            mimeType: this.mediaRecorder?.mimeType || 'audio/webm',
            startTime: new Date(this.recordingStartTime),
            endTime: new Date()
          })

          this.cleanup()
        } catch (error) {
          reject(error)
        }
      }

      this.mediaRecorder.stop()
      this.audioStream?.getTracks().forEach(track => track.stop())
    })
  }

  private handleRecordingStop(): void {
    // Handled in stopRecording promise
  }

  private handleRecordingError(event: Event): void {
    console.error('Recording error:', event)
    this.cleanup()
  }

  private cleanup(): void {
    this.audioChunks = []
    this.mediaRecorder = null
    this.audioStream = null
    this.audioContext?.close()
    this.audioContext = null
    this.analyser = null
    this.dataArray = null
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  getRecordingDuration(): number {
    if (!this.recordingStartTime) return 0
    return (Date.now() - this.recordingStartTime) / 1000
  }
}

// Types
export interface AudioRecordingResult {
  blob: Blob
  duration: number
  size: number
  mimeType: string
  startTime: Date
  endTime: Date
}
```

2. REACT AUDIO RECORDER COMPONENT
```typescript
// components/audio/audio-recorder.tsx
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DesktopAudioRecorder, AudioRecordingResult } from "@/lib/audio/desktop-recorder"
import { uploadAudioAction } from "@/actions/audio"
import { toast } from "@/components/ui/use-toast"

interface AudioRecorderProps {
  projectId?: string
  onRecordingSaved?: (recording: any) => void
}

export function AudioRecorder({ projectId, onRecordingSaved }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  
  const recorderRef = useRef<DesktopAudioRecorder | null>(null)
  const animationRef = useRef<number>()
  const timerRef = useRef<NodeJS.Timeout>()

  const startRecording = async () => {
    try {
      const recorder = new DesktopAudioRecorder()
      await recorder.startRecording()
      
      recorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start audio level monitoring
      startAudioMonitoring()
      
      toast({
        title: "Recording Started",
        description: "Desktop audio is being captured",
      })
      
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const stopRecording = async () => {
    if (!recorderRef.current) return

    try {
      const audioData = await recorderRef.current.stopRecording()
      setIsRecording(false)
      
      // Stop monitoring
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Upload to storage
      await saveAudioRecording(audioData)
      
    } catch (error) {
      toast({
        title: "Failed to Stop Recording",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const startAudioMonitoring = useCallback(() => {
    const updateAudioData = () => {
      if (!recorderRef.current || !isRecording) return
      
      const level = recorderRef.current.getAudioLevel()
      const waveform = recorderRef.current.getWaveformData()
      
      setAudioLevel(level)
      setWaveformData(waveform.slice(0, 50)) // Limit for performance
      
      animationRef.current = requestAnimationFrame(updateAudioData)
    }
    
    updateAudioData()
  }, [isRecording])

  const saveAudioRecording = async (audioData: AudioRecordingResult) => {
    setIsUploading(true)
    
    try {
      const filename = `recording-${Date.now()}.webm`
      
      const result = await uploadAudioAction({
        audioBlob: audioData.blob,
        filename,
        projectId,
        duration: audioData.duration,
        originalName: filename,
        startTime: audioData.startTime,
        endTime: audioData.endTime
      })
      
      if (result.success) {
        toast({
          title: "Recording Saved",
          description: "Audio has been saved successfully",
        })
        onRecordingSaved?.(result.recording)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎵 Audio Recorder
          {isRecording && <Badge variant="destructive">Recording</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex justify-center">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              size="lg"
              disabled={isUploading}
            >
              🎤 Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              size="lg"
            >
              ⏹️ Stop Recording
            </Button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
              <div className="text-sm text-gray-500">Recording time</div>
            </div>
            
            {/* Audio Level Meter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Audio Level</div>
              <Progress value={audioLevel * 100} className="h-2" />
            </div>
            
            {/* Waveform Visualization */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Waveform</div>
              <div className="flex items-end gap-1 h-16 bg-gray-100 rounded p-2">
                {waveformData.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-sm min-w-[2px]"
                    style={{
                      height: `${Math.max(value * 100, 2)}%`,
                      width: '2px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Uploading recording...</div>
            <Progress value={undefined} className="h-2 mt-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

3. AUDIO STORAGE SERVICE
```typescript
// lib/audio/storage-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class AudioStorageService {
  private supabase = createClientComponentClient()

  async uploadAudioFile(
    audioBlob: Blob,
    userId: string,
    filename: string,
    metadata: {
      projectId?: string
      duration: number
      originalName: string
      startTime: Date
      endTime: Date
    }
  ): Promise<any> {
    try {
      // Generate storage path
      const filePath = `${userId}/${Date.now()}-${filename}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('audio-recordings')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL (for authenticated access)
      const { data: { publicUrl } } = this.supabase.storage
        .from('audio-recordings')
        .getPublicUrl(filePath)

      // Save metadata to database
      const { data: recordingData, error: dbError } = await this.supabase
        .from('audio_recordings')
        .insert({
          user_id: userId,
          project_id: metadata.projectId,
          filename,
          original_name: metadata.originalName,
          file_size: audioBlob.size,
          duration_seconds: Math.round(metadata.duration),
          mime_type: audioBlob.type,
          storage_path: filePath,
          storage_bucket: 'audio-recordings',
          public_url: publicUrl,
          recording_started_at: metadata.startTime.toISOString(),
          recording_ended_at: metadata.endTime.toISOString(),
          recording_source: 'desktop_audio',
          processing_status: 'uploaded'
        })
        .select()
        .single()

      if (dbError) throw dbError

      return recordingData

    } catch (error) {
      throw new Error(`Failed to save audio recording: ${error.message}`)
    }
  }

  async getAudioRecordings(userId: string, projectId?: string): Promise<any[]> {
    let query = this.supabase
      .from('audio_recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async deleteAudioRecording(recordingId: string, userId: string): Promise<void> {
    // Get recording info first
    const { data: recording } = await this.supabase
      .from('audio_recordings')
      .select('storage_path, user_id')
      .eq('id', recordingId)
      .eq('user_id', userId)
      .single()

    if (!recording) throw new Error('Recording not found')

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('audio-recordings')
      .remove([recording.storage_path])

    if (storageError) throw storageError

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('audio_recordings')
      .delete()
      .eq('id', recordingId)
      .eq('user_id', userId)

    if (dbError) throw dbError
  }

  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('audio-recordings')
      .createSignedUrl(filePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  }
}
```

4. AUDIO PLAYER COMPONENT
```typescript
// components/audio/audio-player.tsx
"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

interface AudioPlayerProps {
  recording: {
    id: string
    filename: string
    public_url: string
    duration_seconds: number
    file_size: number
    created_at: string
  }
  onDelete?: (id: string) => void
}

export function AudioPlayer({ recording, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <Card>
      <CardContent className="p-4">
        <audio
          ref={audioRef}
          src={recording.public_url}
          preload="metadata"
        />
        
        <div className="space-y-4">
          {/* File Info */}
          <div>
            <h4 className="font-medium text-sm">{recording.filename}</h4>
            <p className="text-xs text-gray-500">
              {formatFileSize(recording.file_size)} • {formatTime(recording.duration_seconds)}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="sm"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
            </div>
            
            <span className="text-xs text-gray-500 min-w-[60px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs">🔊</span>
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button asChild variant="ghost" size="sm">
              <a href={recording.public_url} download={recording.filename}>
                📥 Download
              </a>
            </Button>
            
            {onDelete && (
              <Button
                onClick={() => onDelete(recording.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

BROWSER COMPATIBILITY:
- Chrome/Edge: Full support
- Firefox: Good support with polyfills
- Safari: Requires user gesture for audio context
- Mobile: Limited desktop capture support

PERFORMANCE OPTIMIZATIONS:
- Efficient waveform rendering
- Audio compression before upload
- Chunked recording for memory management
- Progressive audio loading

ERROR HANDLING:
- Permission denied scenarios
- Browser compatibility checks
- Network interruption handling
- Storage quota management

SECURITY CONSIDERATIONS:
- Secure storage access patterns
- File type validation
- Size limit enforcement
- User quota management

Build a professional-grade audio recording system that seamlessly integrates with the Visual Prompt Builder workflow.
```
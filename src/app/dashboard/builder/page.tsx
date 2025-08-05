"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ComponentSidebar } from "@/components/builder/component-sidebar"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Save, Wand2 } from "lucide-react"
import type { ComponentLibraryItem } from "@/types/components"
import { projectStore } from "@/lib/stores/project-store"

interface DroppedComponent {
  id: string
  component: ComponentLibraryItem
  position: { x: number; y: number }
}

export default function BuilderPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [activeComponent, setActiveComponent] = useState<ComponentLibraryItem | null>(null)
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([])
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string; components: Array<{ id: string; componentId: string; displayName: string; position: { x: number; y: number }; configuration?: Record<string, unknown> }> } | null>(null)
  const [projectName, setProjectName] = useState("Untitled Project")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  // const canvasRef = useRef<HTMLDivElement>(null) // Removed unused ref

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load project if projectId is provided
  useEffect(() => {
    if (projectId) {
      const project = projectStore.getProject(projectId)
      if (project) {
        setCurrentProject(project)
        setProjectName(project.name)
        // Convert project components to dropped components
        setDroppedComponents(project.components.map(comp => ({
          id: comp.id,
          component: {
            componentId: comp.componentId,
            displayName: comp.displayName,
            icon: '📦', // Default icon
            // Add other required ComponentLibraryItem properties with defaults
            id: comp.id,
            categoryId: '',
            complexityScore: 1,
            isPremium: false,
            configuration: comp.configuration,
            dependencies: [],
            features: [],
            browserSupport: { chrome: true, firefox: true, safari: true, edge: true },
            mobileReady: true,
            accessibilityCompliant: true,
            version: '1.0.0',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          } as ComponentLibraryItem,
          position: comp.position
        })))
      }
    }
  }, [projectId])

  const handleSaveProject = () => {
    if (projectId && currentProject) {
      // Update existing project
      projectStore.updateProject(projectId, {
        name: projectName,
        components: droppedComponents.map(comp => ({
          id: comp.id,
          componentId: comp.component.componentId,
          displayName: comp.component.displayName,
          position: comp.position,
          configuration: comp.component.configuration
        }))
      })
    } else {
      // Create new project
      const newProject = projectStore.createProject({
        name: projectName,
        components: droppedComponents.map(comp => ({
          id: comp.id,
          componentId: comp.component.componentId,
          displayName: comp.component.displayName,
          position: comp.position,
          configuration: comp.component.configuration
        })),
        userId: "current-user"
      })
      setCurrentProject(newProject)
      // Update URL without navigation
      window.history.replaceState({}, '', `/dashboard/builder?project=${newProject.id}`)
    }
  }

  const handleGeneratePrompt = async () => {
    setIsGenerating(true)
    try {
      const components = droppedComponents.map(comp => ({
        displayName: comp.component.displayName,
        position: comp.position,
        configuration: comp.component.configuration
      }))

      // Try to use Gemini API first
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedPrompt(data.prompt)
      } else {
        // Fallback to simple prompt generation
        const componentDescriptions = droppedComponents.map(comp => 
          `${comp.component.displayName} at position (${comp.position.x}, ${comp.position.y})`
        ).join(', ')
        
        const prompt = `Create a detailed prompt based on the following visual components arranged in a builder:

Components: ${componentDescriptions}

Generate a comprehensive prompt that incorporates all these elements in a logical flow. Consider their positions and relationships to create a cohesive prompt structure.

Note: This is a basic prompt. For AI-powered generation, please configure your Google Gemini API key.`

        setGeneratedPrompt(prompt)
      }
    } catch (error) {
      console.error('Error generating prompt:', error)
      
      // Fallback prompt
      const componentDescriptions = droppedComponents.map(comp => 
        `${comp.component.displayName} at position (${comp.position.x}, ${comp.position.y})`
      ).join(', ')
      
      setGeneratedPrompt(`Basic prompt generated from components: ${componentDescriptions}

Error occurred with AI generation. Please check your API configuration.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const component = event.active.data.current as ComponentLibraryItem
    setActiveComponent(component)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && over.id === 'canvas-drop-zone' && event.activatorEvent) {
      const component = active.data.current as ComponentLibraryItem
      
      // Get the canvas element's position
      const canvasRect = document.querySelector('[data-canvas]')?.getBoundingClientRect()
      
      if (canvasRect && 'clientX' in event.activatorEvent && 'clientY' in event.activatorEvent) {
        // Calculate position relative to canvas
        const x = (event.activatorEvent.clientX as number) - canvasRect.left - 50 // Center the component
        const y = (event.activatorEvent.clientY as number) - canvasRect.top - 30
        
        // Add the component to the canvas
        setDroppedComponents(prev => [
          ...prev,
          {
            id: `${component.componentId}-${Date.now()}`,
            component,
            position: { 
              x: Math.max(0, x), 
              y: Math.max(0, y) 
            }
          }
        ])
      }
    }

    setActiveComponent(null)
  }

  const handleRemoveComponent = (id: string) => {
    setDroppedComponents(prev => prev.filter(item => item.id !== id))
  }

  const handleUpdatePosition = (id: string, position: { x: number; y: number }) => {
    setDroppedComponents(prev => 
      prev.map(item => 
        item.id === id ? { ...item, position } : item
      )
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex bg-gray-900">
        <ComponentSidebar />
        
        <main className="flex-1 p-8 bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none text-white focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
                placeholder="Untitled Project"
              />
              {droppedComponents.length > 0 && (
                <div className="text-sm text-gray-400">
                  {droppedComponents.length} component{droppedComponents.length !== 1 ? 's' : ''} added
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveProject}
                disabled={droppedComponents.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Project
              </button>
              <button
                onClick={handleGeneratePrompt}
                disabled={droppedComponents.length === 0 || isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Prompt'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2" data-canvas>
              <BuilderCanvas
                droppedComponents={droppedComponents}
                onRemoveComponent={handleRemoveComponent}
                onUpdatePosition={handleUpdatePosition}
              />
            </div>
            
            {generatedPrompt && (
              <div className="xl:col-span-1">
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Generated Prompt</h3>
                  <div className="bg-gray-700 rounded-md p-4 mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300">{generatedPrompt}</pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                      className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => setGeneratedPrompt("")}
                      className="px-3 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeComponent ? (
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg border-2 border-primary opacity-80">
            <div className="flex items-center gap-2">
              <span className="text-lg">{activeComponent.icon || '📦'}</span>
              <span className="font-medium text-white">{activeComponent.displayName}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
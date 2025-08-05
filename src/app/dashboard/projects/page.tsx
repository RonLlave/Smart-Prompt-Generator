"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Calendar, FileText, Trash2, Edit, Wand2, Users, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { projectStore, type Project } from "@/lib/stores/project-store"
import { AudioSelection } from "@/components/projects/audio-selection"
import { AssistantTypeSelector } from "@/components/projects/assistant-type-selector"
import { PromptDisplay } from "@/components/projects/prompt-display"
import { AssistantType, PromptGenerationResult } from "@/lib/types/project-assistants"
import { useAuth } from "@/hooks/use-auth"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>(projectStore.getAllProjects())
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  
  // New AI prompt generation states
  const [selectedAudioIds, setSelectedAudioIds] = useState<string[]>([])
  const [selectedAssistantTypes, setSelectedAssistantTypes] = useState<AssistantType[]>([])
  const [generatedPrompts, setGeneratedPrompts] = useState<PromptGenerationResult[]>([])
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'details' | 'audio' | 'assistants' | 'prompts'>('details')

  const resetCreationForm = () => {
    setNewProjectName("")
    setNewProjectDescription("")
    setSelectedAudioIds([])
    setSelectedAssistantTypes([])
    setGeneratedPrompts([])
    setGenerationError(null)
    setCurrentStep('details')
    setIsCreating(false)
  }

  const handleGeneratePrompts = async () => {
    if (!user?.email || selectedAssistantTypes.length === 0) {
      return
    }

    setIsGeneratingPrompts(true)
    setGenerationError(null)

    try {
      console.log('🚀 Generating prompts for project:', {
        projectName: newProjectName,
        assistantTypes: selectedAssistantTypes,
        audioIds: selectedAudioIds
      })

      const response = await fetch('/api/projects/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: newProjectName,
          projectDescription: newProjectDescription,
          selectedAudioIds,
          assistantTypes: selectedAssistantTypes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompts')
      }

      setGeneratedPrompts(data.results || [])
      setCurrentStep('prompts')
      
      console.log('✅ Prompts generated successfully:', data.results?.length)

    } catch (error) {
      console.error('❌ Error generating prompts:', error)
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsGeneratingPrompts(false)
    }
  }

  const handleCreateProjectWithPrompts = async () => {
    if (!user?.email || !newProjectName.trim() || generatedPrompts.length === 0) {
      return
    }

    setIsCreatingProject(true)

    try {
      console.log('🚀 Creating project with prompts:', {
        projectName: newProjectName,
        promptsCount: generatedPrompts.length
      })

      const response = await fetch('/api/projects/create-with-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: newProjectName,
          projectDescription: newProjectDescription,
          selectedAudioIds,
          assistantTypes: selectedAssistantTypes,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      console.log('✅ Project created successfully:', data.projectId)

      // For now, still use the local store (in future, this would be replaced with Supabase)
      projectStore.createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        components: [],
        userId: user.email
      })
      
      setProjects(projectStore.getAllProjects())
      resetCreationForm()

    } catch (error) {
      console.error('❌ Error creating project:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleRegeneratePrompts = async () => {
    // For now, regenerate all prompts
    await handleGeneratePrompts()
  }

  const handleCopyPrompt = () => {
    console.log('Copied prompt to clipboard')
  }

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      projectStore.deleteProject(id)
      setProjects(projectStore.getAllProjects())
    }
  }

  const canProceedToAudio = newProjectName.trim() && newProjectDescription.trim()
  const canProceedToAssistants = canProceedToAudio
  const canGeneratePrompts = selectedAssistantTypes.length > 0
  const canCreateProject = generatedPrompts.length > 0

  const getStepStatus = (step: typeof currentStep) => {
    const stepOrder = ['details', 'audio', 'assistants', 'prompts']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(step)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'inactive'
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project with AI Prompts
          </button>
        </div>

        {/* Enhanced Project Creation Flow */}
        {isCreating && (
          <div className="mb-8 bg-gray-800 border border-gray-700 rounded-lg shadow-sm overflow-hidden">
            {/* Steps Header */}
            <div className="bg-gray-900/50 p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">Create New Project with AI Assistant Prompts</h2>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-4">
                {[
                  { key: 'details', label: 'Project Details', icon: FileText },
                  { key: 'audio', label: 'Audio Context', icon: FileAudio },
                  { key: 'assistants', label: 'Assistant Types', icon: Users },
                  { key: 'prompts', label: 'Generated Prompts', icon: Wand2 }
                ].map((step, index) => {
                  const status = getStepStatus(step.key as typeof currentStep)
                  const StepIcon = step.icon
                  
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        status === 'active' 
                          ? 'bg-blue-600 text-white'
                          : status === 'completed'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                      {index < 3 && (
                        <ArrowRight className="w-5 h-5 text-gray-500 mx-2" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Project Details */}
              {currentStep === 'details' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your project goals, features, and requirements..."
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A detailed description helps generate better AI assistant prompts.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('audio')}
                      disabled={!canProceedToAudio}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        canProceedToAudio
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next: Select Audio Context
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetCreationForm}
                      className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Audio Selection */}
              {currentStep === 'audio' && user?.email && (
                <div className="space-y-6">
                  <AudioSelection
                    selectedAudioIds={selectedAudioIds}
                    onSelectionChange={setSelectedAudioIds}
                    userEmail={user.email}
                    maxSelections={5}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep('assistants')}
                      disabled={!canProceedToAssistants}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        canProceedToAssistants
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next: Select Assistants
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Assistant Type Selection */}
              {currentStep === 'assistants' && (
                <div className="space-y-6">
                  <AssistantTypeSelector
                    selectedTypes={selectedAssistantTypes}
                    onSelectionChange={setSelectedAssistantTypes}
                    maxSelections={6}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('audio')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleGeneratePrompts}
                      disabled={!canGeneratePrompts || isGeneratingPrompts}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        canGeneratePrompts && !isGeneratingPrompts
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isGeneratingPrompts ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating AI Prompts...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate AI Prompts
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Generated Prompts */}
              {currentStep === 'prompts' && (
                <div className="space-y-6">
                  <PromptDisplay
                    prompts={generatedPrompts}
                    isLoading={isGeneratingPrompts}
                    onRegenerate={handleRegeneratePrompts}
                    onCopy={handleCopyPrompt}
                    totalCost={generatedPrompts.reduce((sum, p) => sum + p.estimatedCost, 0)}
                    totalTokens={generatedPrompts.reduce((sum, p) => sum + p.inputTokens + p.outputTokens, 0)}
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep('assistants')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCreateProjectWithPrompts}
                      disabled={!canCreateProject || isCreatingProject}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        canCreateProject && !isCreatingProject
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCreatingProject ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Create Project & Save Prompts
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {generationError && (
                <div className="mt-4 bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Error</h4>
                  <p className="text-sm">{generationError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first project with AI-generated assistant prompts</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="group bg-gray-800 border border-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition-shadow hover:border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
                    {project.name}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/builder?project=${project.id}`}
                      className="p-1 text-gray-400 hover:text-blue-400 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{project.components.length} components</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/builder?project=${project.id}`}
                    className="flex-1 text-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    Open in Builder
                  </Link>
                  <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm">
                    <Wand2 className="w-3 h-3" />
                    AI Prompts
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
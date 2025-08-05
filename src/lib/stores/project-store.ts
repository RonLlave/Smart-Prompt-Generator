// Simple in-memory project store for JWT-only mode
// In production, this would be replaced with database operations

export interface Project {
  id: string
  name: string
  description?: string
  components: Array<{
    id: string
    componentId: string
    displayName: string
    position: { x: number; y: number }
    configuration: Record<string, unknown>
  }>
  createdAt: Date
  updatedAt: Date
  userId?: string
}

class ProjectStore {
  private projects: Map<string, Project> = new Map()

  getAllProjects(userId?: string): Project[] {
    return Array.from(this.projects.values())
      .filter(project => !userId || project.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  getProject(id: string): Project | null {
    return this.projects.get(id) || null
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.projects.set(newProject.id, newProject)
    return newProject
  }

  updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
    const project = this.projects.get(id)
    if (!project) return null

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    }

    this.projects.set(id, updatedProject)
    return updatedProject
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id)
  }

  // Initialize with some sample projects
  initializeSampleProjects() {
    if (this.projects.size === 0) {
      this.createProject({
        name: "Sample Marketing Prompt",
        description: "A template for creating marketing content",
        components: [
          {
            id: "comp-1",
            componentId: "text-input",
            displayName: "Product Name",
            position: { x: 50, y: 50 },
            configuration: { placeholder: "Enter product name..." }
          },
          {
            id: "comp-2", 
            componentId: "text-area",
            displayName: "Product Description",
            position: { x: 50, y: 150 },
            configuration: { placeholder: "Describe your product..." }
          }
        ],
        userId: "sample-user"
      })

      this.createProject({
        name: "Code Review Template",
        description: "Template for technical code reviews",
        components: [
          {
            id: "comp-3",
            componentId: "code-input",
            displayName: "Code Snippet",
            position: { x: 50, y: 50 },
            configuration: { language: "javascript" }
          }
        ],
        userId: "sample-user"
      })
    }
  }
}

export const projectStore = new ProjectStore()

// Initialize sample projects
projectStore.initializeSampleProjects()
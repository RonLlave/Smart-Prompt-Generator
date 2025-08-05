"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Calendar, FileText, Trash2, Edit } from "lucide-react"
import { projectStore, type Project } from "@/lib/stores/project-store"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(projectStore.getAllProjects())
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      projectStore.createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        components: [],
        userId: "current-user" // In real app, get from auth
      })
      
      setProjects(projectStore.getAllProjects())
      setNewProjectName("")
      setNewProjectDescription("")
      setIsCreating(false)
    }
  }

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      projectStore.deleteProject(id)
      setProjects(projectStore.getAllProjects())
    }
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
            New Project
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
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
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mr-2"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
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
                  <button className="px-3 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors text-sm">
                    Generate Prompt
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
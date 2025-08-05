"use server"

import { action } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ComponentConfig } from '@/types/components'

const addComponentToProjectSchema = z.object({
  projectId: z.string().uuid(),
  componentId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  customConfig: z.record(z.string(), z.any()).optional()
})

export const addComponentToProjectAction = action
  .schema(addComponentToProjectSchema)
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    const supabase = await createClient()

    // Check if user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', input.projectId)
      .eq('user_id', userId)
      .single()

    if (!project) {
      throw new Error('Project not found or unauthorized')
    }

    // Fetch the component details
    const { data: component } = await supabase
      .from('component_library')
      .select('*')
      .eq('component_id', input.componentId)
      .single()

    if (!component) {
      throw new Error('Component not found')
    }

    // Add component to project
    const { data, error } = await supabase
      .from('project_components')
      .insert({
        project_id: input.projectId,
        component_type: component.component_id,
        position_x: input.position.x,
        position_y: input.position.y,
        width: 200, // Default width
        height: 100, // Default height
        z_index: 0,
        properties: {
          ...component.configuration,
          ...input.customConfig,
          displayName: component.display_name,
          componentId: component.component_id
        } as ComponentConfig
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, component: data }
  })

const applyTemplateSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string()
})

export const applyTemplateToProjectAction = action
  .schema(applyTemplateSchema)
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    const supabase = await createClient()

    // Check if user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', input.projectId)
      .eq('user_id', userId)
      .single()

    if (!project) {
      throw new Error('Project not found or unauthorized')
    }

    // Fetch template with components
    const { data: template } = await supabase
      .from('feature_templates')
      .select('*')
      .eq('template_id', input.templateId)
      .single()

    if (!template) {
      throw new Error('Template not found')
    }

    // Fetch all components in the template
    const { data: components } = await supabase
      .from('component_library')
      .select('*')
      .in('component_id', template.components as string[])

    if (!components || components.length === 0) {
      throw new Error('No components found for template')
    }

    // Add all components to the project
    const componentPromises = components.map((component, index) => {
      const position = calculateComponentPosition(index)
      
      return supabase
        .from('project_components')
        .insert({
          project_id: input.projectId,
          component_type: component.component_id,
          position_x: position.x,
          position_y: position.y,
          width: 200,
          height: 100,
          z_index: index,
          properties: {
            ...component.configuration,
            displayName: component.display_name,
            componentId: component.component_id
          } as ComponentConfig
        })
    })

    const results = await Promise.all(componentPromises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      throw new Error('Failed to add some components')
    }

    return { 
      success: true, 
      componentsAdded: components.length 
    }
  })

const updateComponentPositionSchema = z.object({
  componentId: z.string().uuid(),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
})

export const updateComponentPositionAction = action
  .schema(updateComponentPositionSchema)
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    const supabase = await createClient()

    // Check if user owns the component's project
    const { data: component } = await supabase
      .from('project_components')
      .select(`
        project_id,
        projects!inner(
          user_id
        )
      `)
      .eq('id', input.componentId)
      .single()

    const project = component?.projects as unknown as { user_id: string }
    if (!component || project?.user_id !== userId) {
      throw new Error('Component not found or unauthorized')
    }

    // Update position
    const { error } = await supabase
      .from('project_components')
      .update({
        position_x: input.position.x,
        position_y: input.position.y
      })
      .eq('id', input.componentId)

    if (error) throw error

    return { success: true }
  })

const removeComponentSchema = z.object({
  componentId: z.string().uuid()
})

export const removeComponentAction = action
  .schema(removeComponentSchema)
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    const supabase = await createClient()

    // Check if user owns the component's project
    const { data: component } = await supabase
      .from('project_components')
      .select(`
        project_id,
        projects!inner(
          user_id
        )
      `)
      .eq('id', input.componentId)
      .single()

    const project = component?.projects as unknown as { user_id: string }
    if (!component || project?.user_id !== userId) {
      throw new Error('Component not found or unauthorized')
    }

    // Delete component
    const { error } = await supabase
      .from('project_components')
      .delete()
      .eq('id', input.componentId)

    if (error) throw error

    return { success: true }
  })

// Helper function to calculate component positions in a grid
function calculateComponentPosition(index: number) {
  const columns = 3
  const spacing = 250
  const row = Math.floor(index / columns)
  const col = index % columns
  
  return {
    x: 100 + (col * spacing),
    y: 100 + (row * spacing)
  }
}
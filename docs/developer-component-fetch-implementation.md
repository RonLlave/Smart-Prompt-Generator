# Developer Implementation - Component Library Data Fetching

## Overview

Implement the data fetching layer to retrieve component library data from the newly seeded database tables. This will power the drag-and-drop interface in the Visual Prompt Builder.

## Database Tables to Fetch From

1. `component_categories` - Component category listings
2. `component_library` - Individual components with configurations
3. `feature_templates` - Pre-configured component bundles
4. `component_relationships` - Component dependencies and recommendations

## Implementation Tasks

### 1. Supabase Client Types

First, generate TypeScript types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

### 2. Component Type Definitions

Create type definitions in `types/components.ts`:

```typescript
// types/components.ts
export interface ComponentCategory {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  displayOrder: number
  createdAt: Date
}

export interface ComponentConfig {
  [key: string]: any
}

export interface ComponentLibraryItem {
  id: string
  componentId: string
  displayName: string
  categoryId: string
  category?: ComponentCategory
  description?: string
  icon?: string
  complexityScore: number
  isPremium: boolean
  configuration: ComponentConfig
  dependencies: string[]
  features: string[]
  browserSupport: {
    chrome: boolean
    firefox: boolean
    safari: boolean
    edge: boolean
  }
  mobileReady: boolean
  accessibilityCompliant: boolean
  version: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FeatureTemplate {
  id: string
  templateId: string
  name: string
  description?: string
  category?: string
  components: string[]
  configuration: ComponentConfig
  complexityScore: number
  useCase?: string
  previewImageUrl?: string
  isActive: boolean
  createdAt: Date
}

export interface ComponentRelationship {
  id: string
  componentId: string
  relatedComponentId: string
  relationshipType: 'requires' | 'recommends' | 'incompatible'
  component?: ComponentLibraryItem
  relatedComponent?: ComponentLibraryItem
}

export interface DraggableComponent extends ComponentLibraryItem {
  // Extended properties for drag-and-drop
  instanceId?: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  customConfig?: ComponentConfig
}
```

### 3. Data Fetching Service

Create a service for fetching component data in `lib/services/component-library.service.ts`:

```typescript
// lib/services/component-library.service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import type { 
  ComponentCategory, 
  ComponentLibraryItem, 
  FeatureTemplate,
  ComponentRelationship 
} from '@/types/components'

export class ComponentLibraryService {
  private supabase = createClientComponentClient<Database>()

  /**
   * Fetch all active component categories
   */
  async getCategories(): Promise<ComponentCategory[]> {
    const { data, error } = await this.supabase
      .from('component_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Fetch all components, optionally filtered by category
   */
  async getComponents(categoryId?: string): Promise<ComponentLibraryItem[]> {
    let query = this.supabase
      .from('component_library')
      .select(`
        *,
        category:component_categories(*)
      `)
      .eq('is_active', true)
      .order('display_name', { ascending: true })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Fetch a single component by ID with all relationships
   */
  async getComponentById(componentId: string): Promise<{
    component: ComponentLibraryItem
    requires: ComponentLibraryItem[]
    recommends: ComponentLibraryItem[]
  } | null> {
    // Fetch the component
    const { data: component, error: componentError } = await this.supabase
      .from('component_library')
      .select(`
        *,
        category:component_categories(*)
      `)
      .eq('component_id', componentId)
      .single()

    if (componentError || !component) return null

    // Fetch relationships
    const { data: relationships } = await this.supabase
      .from('component_relationships')
      .select(`
        *,
        related_component:component_library!component_relationships_related_component_id_fkey(*)
      `)
      .eq('component_id', component.id)

    const requires = relationships
      ?.filter(r => r.relationship_type === 'requires')
      .map(r => r.related_component) || []

    const recommends = relationships
      ?.filter(r => r.relationship_type === 'recommends')
      .map(r => r.related_component) || []

    return { component, requires, recommends }
  }

  /**
   * Fetch components by multiple IDs (for templates)
   */
  async getComponentsByIds(componentIds: string[]): Promise<ComponentLibraryItem[]> {
    const { data, error } = await this.supabase
      .from('component_library')
      .select(`
        *,
        category:component_categories(*)
      `)
      .in('component_id', componentIds)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  /**
   * Fetch all feature templates
   */
  async getFeatureTemplates(): Promise<FeatureTemplate[]> {
    const { data, error } = await this.supabase
      .from('feature_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Get a feature template with its components
   */
  async getTemplateWithComponents(templateId: string): Promise<{
    template: FeatureTemplate
    components: ComponentLibraryItem[]
  } | null> {
    const { data: template, error } = await this.supabase
      .from('feature_templates')
      .select('*')
      .eq('template_id', templateId)
      .single()

    if (error || !template) return null

    const components = await this.getComponentsByIds(template.components)

    return { template, components }
  }

  /**
   * Search components by name or description
   */
  async searchComponents(searchTerm: string): Promise<ComponentLibraryItem[]> {
    const { data, error } = await this.supabase
      .from('component_library')
      .select(`
        *,
        category:component_categories(*)
      `)
      .eq('is_active', true)
      .or(`display_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(20)

    if (error) throw error
    return data || []
  }

  /**
   * Get components grouped by category
   */
  async getComponentsGroupedByCategory(): Promise<Map<ComponentCategory, ComponentLibraryItem[]>> {
    const categories = await this.getCategories()
    const components = await this.getComponents()

    const grouped = new Map<ComponentCategory, ComponentLibraryItem[]>()

    categories.forEach(category => {
      const categoryComponents = components.filter(c => c.categoryId === category.id)
      if (categoryComponents.length > 0) {
        grouped.set(category, categoryComponents)
      }
    })

    return grouped
  }
}

// Export singleton instance
export const componentLibraryService = new ComponentLibraryService()
```

### 4. React Hooks for Data Fetching

Create custom hooks in `hooks/use-component-library.ts`:

```typescript
// hooks/use-component-library.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { componentLibraryService } from '@/lib/services/component-library.service'
import type { ComponentCategory, ComponentLibraryItem, FeatureTemplate } from '@/types/components'

// Query keys
const QUERY_KEYS = {
  categories: ['component-categories'],
  components: (categoryId?: string) => ['components', categoryId],
  component: (id: string) => ['component', id],
  templates: ['feature-templates'],
  template: (id: string) => ['feature-template', id],
  search: (term: string) => ['component-search', term],
  grouped: ['components-grouped']
}

/**
 * Hook to fetch component categories
 */
export function useComponentCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => componentLibraryService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch components, optionally filtered by category
 */
export function useComponents(categoryId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.components(categoryId),
    queryFn: () => componentLibraryService.getComponents(categoryId),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single component with relationships
 */
export function useComponent(componentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.component(componentId),
    queryFn: () => componentLibraryService.getComponentById(componentId),
    enabled: !!componentId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch feature templates
 */
export function useFeatureTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: () => componentLibraryService.getFeatureTemplates(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch a template with its components
 */
export function useFeatureTemplate(templateId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.template(templateId),
    queryFn: () => componentLibraryService.getTemplateWithComponents(templateId),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to search components
 */
export function useComponentSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.search(searchTerm),
    queryFn: () => componentLibraryService.searchComponents(searchTerm),
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to get components grouped by category
 */
export function useComponentsGroupedByCategory() {
  return useQuery({
    queryKey: QUERY_KEYS.grouped,
    queryFn: () => componentLibraryService.getComponentsGroupedByCategory(),
    staleTime: 5 * 60 * 1000,
  })
}
```

### 5. Component Library UI Implementation

Update the component sidebar in `components/visual-builder/component-sidebar.tsx`:

```typescript
// components/visual-builder/component-sidebar.tsx
"use client"
import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { useComponentsGroupedByCategory, useComponentSearch } from "@/hooks/use-component-library"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { ComponentLibraryItem } from "@/types/components"

function DraggableComponent({ component }: { component: ComponentLibraryItem }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.componentId,
    data: component,
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
      <span className="text-lg mr-3">{component.icon || '📦'}</span>
      <div className="flex-1">
        <span className="text-sm font-medium">{component.displayName}</span>
        {component.isPremium && (
          <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {'⭐'.repeat(component.complexityScore)}
      </div>
    </div>
  )
}

export function ComponentSidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const { data: groupedComponents, isLoading } = useComponentsGroupedByCategory()
  const { data: searchResults, isLoading: isSearching } = useComponentSearch(searchTerm)

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="w-80 bg-gray-50 border-r flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold mb-3">Component Library</h3>
        <Input
          type="search"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchTerm && searchResults && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Search Results ({searchResults.length})
              </h4>
              <div className="space-y-2">
                {searchResults.map((component) => (
                  <DraggableComponent key={component.id} component={component} />
                ))}
              </div>
            </div>
          )}

          {/* Grouped Components */}
          {!searchTerm && groupedComponents && (
            <>
              {Array.from(groupedComponents.entries()).map(([category, components]) => (
                <div key={category.id} className="mb-6">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full text-left mb-3 hover:text-gray-900"
                  >
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.displayName}
                      <span className="ml-2 text-xs text-gray-500">({components.length})</span>
                    </h4>
                    <span className="text-xs">
                      {expandedCategories.has(category.id) ? '▼' : '▶'}
                    </span>
                  </button>

                  {expandedCategories.has(category.id) && (
                    <div className="space-y-2">
                      {components.map((component) => (
                        <DraggableComponent key={component.id} component={component} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Feature Templates */}
      <div className="p-4 border-t bg-white">
        <button className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800">
          Browse Feature Templates →
        </button>
      </div>
    </div>
  )
}
```

### 6. Server Actions for Component Operations

Create server actions in `actions/components.ts`:

```typescript
// actions/components.ts
"use server"
import { action } from '@/lib/safe-action'
import { z } from 'zod'
import { auth } from '@/auth'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const addComponentToProjectSchema = z.object({
  projectId: z.string().uuid(),
  componentId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  customConfig: z.record(z.any()).optional()
})

export const addComponentToProjectAction = action(
  addComponentToProjectSchema,
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const supabase = createServerComponentClient({ cookies })

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
        component_name: component.display_name,
        display_name: component.display_name,
        position_x: input.position.x,
        position_y: input.position.y,
        configuration: {
          ...component.configuration,
          ...input.customConfig
        }
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, component: data }
  }
)

const applyTemplateSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string()
})

export const applyTemplateToProjectAction = action(
  applyTemplateSchema,
  async (input) => {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const supabase = createServerComponentClient({ cookies })

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
      .in('component_id', template.components)

    if (!components || components.length === 0) {
      throw new Error('No components found for template')
    }

    // Add all components to the project
    const componentPromises = components.map((component, index) => {
      const position = calculateComponentPosition(index, components.length)
      
      return supabase
        .from('project_components')
        .insert({
          project_id: input.projectId,
          component_type: component.component_id,
          component_name: component.display_name,
          display_name: component.display_name,
          position_x: position.x,
          position_y: position.y,
          configuration: component.configuration
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
  }
)

// Helper function to calculate component positions in a grid
function calculateComponentPosition(index: number, total: number) {
  const columns = 3
  const spacing = 200
  const row = Math.floor(index / columns)
  const col = index % columns
  
  return {
    x: 100 + (col * spacing),
    y: 100 + (row * spacing)
  }
}
```

### 7. Real-time Sync (Optional)

For real-time updates when components are added/removed:

```typescript
// hooks/use-realtime-components.ts
import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeComponentSync(projectId: string) {
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_components',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries(['project-components', projectId])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase, queryClient])
}
```

## Testing Checklist

- [ ] Component categories load correctly
- [ ] Components display with proper icons and metadata
- [ ] Drag and drop functionality works
- [ ] Search filters components properly
- [ ] Feature templates load and apply correctly
- [ ] Component relationships are respected
- [ ] Premium components are marked appropriately
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable with large datasets
- [ ] Error states are handled gracefully

## Performance Considerations

1. **Lazy Loading**: Load components on demand as categories are expanded
2. **Caching**: Use React Query's caching to minimize database calls
3. **Pagination**: Implement pagination for large component sets
4. **Search Debouncing**: Debounce search input to reduce API calls
5. **Image Optimization**: Lazy load component preview images

## Next Steps

1. Implement component preview on hover
2. Add component documentation viewer
3. Create component usage analytics
4. Build component version management
5. Add custom component creation interface

This implementation provides a robust foundation for fetching and displaying the component library in your Visual Prompt Builder application.
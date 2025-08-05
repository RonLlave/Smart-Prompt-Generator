import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type ComponentCategory = Database['public']['Tables']['component_categories']['Row']
type ComponentLibrary = Database['public']['Tables']['component_library']['Row']
type FeatureTemplate = Database['public']['Tables']['feature_templates']['Row']

export interface ComponentWithRelations extends ComponentLibrary {
  category?: ComponentCategory
  requires?: ComponentLibrary[]
  recommends?: ComponentLibrary[]
  incompatible_with?: ComponentLibrary[]
}

export interface CategoryWithComponents extends ComponentCategory {
  components: ComponentWithRelations[]
  component_count: number
}

export interface FeatureTemplateWithComponents extends FeatureTemplate {
  components: ComponentWithRelations[]
}

export interface ComponentSearchFilters {
  categoryId?: string
  search?: string
  complexity?: number[]
  isPremium?: boolean
  tags?: string[]
}

export interface ComponentFetchOptions {
  includeRelations?: boolean
  includeCategory?: boolean
  limit?: number
  offset?: number
}

export class ComponentLibraryService {
  private supabase = createClient()

  /**
   * Fetch all component categories with component counts
   */
  async getCategories(): Promise<CategoryWithComponents[]> {
    try {
      const { data: categories, error: categoriesError } = await this.supabase
        .from('component_categories')
        .select(`
          *,
          component_library:component_library!category_id(count)
        `)
        .order('order_index', { ascending: true })

      if (categoriesError) throw categoriesError

      // Transform the response to include component count
      const categoriesWithCount: CategoryWithComponents[] = categories?.map(category => ({
        ...category,
        components: [],
        component_count: category.component_library?.[0]?.count || 0
      })) || []

      return categoriesWithCount
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch component categories')
    }
  }

  /**
   * Fetch components by category with optional relations
   */
  async getComponentsByCategory(
    categoryId: string, 
    options: ComponentFetchOptions = {}
  ): Promise<ComponentWithRelations[]> {
    try {
      const { 
        includeRelations = false, 
        includeCategory = false,
        limit = 50,
        offset = 0 
      } = options

      const query = this.supabase
        .from('component_library')
        .select(`
          *
          ${includeCategory ? ', category:component_categories(*)' : ''}
        `)
        .eq('category_id', categoryId)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data: components, error } = await query

      if (error) throw error

      if (includeRelations && components) {
        return this.enrichComponentsWithRelations(components)
      }

      return components || []
    } catch (error) {
      console.error('Error fetching components by category:', error)
      throw new Error('Failed to fetch components for category')
    }
  }

  /**
   * Search components with filters
   */
  async searchComponents(
    filters: ComponentSearchFilters = {},
    options: ComponentFetchOptions = {}
  ): Promise<ComponentWithRelations[]> {
    try {
      const { 
        categoryId,
        search,
        complexity,
        isPremium,
        tags
      } = filters

      const {
        includeRelations = false,
        includeCategory = false,
        limit = 50,
        offset = 0
      } = options

      const query = this.supabase
        .from('component_library')
        .select(`
          *
          ${includeCategory ? ', category:component_categories(*)' : ''}
        `)

      // Apply filters
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (complexity && complexity.length > 0) {
        query = query.in('complexity_score', complexity)
      }

      if (isPremium !== undefined) {
        query = query.eq('is_premium', isPremium)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags)
      }

      query = query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data: components, error } = await query

      if (error) throw error

      if (includeRelations && components) {
        return this.enrichComponentsWithRelations(components)
      }

      return components || []
    } catch (error) {
      console.error('Error searching components:', error)
      throw new Error('Failed to search components')
    }
  }

  /**
   * Get a single component with all relations
   */
  async getComponentById(componentId: string): Promise<ComponentWithRelations | null> {
    try {
      const { data: component, error } = await this.supabase
        .from('component_library')
        .select(`
          *,
          category:component_categories(*)
        `)
        .eq('id', componentId)
        .single()

      if (error) throw error

      if (component) {
        const enrichedComponents = await this.enrichComponentsWithRelations([component])
        return enrichedComponents[0] || null
      }

      return null
    } catch (error) {
      console.error('Error fetching component by ID:', error)
      throw new Error('Failed to fetch component')
    }
  }

  /**
   * Get feature templates with components
   */
  async getFeatureTemplates(): Promise<FeatureTemplateWithComponents[]> {
    try {
      const { data: templates, error } = await this.supabase
        .from('feature_templates')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      if (!templates) return []

      // Fetch components for each template
      const templatesWithComponents: FeatureTemplateWithComponents[] = []

      for (const template of templates) {
        const componentIds = template.component_ids || []
        
        if (componentIds.length > 0) {
          const { data: components, error: componentsError } = await this.supabase
            .from('component_library')
            .select(`
              *,
              category:component_categories(*)
            `)
            .in('id', componentIds)

          if (componentsError) {
            console.error(`Error fetching components for template ${template.id}:`, componentsError)
            continue
          }

          templatesWithComponents.push({
            ...template,
            components: components || []
          })
        } else {
          templatesWithComponents.push({
            ...template,
            components: []
          })
        }
      }

      return templatesWithComponents
    } catch (error) {
      console.error('Error fetching feature templates:', error)
      throw new Error('Failed to fetch feature templates')
    }
  }

  /**
   * Get components grouped by category
   */
  async getComponentsGroupedByCategory(
    options: ComponentFetchOptions = {}
  ): Promise<CategoryWithComponents[]> {
    try {
      const categories = await this.getCategories()
      
      const categoriesWithComponents: CategoryWithComponents[] = []

      for (const category of categories) {
        const components = await this.getComponentsByCategory(category.id, options)
        
        categoriesWithComponents.push({
          ...category,
          components,
          component_count: components.length
        })
      }

      return categoriesWithComponents
    } catch (error) {
      console.error('Error fetching grouped components:', error)
      throw new Error('Failed to fetch components grouped by category')
    }
  }

  /**
   * Enrich components with their relationships
   */
  private async enrichComponentsWithRelations(
    components: ComponentLibrary[]
  ): Promise<ComponentWithRelations[]> {
    try {
      const componentIds = components.map(c => c.id)

      // Fetch all relationships for these components
      const { data: relationships, error } = await this.supabase
        .from('component_relationships')
        .select(`
          *,
          source_component:component_library!source_component_id(*),
          target_component:component_library!target_component_id(*)
        `)
        .or(`source_component_id.in.(${componentIds.join(',')}),target_component_id.in.(${componentIds.join(',')})`)

      if (error) throw error

      // Group relationships by component and type
      const componentRelations: Record<string, {
        requires: ComponentLibrary[]
        recommends: ComponentLibrary[]
        incompatible_with: ComponentLibrary[]
      }> = {}

      componentIds.forEach(id => {
        componentRelations[id] = {
          requires: [],
          recommends: [],
          incompatible_with: []
        }
      })

      relationships?.forEach(rel => {
        const sourceId = rel.source_component_id
        const targetComponent = rel.target_component

        if (componentRelations[sourceId] && targetComponent) {
          switch (rel.relationship_type) {
            case 'requires':
              componentRelations[sourceId].requires.push(targetComponent)
              break
            case 'recommends':
              componentRelations[sourceId].recommends.push(targetComponent)
              break
            case 'incompatible':
              componentRelations[sourceId].incompatible_with.push(targetComponent)
              break
          }
        }
      })

      // Enrich components with relationships
      return components.map(component => ({
        ...component,
        requires: componentRelations[component.id]?.requires || [],
        recommends: componentRelations[component.id]?.recommends || [],
        incompatible_with: componentRelations[component.id]?.incompatible_with || []
      }))

    } catch (error) {
      console.error('Error enriching components with relations:', error)
      // Return components without relations if enrichment fails
      return components.map(component => ({
        ...component,
        requires: [],
        recommends: [],
        incompatible_with: []
      }))
    }
  }

  /**
   * Get popular/recommended components
   */
  async getPopularComponents(limit: number = 10): Promise<ComponentWithRelations[]> {
    try {
      // For now, we'll return components ordered by creation date
      // In the future, this could be based on usage statistics
      const { data: components, error } = await this.supabase
        .from('component_library')
        .select(`
          *,
          category:component_categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return components || []
    } catch (error) {
      console.error('Error fetching popular components:', error)
      throw new Error('Failed to fetch popular components')
    }
  }

  /**
   * Get components by tags
   */
  async getComponentsByTags(
    tags: string[],
    options: ComponentFetchOptions = {}
  ): Promise<ComponentWithRelations[]> {
    try {
      const { 
        includeRelations = false,
        includeCategory = false,
        limit = 50,
        offset = 0
      } = options

      const { data: components, error } = await this.supabase
        .from('component_library')
        .select(`
          *
          ${includeCategory ? ', category:component_categories(*)' : ''}
        `)
        .overlaps('tags', tags)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      if (includeRelations && components) {
        return this.enrichComponentsWithRelations(components)
      }

      return components || []
    } catch (error) {
      console.error('Error fetching components by tags:', error)
      throw new Error('Failed to fetch components by tags')
    }
  }
}
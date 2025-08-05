import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import type { 
  ComponentCategory, 
  ComponentLibraryItem, 
  FeatureTemplate,
  ComponentConfig 
} from '@/types/components'

type ComponentLibraryTable = Database['public']['Tables']['component_library']['Row']
type ComponentCategoryTable = Database['public']['Tables']['component_categories']['Row']
type FeatureTemplateTable = Database['public']['Tables']['feature_templates']['Row']
// type ComponentRelationshipTable = Database['public']['Tables']['component_relationships']['Row']

export class ComponentLibraryService {
  private supabase = createClient()

  /**
   * Fetch all active component categories
   */
  async getCategories(): Promise<ComponentCategory[]> {
    const { data, error } = await this.supabase
      .from('component_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    
    return (data || []).map(this.mapCategory)
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
    
    return (data || []).map(item => this.mapComponent(item, item.category))
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
      .map(r => this.mapComponent(r.related_component as ComponentLibraryTable)) || []

    const recommends = relationships
      ?.filter(r => r.relationship_type === 'recommends')
      .map(r => this.mapComponent(r.related_component as ComponentLibraryTable)) || []

    return { 
      component: this.mapComponent(component, component.category),
      requires, 
      recommends 
    }
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
    
    return (data || []).map(item => this.mapComponent(item, item.category))
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
    
    return (data || []).map(this.mapTemplate)
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

    const components = await this.getComponentsByIds(template.components as string[])

    return { 
      template: this.mapTemplate(template), 
      components 
    }
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
    
    return (data || []).map(item => this.mapComponent(item, item.category))
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

  // Mapping functions to convert database types to app types
  private mapCategory(data: ComponentCategoryTable): ComponentCategory {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      description: data.description || undefined,
      icon: data.icon || undefined,
      displayOrder: data.display_order || 0,
      createdAt: new Date(data.created_at)
    }
  }

  private mapComponent(
    data: ComponentLibraryTable, 
    category?: ComponentCategoryTable | null
  ): ComponentLibraryItem {
    return {
      id: data.id,
      componentId: data.component_id,
      displayName: data.display_name,
      categoryId: data.category_id || '',
      category: category ? this.mapCategory(category) : undefined,
      description: data.description || undefined,
      icon: data.icon || undefined,
      complexityScore: data.complexity_score || 1,
      isPremium: data.is_premium || false,
      configuration: data.configuration as ComponentConfig || {},
      dependencies: data.dependencies as string[] || [],
      features: data.features as string[] || [],
      browserSupport: (data.browser_support as { chrome: boolean; firefox: boolean; safari: boolean; edge: boolean }) || {
        chrome: true,
        firefox: true,
        safari: true,
        edge: true
      },
      mobileReady: data.mobile_ready || true,
      accessibilityCompliant: data.accessibility_compliant || true,
      version: data.version || '1.0.0',
      isActive: data.is_active || true,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapTemplate(data: FeatureTemplateTable): FeatureTemplate {
    return {
      id: data.id,
      templateId: data.template_id,
      name: data.name,
      description: data.description || undefined,
      category: data.category || undefined,
      components: data.components as string[] || [],
      configuration: data.configuration as ComponentConfig || {},
      complexityScore: data.complexity_score || 1,
      useCase: data.use_case || undefined,
      previewImageUrl: data.preview_image_url || undefined,
      isActive: data.is_active || true,
      createdAt: new Date(data.created_at)
    }
  }
}

// Export singleton instance
export const componentLibraryService = new ComponentLibraryService()
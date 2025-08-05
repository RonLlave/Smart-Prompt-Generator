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
  [key: string]: unknown
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
  instanceId?: string
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  customConfig?: ComponentConfig
}

export interface ProjectComponent {
  id: string
  projectId: string
  componentType: string
  componentName?: string
  displayName?: string
  positionX: number
  positionY: number
  width: number
  height: number
  zIndex: number
  properties: ComponentConfig
  configuration?: ComponentConfig
  createdAt: Date
  updatedAt: Date
}
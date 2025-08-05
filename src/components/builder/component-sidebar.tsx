"use client"

import { useState, useMemo } from "react"
import { useDraggable } from "@dnd-kit/core"
import { Search, ChevronDown, ChevronRight, Star, Package, Zap, Crown, Code2 } from "lucide-react"
import { 
  useComponentsGroupedByCategory, 
  useComponentSearch, 
  usePopularComponents,
  useFeatureTemplates,
  type ComponentWithRelations,
  type CategoryWithComponents
} from "@/hooks/use-component-library"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface DraggableComponentProps {
  component: ComponentWithRelations
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: component.id,
    data: {
      type: 'component',
      component,
    },
  })

  const complexityColor = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800', 
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-red-100 text-red-800',
    5: 'bg-purple-100 text-purple-800'
  }[component.complexity_score || 1] || 'bg-gray-100 text-gray-800'

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex flex-col p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all hover:border-gray-300",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Component Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{component.icon || '📦'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {component.name}
              </h4>
              {component.is_premium && (
                <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            {component.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {component.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Component Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className={cn("text-xs px-1.5 py-0.5", complexityColor)}>
            L{component.complexity_score || 1}
          </Badge>
          {component.tags && component.tags.length > 0 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {component.tags[0]}
            </Badge>
          )}
        </div>
        
        {/* Relationships indicators */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {component.requires && component.requires.length > 0 && (
            <div className="w-2 h-2 bg-red-400 rounded-full" title={`Requires ${component.requires.length} component(s)`} />
          )}
          {component.recommends && component.recommends.length > 0 && (
            <div className="w-2 h-2 bg-blue-400 rounded-full" title={`Recommends ${component.recommends.length} component(s)`} />
          )}
        </div>
      </div>
    </div>
  )
}

interface CategorySectionProps {
  category: CategoryWithComponents
  isExpanded: boolean
  onToggle: () => void
}

function CategorySection({ category, isExpanded, onToggle }: CategorySectionProps) {
  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        className="w-full justify-between h-10 px-3 font-medium text-gray-700 hover:bg-gray-50"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          <span>{category.icon || '📁'}</span>
          <span>{category.name}</span>
          <Badge variant="secondary" className="text-xs">
            {category.component_count}
          </Badge>
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4">
          {category.components.map((component) => (
            <DraggableComponent key={component.id} component={component} />
          ))}
          {category.components.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ComponentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="pl-4 space-y-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ComponentSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("browse")

  // Data fetching
  const { 
    data: groupedComponents, 
    isLoading: isLoadingGrouped, 
    isError: isErrorGrouped 
  } = useComponentsGroupedByCategory({ 
    includeRelations: true,
    includeCategory: true,
    limit: 20
  })

  const { 
    data: searchResults, 
    isLoading: isSearching 
  } = useComponentSearch(
    searchQuery.trim() ? { search: searchQuery.trim() } : {},
    { 
      includeRelations: true,
      includeCategory: true,
      limit: 50
    }
  )

  const { 
    data: popularComponents, 
    isLoading: isLoadingPopular 
  } = usePopularComponents(6)

  const { 
    data: featureTemplates, 
    isLoading: isLoadingTemplates 
  } = useFeatureTemplates()

  // Filtered components based on search
  const filteredCategories = useMemo(() => {
    if (!groupedComponents) return []
    
    if (!searchQuery.trim()) {
      return groupedComponents
    }

    // If searching, show search results grouped by category
    const searchResultsByCategory: Record<string, ComponentWithRelations[]> = {}
    
    searchResults?.forEach(component => {
      const categoryId = component.category_id
      if (!searchResultsByCategory[categoryId]) {
        searchResultsByCategory[categoryId] = []
      }
      searchResultsByCategory[categoryId].push(component)
    })

    return groupedComponents.map(category => ({
      ...category,
      components: searchResultsByCategory[category.id] || [],
      component_count: searchResultsByCategory[category.id]?.length || 0
    })).filter(category => category.component_count > 0)
  }, [groupedComponents, searchResults, searchQuery])

  // Auto-expand categories when searching
  useMemo(() => {
    if (searchQuery.trim() && filteredCategories.length > 0) {
      const categoryIds = new Set(filteredCategories.map(cat => cat.id))
      setExpandedCategories(categoryIds)
    }
  }, [searchQuery, filteredCategories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const isLoading = isLoadingGrouped || isSearching

  if (isErrorGrouped) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 mb-4">Failed to load components</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Components</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
          <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
          <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <ComponentsLoadingSkeleton />
              ) : (
                <>
                  {searchQuery.trim() && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Found {searchResults?.length || 0} components matching &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  )}
                  
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No components found</p>
                      {searchQuery && (
                        <p className="text-xs mt-1">Try adjusting your search terms</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCategories.map((category) => (
                        <CategorySection
                          key={category.id}
                          category={category}
                          isExpanded={expandedCategories.has(category.id)}
                          onToggle={() => toggleCategory(category.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoadingPopular ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-medium text-gray-900">Popular Components</h3>
                  </div>
                  {popularComponents?.map((component) => (
                    <DraggableComponent key={component.id} component={component} />
                  ))}
                  {(!popularComponents || popularComponents.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No popular components yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoadingTemplates ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <h3 className="font-medium text-gray-900">Feature Templates</h3>
                  </div>
                  {featureTemplates?.map((template) => (
                    <div key={template.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          {template.description && (
                            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.components.length} components
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.components.slice(0, 3).map((comp) => (
                          <Badge key={comp.id} variant="secondary" className="text-xs">
                            {comp.name}
                          </Badge>
                        ))}
                        {template.components.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.components.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!featureTemplates || featureTemplates.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No templates available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { ComponentSidebar }
export default ComponentSidebar
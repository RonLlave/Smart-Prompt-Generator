"use client"

import { useComponentCategories, useComponents } from "@/hooks/use-component-library"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function ComponentsPage() {
  const { data: categories, isLoading: categoriesLoading } = useComponentCategories()
  const { data: components, isLoading: componentsLoading } = useComponents()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Component Library</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories?.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{category.icon}</span>
                  <h3 className="font-medium">{category.displayName}</h3>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Components</h2>
        {componentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components?.map((component) => (
              <div key={component.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{component.icon || '📦'}</span>
                    <h3 className="font-medium">{component.displayName}</h3>
                  </div>
                  {component.isPremium && (
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                  )}
                </div>
                {component.description && (
                  <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{'⭐'.repeat(component.complexityScore)}</span>
                  <span>v{component.version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
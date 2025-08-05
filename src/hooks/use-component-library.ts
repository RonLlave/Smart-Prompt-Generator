"use client"

import { useEffect } from 'react'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { 
  ComponentLibraryService, 
  type ComponentWithRelations,
  type CategoryWithComponents,
  type ComponentSearchFilters,
  type ComponentFetchOptions
} from '@/lib/services/component-library-service'

// Query keys for consistent caching
export const componentLibraryKeys = {
  all: ['componentLibrary'] as const,
  categories: () => [...componentLibraryKeys.all, 'categories'] as const,
  category: (categoryId: string) => [...componentLibraryKeys.all, 'category', categoryId] as const,
  component: (componentId: string) => [...componentLibraryKeys.all, 'component', componentId] as const,
  search: (filters: ComponentSearchFilters) => [...componentLibraryKeys.all, 'search', filters] as const,
  templates: () => [...componentLibraryKeys.all, 'templates'] as const,
  popular: (limit: number) => [...componentLibraryKeys.all, 'popular', limit] as const,
  tags: (tags: string[]) => [...componentLibraryKeys.all, 'tags', tags] as const,
  grouped: () => [...componentLibraryKeys.all, 'grouped'] as const,
}

const componentService = new ComponentLibraryService()

/**
 * Hook to fetch all component categories
 */
export function useComponentCategories() {
  return useQuery({
    queryKey: componentLibraryKeys.categories(),
    queryFn: () => componentService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch components by category
 */
export function useComponentsByCategory(
  categoryId: string,
  options: ComponentFetchOptions = {}
) {
  return useQuery({
    queryKey: [...componentLibraryKeys.category(categoryId), options],
    queryFn: () => componentService.getComponentsByCategory(categoryId, options),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to search components with filters
 */
export function useComponentSearch(
  filters: ComponentSearchFilters = {},
  options: ComponentFetchOptions = {}
) {
  return useQuery({
    queryKey: [...componentLibraryKeys.search(filters), options],
    queryFn: () => componentService.searchComponents(filters, options),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single component by ID
 */
export function useComponent(componentId: string) {
  return useQuery({
    queryKey: componentLibraryKeys.component(componentId),
    queryFn: () => componentService.getComponentById(componentId),
    enabled: !!componentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch feature templates
 */
export function useFeatureTemplates() {
  return useQuery({
    queryKey: componentLibraryKeys.templates(),
    queryFn: () => componentService.getFeatureTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes (templates change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch components grouped by category
 */
export function useComponentsGroupedByCategory(options: ComponentFetchOptions = {}) {
  return useQuery({
    queryKey: [...componentLibraryKeys.grouped(), options],
    queryFn: () => componentService.getComponentsGroupedByCategory(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch popular/recommended components
 */
export function usePopularComponents(limit: number = 10) {
  return useQuery({
    queryKey: componentLibraryKeys.popular(limit),
    queryFn: () => componentService.getPopularComponents(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch components by tags
 */
export function useComponentsByTags(
  tags: string[],
  options: ComponentFetchOptions = {}
) {
  return useQuery({
    queryKey: [...componentLibraryKeys.tags(tags), options],
    queryFn: () => componentService.getComponentsByTags(tags, options),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Infinite query hook for paginated component search
 */
export function useInfiniteComponentSearch(
  filters: ComponentSearchFilters = {},
  options: Omit<ComponentFetchOptions, 'offset'> = {}
) {
  const pageSize = options.limit || 20

  return useInfiniteQuery({
    queryKey: [...componentLibraryKeys.search(filters), 'infinite', options],
    queryFn: ({ pageParam = 0 }) => 
      componentService.searchComponents(filters, {
        ...options,
        offset: pageParam * pageSize,
        limit: pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined
      return allPages.length
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Infinite query hook for paginated category components
 */
export function useInfiniteComponentsByCategory(
  categoryId: string,
  options: Omit<ComponentFetchOptions, 'offset'> = {}
) {
  const pageSize = options.limit || 20

  return useInfiniteQuery({
    queryKey: [...componentLibraryKeys.category(categoryId), 'infinite', options],
    queryFn: ({ pageParam = 0 }) => 
      componentService.getComponentsByCategory(categoryId, {
        ...options,
        offset: pageParam * pageSize,
        limit: pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined
      return allPages.length
    },
    initialPageParam: 0,
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to prefetch component data
 */
export function usePrefetchComponents() {
  const queryClient = useQueryClient()

  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: componentLibraryKeys.categories(),
      queryFn: () => componentService.getCategories(),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchPopularComponents = (limit: number = 10) => {
    queryClient.prefetchQuery({
      queryKey: componentLibraryKeys.popular(limit),
      queryFn: () => componentService.getPopularComponents(limit),
      staleTime: 10 * 60 * 1000,
    })
  }

  const prefetchFeatureTemplates = () => {
    queryClient.prefetchQuery({
      queryKey: componentLibraryKeys.templates(),
      queryFn: () => componentService.getFeatureTemplates(),
      staleTime: 10 * 60 * 1000,
    })
  }

  const prefetchComponentsByCategory = (categoryId: string, options: ComponentFetchOptions = {}) => {
    queryClient.prefetchQuery({
      queryKey: [...componentLibraryKeys.category(categoryId), options],
      queryFn: () => componentService.getComponentsByCategory(categoryId, options),
      staleTime: 5 * 60 * 1000,
    })
  }

  return {
    prefetchCategories,
    prefetchPopularComponents,
    prefetchFeatureTemplates,
    prefetchComponentsByCategory,
  }
}

/**
 * Hook for component library mutations (if needed for future features)
 */
export function useComponentLibraryMutations() {
  const queryClient = useQueryClient()

  // Future mutations can be added here for features like:
  // - Adding components to favorites
  // - Rating components
  // - Submitting custom components
  
  const invalidateComponentData = () => {
    queryClient.invalidateQueries({ queryKey: componentLibraryKeys.all })
  }

  return {
    invalidateComponentData,
  }
}

/**
 * Hook to get cached component data without fetching
 */
export function useCachedComponent(componentId: string): ComponentWithRelations | undefined {
  const queryClient = useQueryClient()
  return queryClient.getQueryData(componentLibraryKeys.component(componentId))
}

/**
 * Hook to get cached category data without fetching
 */
export function useCachedCategories(): CategoryWithComponents[] | undefined {
  const queryClient = useQueryClient()
  return queryClient.getQueryData(componentLibraryKeys.categories())
}

/**
 * Custom hook for component library with smart caching and prefetching
 */
export function useComponentLibrary() {
  const categoriesQuery = useComponentCategories()
  const popularQuery = usePopularComponents(6)
  const templatesQuery = useFeatureTemplates()
  const prefetch = usePrefetchComponents()

  // Auto-prefetch popular categories when categories load
  useEffect(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      // Prefetch top 3 categories
      categoriesQuery.data.slice(0, 3).forEach(category => {
        prefetch.prefetchComponentsByCategory(category.id, { limit: 10 })
      })
    }
  }, [categoriesQuery.data, prefetch])

  return {
    categories: categoriesQuery,
    popular: popularQuery,
    templates: templatesQuery,
    prefetch,
    isLoading: categoriesQuery.isLoading || popularQuery.isLoading,
    isError: categoriesQuery.isError || popularQuery.isError,
    error: categoriesQuery.error || popularQuery.error,
  }
}

/**
 * Legacy hook alias for backward compatibility
 */
export const useComponents = useComponentLibrary
"use client"

import { useState } from 'react'
import { CheckSquare, Square, Users, Monitor, Server, Database, Palette, CheckCircle } from 'lucide-react'
import { AssistantType, ASSISTANT_TYPE_CONFIGS } from '@/lib/types/project-assistants'

interface AssistantTypeSelectorProps {
  selectedTypes: AssistantType[]
  onSelectionChange: (types: AssistantType[]) => void
  maxSelections?: number
}

const ICON_COMPONENTS = {
  Users,
  Monitor,
  Server,
  Database,
  Palette,
  CheckCircle
}

export function AssistantTypeSelector({ 
  selectedTypes, 
  onSelectionChange, 
  maxSelections = 6 
}: AssistantTypeSelectorProps) {
  const [showAll, setShowAll] = useState(false)
  
  const handleToggleType = (type: AssistantType) => {
    const isSelected = selectedTypes.includes(type)
    let newSelection: AssistantType[]
    
    if (isSelected) {
      // Remove from selection
      newSelection = selectedTypes.filter(t => t !== type)
    } else {
      // Add to selection (respect max limit)
      if (selectedTypes.length >= maxSelections) {
        return // Don't add if at max limit
      }
      newSelection = [...selectedTypes, type]
    }
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const allTypes = Object.keys(ASSISTANT_TYPE_CONFIGS) as AssistantType[]
    const typesToSelect = allTypes.slice(0, maxSelections)
    onSelectionChange(typesToSelect)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const assistantTypes = Object.entries(ASSISTANT_TYPE_CONFIGS) as [AssistantType, typeof ASSISTANT_TYPE_CONFIGS[AssistantType]][]
  const displayedTypes = showAll ? assistantTypes : assistantTypes.slice(0, 4)

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: isSelected 
        ? 'border-blue-500 bg-blue-900/30 text-blue-300' 
        : 'border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-300',
      green: isSelected 
        ? 'border-green-500 bg-green-900/30 text-green-300' 
        : 'border-gray-600 hover:border-green-400 text-gray-300 hover:text-green-300',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-900/30 text-purple-300' 
        : 'border-gray-600 hover:border-purple-400 text-gray-300 hover:text-purple-300',
      orange: isSelected 
        ? 'border-orange-500 bg-orange-900/30 text-orange-300' 
        : 'border-gray-600 hover:border-orange-400 text-gray-300 hover:text-orange-300',
      pink: isSelected 
        ? 'border-pink-500 bg-pink-900/30 text-pink-300' 
        : 'border-gray-600 hover:border-pink-400 text-gray-300 hover:text-pink-300',
      red: isSelected 
        ? 'border-red-500 bg-red-900/30 text-red-300' 
        : 'border-gray-600 hover:border-red-400 text-gray-300 hover:text-red-300'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Select Assistant Types</h3>
          <p className="text-sm text-gray-400">
            Choose which AI assistants you need for your project ({selectedTypes.length}/{maxSelections} selected)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={selectedTypes.length >= maxSelections}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            disabled={selectedTypes.length === 0}
            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Assistant Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedTypes.map(([type, config]) => {
          const isSelected = selectedTypes.includes(type)
          const canSelect = isSelected || selectedTypes.length < maxSelections
          const IconComponent = ICON_COMPONENTS[config.icon as keyof typeof ICON_COMPONENTS] || Users

          return (
            <div
              key={type}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                canSelect
                  ? getColorClasses(config.color, isSelected)
                  : 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              onClick={() => canSelect && handleToggleType(type)}
            >
              <div className="flex items-start gap-3">
                {/* Selection Indicator */}
                <div className="mt-1">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </div>

                {/* Icon */}
                <div className="mt-1">
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">
                    {config.label}
                  </h4>
                  <p className="text-xs opacity-75 leading-tight">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show More/Less Toggle */}
      {assistantTypes.length > 4 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-gray-600 hover:border-blue-500 rounded-lg transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${assistantTypes.length} Types`}
          </button>
        </div>
      )}

      {/* Selection Summary */}
      {selectedTypes.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-300 mb-2">
            <strong>{selectedTypes.length}</strong> assistant type{selectedTypes.length !== 1 ? 's' : ''} selected:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map(type => {
              const config = ASSISTANT_TYPE_CONFIGS[type]
              return (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    getColorClasses(config.color, true)
                  }`}
                >
                  {config.label}
                </span>
              )
            })}
          </div>
          {selectedTypes.length >= maxSelections && (
            <p className="text-xs text-yellow-300 mt-2">
              Maximum selection limit reached.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
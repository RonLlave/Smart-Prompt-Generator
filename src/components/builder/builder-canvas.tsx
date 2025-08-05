"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Trash2, Move } from "lucide-react"
import type { ComponentLibraryItem } from "@/types/components"

interface DroppedComponent {
  id: string
  component: ComponentLibraryItem
  position: { x: number; y: number }
}

interface BuilderCanvasProps {
  droppedComponents: DroppedComponent[]
  onRemoveComponent: (id: string) => void
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void
}

export function BuilderCanvas({ 
  droppedComponents, 
  onRemoveComponent,
  onUpdatePosition 
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  })

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  return (
    <div
      ref={setNodeRef}
      className={`relative border-2 border-dashed rounded-lg h-[calc(100vh-12rem)] overflow-hidden transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-gray-600 bg-gray-800'
      }`}
    >
      {droppedComponents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Move className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Drag components here to start building</p>
            <p className="text-gray-500 text-sm mt-2">Components will appear where you drop them</p>
          </div>
        </div>
      )}

      {droppedComponents.map((item) => (
        <div
          key={item.id}
          className={`absolute p-4 bg-gray-700 rounded-lg shadow-md border-2 cursor-move transition-all hover:shadow-lg ${
            selectedComponent === item.id ? 'border-primary' : 'border-gray-600'
          }`}
          style={{
            left: `${item.position.x}px`,
            top: `${item.position.y}px`,
          }}
          onClick={() => setSelectedComponent(item.id)}
          onMouseDown={(e) => {
            const startX = e.clientX - item.position.x
            const startY = e.clientY - item.position.y

            const handleMouseMove = (e: MouseEvent) => {
              const newX = Math.max(0, e.clientX - startX)
              const newY = Math.max(0, e.clientY - startY)
              onUpdatePosition(item.id, { x: newX, y: newY })
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.component.icon || '📦'}</span>
            <span className="font-medium text-white">{item.component.displayName}</span>
          </div>
          
          {item.component.description && (
            <p className="text-xs text-gray-400 mb-2">{item.component.description}</p>
          )}

          {selectedComponent === item.id && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveComponent(item.id)
                setSelectedComponent(null)
              }}
              className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/20 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
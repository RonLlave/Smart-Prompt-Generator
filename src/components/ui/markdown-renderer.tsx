"use client"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown parser for our specific format
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />)
        return
      }
      
      // Bold headers (**text**)
      const boldMatch = line.match(/^\*\*(.*?)\*\*(.*)$/)
      if (boldMatch) {
        elements.push(
          <div key={index} className="font-semibold text-white mt-4 mb-2">
            {boldMatch[1]}
            {boldMatch[2] && <span className="font-normal text-gray-300">{boldMatch[2]}</span>}
          </div>
        )
        return
      }
      
      // Bullet points (• text)
      const bulletMatch = line.match(/^•\s+(.*)$/)
      if (bulletMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-blue-400 mt-1 text-xs">•</span>
            <span className="text-gray-300 text-sm leading-relaxed">{bulletMatch[1]}</span>
          </div>
        )
        return
      }
      
      // Sub-bullet points with asterisk (* text)
      const subBulletMatch = line.match(/^\s+\*\s+(.*)$/)
      if (subBulletMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2 mb-1 ml-4">
            <span className="text-gray-500 mt-1 text-xs">◦</span>
            <span className="text-gray-400 text-sm leading-relaxed">{subBulletMatch[1]}</span>
          </div>
        )
        return
      }
      
      // Regular text
      if (line.trim()) {
        elements.push(
          <div key={index} className="text-gray-300 text-sm leading-relaxed mb-2">
            {line}
          </div>
        )
      }
    })
    
    return elements
  }
  
  return (
    <div className={className}>
      {parseMarkdown(content)}
    </div>
  )
}
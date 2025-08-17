import React from 'react'

interface DeckImageProps {
  deckName: string
  className?: string
  fallbackIcon?: string
}

function getDeckImagePath(deckName: string): string {
  // Convert deck name to filename format (lowercase, replace spaces with hyphens, add -deck suffix)
  const filename = deckName
    .toLowerCase()
    .replace(/\s*&\s*/g, '---') // Replace " & " with triple dashes
    .replace(/\s+/g, '-') // Replace spaces with single dashes
    .replace(/[^\w-]/g, '') // Remove special characters except hyphens
  
  return `/v2/decks/${filename}-deck.svg`
}

export function DeckImage({ deckName, className = '', fallbackIcon = '🃏' }: DeckImageProps) {
  const [imageError, setImageError] = React.useState(false)
  const imagePath = getDeckImagePath(deckName)

  // Reset error state when deck changes
  React.useEffect(() => {
    setImageError(false)
  }, [deckName])

  if (imageError) {
    // Fallback to icon display
    return (
      <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
        <span className="text-4xl">{fallbackIcon}</span>
      </div>
    )
  }

  return (
    <img
      src={imagePath}
      alt={deckName}
      className={`object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}
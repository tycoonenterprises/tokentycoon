import React from 'react'
import type { Card } from '@/stores/gameStore'

interface CardImageProps {
  card: Card
  className?: string
  fallbackIcon?: string
}

function getCardImagePath(cardName: string): string {
  // Convert card name to filename format (lowercase, replace spaces with hyphens, add -literal suffix)
  const filename = cardName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '') // Remove special characters except hyphens
  
  return `/v2/cards/${filename}-literal.svg`
}

export function CardImage({ card, className = '', fallbackIcon = '🃏' }: CardImageProps) {
  const [imageError, setImageError] = React.useState(false)
  const imagePath = getCardImagePath(card.name)
  

  // Reset error state when card changes
  React.useEffect(() => {
    setImageError(false)
  }, [card.name])

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
      alt={card.name}
      className={`object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}
import React, { useState, useEffect } from 'react'
import { useCardURI } from '@/lib/hooks/useNFTCardsContract'
import type { OnChainCardMetadata } from '@/lib/hooks/useNFTCardsContract'
import { getAssetUrl } from '@/lib/utils/assets'

interface OnChainCardImageProps {
  card: OnChainCardMetadata
  className?: string
  fallbackIcon?: string
  useFallback?: boolean
}

// SVG data URL decoder
function decodeSVGFromURI(uri: string): string | null {
  try {
    if (!uri) return null

    // Check if it's a data URI
    if (uri.startsWith('data:')) {
      const parts = uri.split(',')
      if (parts.length < 2) return null

      const data = parts[1]
      const decoded = atob(data) // Base64 decode

      // Parse JSON metadata
      const metadata = JSON.parse(decoded)
      
      // Extract SVG from image field (should be data:image/svg+xml;base64,...)
      if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
        const svgBase64 = metadata.image.split(',')[1]
        return atob(svgBase64)
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to decode SVG from URI:', error)
    return null
  }
}

// Fallback to static file
function getStaticCardImagePath(cardName: string): string {
  const filename = cardName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
  
  return getAssetUrl(`v2/cards/${filename}-literal.svg`)
}

export function OnChainCardImage({ 
  card, 
  className = '', 
  fallbackIcon = '🃏',
  useFallback = false 
}: OnChainCardImageProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [useStatic, setUseStatic] = useState(useFallback)
  
  // Fetch on-chain URI
  const { uri, isLoading: isLoadingURI, error: uriError } = useCardURI(card.cardId)
  
  // Try to extract SVG from URI
  useEffect(() => {
    if (uri && !useStatic) {
      const decoded = decodeSVGFromURI(uri)
      if (decoded) {
        setSvgContent(decoded)
        setImageError(false)
      } else {
        console.log(`No valid SVG found in URI for card ${card.cardId}, falling back to static`)
        setUseStatic(true)
      }
    }
  }, [uri, card.cardId, useStatic])

  // Handle URI loading error
  useEffect(() => {
    if (uriError) {
      console.log(`URI error for card ${card.cardId}, falling back to static:`, uriError)
      setUseStatic(true)
    }
  }, [uriError, card.cardId])

  // Reset error states when card changes
  useEffect(() => {
    setImageError(false)
    setSvgContent(null)
    setUseStatic(useFallback)
  }, [card.cardId, useFallback])

  // Loading state
  if (isLoadingURI && !useStatic) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 animate-pulse ${className}`}>
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show on-chain SVG if available
  if (svgContent && !imageError && !useStatic) {
    return (
      <div 
        className={`${className}`}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      />
    )
  }

  // Fallback to static file
  if (useStatic && !imageError) {
    return (
      <img
        src={getStaticCardImagePath(card.name)}
        alt={card.name}
        className={`object-cover ${className}`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    )
  }

  // Ultimate fallback to emoji
  return (
    <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
      <span className="text-4xl">{fallbackIcon}</span>
      <div className="absolute bottom-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
        {card.cardId}
      </div>
    </div>
  )
}

// Hybrid component that intelligently chooses between on-chain and static
export function SmartCardImage({ 
  card, 
  className = '', 
  fallbackIcon = '🃏',
  preferOnChain = true 
}: OnChainCardImageProps & { preferOnChain?: boolean }) {
  // For now, we'll try on-chain first, then fallback to static
  // In the future, we can add logic to prefer one over the other based on card.finalized status
  
  const shouldUseOnChain = preferOnChain && card.finalized && card.name

  return (
    <OnChainCardImage
      card={card}
      className={className}
      fallbackIcon={fallbackIcon}
      useFallback={!shouldUseOnChain}
    />
  )
}
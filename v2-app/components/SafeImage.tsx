// components/SafeImage.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: React.ReactNode
}

export const SafeImage = ({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = "",
  fallback 
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false)

  // Vérifications plus robustes
  if (hasError || !src) {
    return fallback || (
      <div className={`${className} bg-gradient-to-br from-[#B08D57] to-[#8B6B3D] rounded-full flex items-center justify-center text-white`}>
        {alt?.charAt(0) || '?'}
      </div>
    )
  }

  const isExternalImage = src.startsWith('http') || src.startsWith('https')
  
  // Pour les images externes, utilisez img normal
  if (isExternalImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        style={{ 
          width: width !== 400 ? `${width}px` : 'auto',
          height: height !== 300 ? `${height}px` : 'auto'
        }}
      />
    )
  }

  // Pour les images locales, utilisez Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
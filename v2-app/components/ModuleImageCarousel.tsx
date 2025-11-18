// components/ModuleImageCarousel.tsx
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { SafeImage } from "./SafeImage"

interface ModuleImageCarouselProps {
  images: string[] | undefined
  className?: string
}

export function ModuleImageCarousel({ images, className = "" }: ModuleImageCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  // Vérification plus robuste
  if (!images || !Array.isArray(images) || images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-2xl ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-500">Aucune image disponible</p>
        </div>
      </div>
    )
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className={`w-full max-w-4xl mx-auto ${className}`}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {images.map((imageUrl, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="flex items-center justify-center bg-transparent rounded-2xl overflow-hidden">
                <div className="flex items-center justify-center h-96 w-full bg-transparent">
                  <SafeImage
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    width={600}
                    height={400}
                    fallback={
                      <div className="flex items-center justify-center h-full w-full bg-gray-200 rounded-lg">
                        <span className="text-gray-500">Image non disponible</span>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious className="ml-4" />
          <CarouselNext className="mr-4" />
        </>
      )}
    </Carousel>
  )
}
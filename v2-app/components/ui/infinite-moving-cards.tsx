"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

// Ajoutez cette prop à votre composant existant
interface InfiniteMovingCardsProps {
  items: {
    quote?: string
    name: string
    title?: string
    image?: string // Nouvelle prop pour les images
  }[]
  direction?: "left" | "right"
  speed?: "fast" | "normal" | "slow"
  pauseOnHover?: boolean
  className?: string
  isImageGallery?: boolean // Nouvelle prop pour la galerie d'images
}

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  isImageGallery = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  const duplicatedItems = [...items, ...items];

  // Set animationDuration based on speed prop
  let animationDuration = "40s";
  if (speed === "fast") {
    animationDuration = "20s";
  } else if (speed === "slow") {
    animationDuration = "80s";
  }

  return (
    <div
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap"
        )}
        style={{
          animationDuration,
          animationDirection: direction === "left" ? "reverse" : "normal",
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <li
            className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
            style={{
              background: "rgb(4,7,29)",
              backgroundColor: "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
            }}
            key={idx}
          >
            <blockquote>
              {isImageGallery && item.image ? (
                // Affichage image pour la galerie
                <div className="relative h-64 w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                // Affichage texte normal pour les témoignages
                <>
                  <div
                    aria-hidden="true"
                    className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                  ></div>
                  <span className=" relative z-20 text-sm leading-[1.6] text-gray-100 font-normal">
                    {item.quote}
                  </span>
                  <div className="relative z-20 mt-6 flex flex-row items-center">
                    <span className="flex flex-col gap-1">
                      <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                        {item.name}
                      </span>
                      <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                        {item.title}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

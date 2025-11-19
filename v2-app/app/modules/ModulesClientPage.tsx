// app/modules/ModulesClientPage.tsx
'use client'
import { motion } from "framer-motion"
import { HeroHeader } from "../../components/hero-header"
import { SafeImage } from "../../components/SafeImage"
import { useContent } from "../../app/hooks/useContent"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ModuleImageCarousel } from "@/components/ModuleImageCarousel"

export default function ModulesClientPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const { modules, loading } = useContent()
  const searchParams = useSearchParams()
  const scrollToModule = searchParams.get('scrollTo')
  const moduleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [hasScrolled, setHasScrolled] = useState(false)

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const themeColors = {
    dark: {
      background: 'from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
      text: 'text-white',
      card: 'bg-[#2D3A25]/50 border-[#3E4C22]',
      section: 'bg-[#1A1F16]'
    },
    light: {
      background: 'from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
      text: 'text-[#2D3A25]',
      card: 'bg-white/50 border-[#D4B483]',
      section: 'bg-[#F5F1E8]'
    }
  }

  const currentTheme = themeColors[theme]

  // Scroll vers un module spécifique
  useEffect(() => {
    if (scrollToModule && !loading && modules.length > 0 && !hasScrolled) {
      const timer = setTimeout(() => {
        const element = moduleRefs.current[scrollToModule]
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          setHasScrolled(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [scrollToModule, loading, modules, hasScrolled])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#B08D57]"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <HeroHeader theme={theme} toggleTheme={toggleTheme} whatsappNumber="+221771234567" />

      {/* Hero Section */}
      <section className={`min-h-[50vh] flex items-center justify-center bg-gradient-to-b ${currentTheme.background} overflow-hidden text-center px-6 pt-24`}>
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl md:text-6xl font-bold ${currentTheme.text} mb-8`}
          >
            Tous Nos Modules
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl ${currentTheme.text} opacity-90`}
          >
            Découvrez en détail toutes nos formations artisanales
          </motion.p>
        </div>
      </section>

      {/* Modules Sections */}
      <div className="space-y-0">
        {modules.map((module, index) => (
          // Remplacer la section de chaque module par :
<section
  key={module.id}
  id={module.slug}
  ref={el => { moduleRefs.current[module.slug] = el as HTMLDivElement | null; }}
  className={`py-20 ${index % 2 === 0 ? currentTheme.section : theme === 'dark' ? 'bg-[#0F1411]' : 'bg-gray-50'} transition-colors duration-500`}
>
  <div className="max-w-7xl mx-auto px-6">
    {/* Icône et Titre */}
<div className="flex items-center gap-4 mb-8 text-center justify-center">
  <SafeImage
    src={module.iconSrc} // Utilise la vraie icône
    alt={module.title}
    className="w-20 h-20 rounded-full object-cover border-2 border-[#B08D57] shadow-lg"
    width={80}
    height={80}
    fallback={
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
        {module.title?.charAt(0) || '?'}
      </div>
    }
  />
  <h2 className={`text-4xl md:text-5xl font-bold ${currentTheme.text}`}>
    {module.title}
  </h2>
</div>

    {/* Description */}
    <div className="max-w-4xl mx-auto mb-12">
      <p className={`text-xl ${currentTheme.text} leading-relaxed text-center`}>
        {module.longDesc || module.shortDesc}
      </p>
    </div>

{/* Gallery d'images - Carousel */}
{module.gallery && Array.isArray(module.gallery) && module.gallery.length > 0 ? (
  <div className="mb-12">
    <ModuleImageCarousel images={module.gallery} />
  </div>
) : (
  <div className={`h-96 rounded-2xl ${currentTheme.card} flex items-center justify-center mb-12`}>
    <div className="text-center">
      <div className="text-6xl mb-4">🖼️</div>
      <p className={currentTheme.text}>Galerie d'images à venir</p>
    </div>
  </div>
)}

    {/* Informations détaillées */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div className={`p-6 rounded-lg ${currentTheme.card} text-center`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Durée</div>
        <div className={`font-semibold text-xl ${currentTheme.text}`}>{module.duration}</div>
      </div>
      <div className={`p-6 rounded-lg ${currentTheme.card} text-center`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Niveau</div>
        <div className={`font-semibold text-xl ${currentTheme.text}`}>{module.level}</div>
      </div>
      <div className={`p-6 rounded-lg ${currentTheme.card} text-center`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Catégorie</div>
        <div className={`font-semibold text-xl ${currentTheme.text}`}>{module.category}</div>
      </div>
      <div className={`p-6 rounded-lg ${currentTheme.card} text-center`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Prix</div>
        <div className={`font-semibold text-xl ${theme === 'dark' ? 'text-[#D4B483]' : 'text-[#5D7B46]'}`}>
          {module.price ? new Intl.NumberFormat('fr-FR').format(module.price) + ' FCFA' : 'Sur demande'}
        </div>
      </div>
    </div>
  </div>
</section>
        ))}
      </div>
    </div>
  )
}

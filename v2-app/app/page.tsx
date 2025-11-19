'use client'
import { motion } from "motion/react"
import { HeroHeader } from "../components/hero-header"
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards"
import React from "react"
import { useContent } from "./hooks/useContent"
import Link from "next/link"
import { ModulesSection } from "../components/ModulesSection"



export default function Home() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')
  const { contentSections, modules, testimonials, whatsappNumber, loading, error } = useContent()

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Couleurs artisanales pour les deux thèmes
  const themeColors = {
    dark: {
      background: 'from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
      textGradient: 'from-[#D4B483] via-[#B08D57] to-[#8B6B3D]',
      button: {
        bg: 'bg-[#B08D57]',
        hover: 'hover:bg-[#8B6B3D]',
        text: 'text-white'
      },
      text: 'text-white',
      card: 'bg-[#2D3A25]/50 border-[#3E4C22]',
      section: 'bg-[#1A1F16]'
    },
    light: {
      background: 'from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
      textGradient: 'from-[#5D7B46] via-[#3E4C22] to-[#2D3A25]',
      button: {
        bg: 'bg-[#5D7B46]',
        hover: 'hover:bg-[#3E4C22]',
        text: 'text-white'
      },
      text: 'text-[#2D3A25]',
      card: 'bg-white/50 border-[#D4B483]',
      section: 'bg-[#F5F1E8]'
    }
  }

  const currentTheme = themeColors[theme]

  // Données par défaut en attendant Firebase
  const defaultContentSections = {
    hero_description: {
      id: '1',
      key: 'hero_description',
      title: 'Description Principale',
      content: 'Un espace de formation et d\'expression dédié à toutes les formes de savoir-faire pratiques. Des activités manuelles et créatives, aux réalisations artisanales en passant par des techniques avancées proches des métiers d\'usine et de production, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.',
      updatedAt: new Date()
    },
    formations_description: {
      id: '2',
      key: 'formations_description',
      title: 'Description Formations',
      content: 'Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda\'Art vous accompagne pas à pas dans un cadre convivial et motivant. Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs.',
      updatedAt: new Date()
    },
    marketplace_description: {
      id: '3',
      key: 'marketplace_description',
      title: 'Description Marketplace',
      content: 'Découvrez un espace dédié où nos apprenants peuvent trouver leurs premiers clients et où les amateurs d\'artisanat peuvent acquérir des pièces uniques et authentiques.',
      updatedAt: new Date()
    },
    testimonials_description: {
      id: '4',
      key: 'testimonials_description',
      title: 'Description Témoignages',
      content: 'Découvrez les retours d\'expérience de nos apprenants et artisans qui ont transformé leur passion en réalité.',
      updatedAt: new Date()
    }
  }

  const displayContent = Object.keys(contentSections).length > 0 ? contentSections : defaultContentSections
  const displayModules = modules.length > 0 ? modules : []
  const displayTestimonials = testimonials.length > 0 ? testimonials : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#B08D57]"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <HeroHeader theme={theme} toggleTheme={toggleTheme} whatsappNumber={whatsappNumber} />
      
      {/* Section Hero */}
      <section id="accueil" className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${currentTheme.background} overflow-hidden text-center px-6 pt-24`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center justify-center gap-4 text-center"
          >
           <h1 className={`text-4xl md:text-6xl font-bold ${currentTheme.text}`}>Bienvenue chez Lambda'Art</h1>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-2xl md:text-3xl tracking-tight bg-clip-text bg-gradient-to-r ${currentTheme.textGradient} text-transparent font-semibold mb-8 mt-4`}
          >
            Imagination - Création - Découverte de soi
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-6 md:p-8 mb-8 shadow-xl`}
          >
            <p className={`${currentTheme.text} text-base md:text-lg leading-relaxed`}>
              {displayContent.hero_description?.content}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <Link href="/inscriptions">
              <button className={`${currentTheme.button.bg} ${currentTheme.button.hover} ${currentTheme.button.text} font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}>
                Rejoindre Lambda'Art
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section Formations */}
      <ModulesSection theme={theme} />

      {/* Section Marketplace */}
      <section id="marketplace" className={`py-20 ${theme === 'dark' ? 'bg-[#0F1411]' : 'bg-gray-50'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-6`}>
              Notre Marketplace
            </h2>
            <p className={`text-base md:text-lg ${currentTheme.text} max-w-2xl mx-auto leading-relaxed`}>
              {displayContent.marketplace_description?.content}
            </p>
          </motion.div>

          {/* Placeholder pour la marketplace - à développer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-12`}>
              <p className={`${currentTheme.text} text-lg mb-6`}>
                Notre marketplace est en cours de développement. Bientôt, vous pourrez découvrir et acheter les créations de nos artisans !
              </p>
              <button className={`${currentTheme.button.bg} ${currentTheme.button.hover} ${currentTheme.button.text} font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg opacity-50 cursor-not-allowed`} disabled>
                Bientôt disponible
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="temoignages" className={`py-20 ${currentTheme.section} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-6`}>
              Témoignages de nos Apprenants
            </h2>
            <p className={`text-base md:text-lg ${currentTheme.text} max-w-2xl mx-auto leading-relaxed`}>
              {displayContent.testimonials_description?.content}
            </p>
          </motion.div>

          {displayTestimonials.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[30rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden"
            >
              <InfiniteMovingCardsDemo items={displayTestimonials} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-8`}>
                <p className={`${currentTheme.text} text-lg mb-6`}>
                  Soyez le premier à partager votre expérience avec Lambda'Art !
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/faq#temoignages">
              <button className={`${currentTheme.button.bg} ${currentTheme.button.hover} ${currentTheme.button.text} font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg mr-4`}>
                Laisser un avis
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-[#1A1F16] text-white' : 'bg-[#2D3A25] text-white'} py-12 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4">Lambda'Art</h3>
            <p className="opacity-80">Votre espace de formation et d'expression artisanale</p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Contacts</h4>
            <p className="opacity-80">+229 0153 72 74 79 / +229 0194 57 7457</p>
            <p className="opacity-80">lambdaart17@gmail.com</p>
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <p className="opacity-80">&copy; 2025 Lambda'Art. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Composant InfiniteMovingCards adapté pour les témoignages
function InfiniteMovingCardsDemo({ items }: { items: any[] }) {
  const testimonialsForCards = items.map(item => ({
    quote: item.quote,
    name: item.name,
    title: item.title
  }))

  return (
    <div className="h-full rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden w-full">
      <InfiniteMovingCards
        items={testimonialsForCards}
        direction="left"
        speed="normal"
        pauseOnHover={true}
      />
    </div>
  )
}
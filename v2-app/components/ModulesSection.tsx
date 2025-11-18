// components/ModulesSection.tsx
'use client'
import { motion } from "framer-motion"
import Link from "next/link"
import { useContent } from "@/app/hooks/useContent"
import { SafeImage } from "./SafeImage"

export const ModulesSection = ({ theme }: { theme: 'light' | 'dark' }) => {
  const { modules, loading } = useContent()
  
  const themeColors = {
    dark: { text: 'text-white' },
    light: { text: 'text-[#2D3A25]' }
  }

  const currentTheme = themeColors[theme]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B08D57]"></div>
      </div>
    )
  }

  return (
    <section id="formations" className={`py-20 ${theme === 'dark' ? 'bg-[#1A1F16]' : 'bg-[#F5F1E8]'} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-6`}>
            Nos Modules de Formation
          </h2>
          <p className={`text-base md:text-lg ${currentTheme.text} max-w-2xl mx-auto leading-relaxed`}>
            Découvrez nos formations artisanales complètes conçues pour transformer votre passion en expertise.
          </p>
        </motion.div>

        {/* Grille pour tous les modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/modules?scrollTo=${module.slug}`}>
                <div className={`backdrop-blur-sm rounded-xl border-2 ${theme === 'dark' ? 'bg-[#2D3A25]/50 border-[#3E4C22]' : 'bg-white/50 border-[#D4B483]'} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer h-full flex flex-col`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <SafeImage
                        src={module.iconSrc}
                        alt={module.title}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#B08D57] group-hover:scale-110 transition-transform duration-300"
                        width={64}
                        height={64}
                        fallback={
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B08D57] to-[#8B6B3D] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                            {module.title?.charAt(0) || '?'}
                          </div>
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#2D3A25]'} mb-2`}>
                        {module.title}
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed mb-2`}>
                        {module.shortDesc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-[#3E4C22] text-[#D4B483]' : 'bg-[#E8DFCA] text-[#5D7B46]'}`}>
                        {module.level || 'Tous niveaux'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/modules">
            <button className={`${theme === 'dark' ? 'bg-[#B08D57] hover:bg-[#8B6B3D]' : 'bg-[#5D7B46] hover:bg-[#3E4C22]'} text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}>
              Voir tous les modules en détail
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
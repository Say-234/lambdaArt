'use client';
import { motion } from "framer-motion";
import { useContent } from "../hooks/useContent";
import Link from "next/link";
import { useState } from "react";
import { HeroHeader } from "../../components/hero-header";
import { FiChevronDown, FiChevronUp, FiMessageCircle, FiHelpCircle, FiStar } from "react-icons/fi";

export default function FAQPage() {
  const { faqs, testimonials, whatsappNumber } = useContent();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    email: '',
    title: '',
    quote: '',
    rating: 5,
    moduleId: ''
  });
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTestimonial(true);

    try {
      // Sauvegarder le témoignage en base de données
      await saveTestimonialToDatabase({
        ...testimonialForm,
        isApproved: false, // En attente de validation par l'admin
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 jours
      });

      // Réinitialiser le formulaire
      setTestimonialForm({
        name: '',
        email: '',
        title: '',
        quote: '',
        rating: 5,
        moduleId: ''
      });
      
      setShowTestimonialForm(false);
      alert('✅ Merci pour votre témoignage ! Il sera publié après validation.');
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi du témoignage. Veuillez réessayer.');
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  const saveTestimonialToDatabase = async (testimonialData: any) => {
    // Simulation - À remplacer par votre appel Firebase
    console.log('Témoignage sauvegardé:', testimonialData);
    // await addDoc(collection(db, 'testimonials'), testimonialData);
  };

  // Couleurs artisanales cohérentes avec le reste de l'app
  const themeColors = {
    dark: {
      background: 'from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
      text: 'text-white',
      card: 'bg-[#2D3A25]/80 border-[#3E4C22]',
      button: 'bg-[#B08D57] hover:bg-[#8B6B3D] text-white',
      textGradient: 'from-[#D4B483] via-[#B08D57] to-[#8B6B3D]',
      section: 'bg-[#1A1F16]'
    },
    light: {
      background: 'from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
      text: 'text-[#2D3A25]',
      card: 'bg-white/80 border-[#D4B483]',
      button: 'bg-[#5D7B46] hover:bg-[#3E4C22] text-white',
      textGradient: 'from-[#5D7B46] via-[#3E4C22] to-[#2D3A25]',
      section: 'bg-[#F5F1E8]'
    }
  };

  const currentTheme = themeColors[theme];
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <HeroHeader theme={theme} toggleTheme={toggleTheme} whatsappNumber={whatsappNumber} />
      
      {/* Section Hero FAQ */}
      <section className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${currentTheme.background} overflow-hidden text-center px-6 pt-24`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center justify-center gap-4 text-center"
          >
            <h1 className={`text-4xl md:text-6xl font-bold ${currentTheme.text}`}>
              Foire Aux Questions
            </h1>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-2xl md:text-3xl tracking-tight bg-clip-text bg-gradient-to-r ${currentTheme.textGradient} text-transparent font-semibold mb-8 mt-4`}
          >
            Trouvez rapidement vos réponses
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-6 md:p-8 mb-8 shadow-xl`}
          >
            <p className={`${currentTheme.text} text-base md:text-lg leading-relaxed`}>
              Vous avez des questions sur nos formations, les inscriptions ou les paiements ? 
              Consultez notre FAQ complète pour trouver toutes les réponses dont vous avez besoin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section FAQ Détaillée */}
      <section className={`py-20 ${currentTheme.section} transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto px-6">
          {/* FAQ par Catégories */}
          <div className="space-y-8">
            {categories.map((category, categoryIndex) => {
              const categoryFAQs = faqs.filter(faq => faq.category === category && faq.isActive);
              if (categoryFAQs.length === 0) return null;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className={`rounded-2xl border ${currentTheme.card} p-6 backdrop-blur-sm`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text} capitalize flex items-center gap-3`}>
                    {category === 'formations' && <><FiHelpCircle className="text-[#B08D57]" /> Formations & Ateliers</>}
                    {category === 'inscriptions' && <><FiHelpCircle className="text-[#B08D57]" /> Inscriptions & Prérequis</>}
                    {category === 'paiement' && <><FiHelpCircle className="text-[#B08D57]" /> Paiement & Financement</>}
                    {!['formations', 'inscriptions', 'paiement'].includes(category) && 
                      <><FiHelpCircle className="text-[#B08D57]" /> {category}</>}
                  </h2>

                  <div className="space-y-4">
                    {categoryFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                        className={`border rounded-xl ${theme === 'dark' ? 'border-[#3E4C22]' : 'border-[#D4B483]'}`}
                      >
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className={`w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-all ${
                            theme === 'dark' ? 'hover:bg-[#3E4C22]' : 'hover:bg-[#E8DFCA]'
                          }`}
                        >
                          <span className={`font-semibold pr-4 ${currentTheme.text}`}>
                            {faq.question}
                          </span>
                          {openItems.has(faq.id) ? 
                            <FiChevronUp className={`flex-shrink-0 ${currentTheme.text}`} /> : 
                            <FiChevronDown className={`flex-shrink-0 ${currentTheme.text}`} />
                          }
                        </button>
                        
                        {openItems.has(faq.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-4"
                          >
                            <p className={`${currentTheme.text} opacity-80 leading-relaxed`}>
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Section Témoignages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${currentTheme.text}`}>
                💬 Partagez votre expérience
              </h2>
              <p className={`${currentTheme.text} text-lg max-w-2xl mx-auto`}>
                Votre avis compte ! Partagez votre expérience avec Lambda'Art et inspirez d'autres passionnés.
              </p>
            </div>

            {!showTestimonialForm ? (
              <div className={`rounded-2xl border ${currentTheme.card} p-8 backdrop-blur-sm text-center`}>
                <FiMessageCircle className={`text-4xl mx-auto mb-4 ${theme === 'dark' ? 'text-[#B08D57]' : 'text-[#5D7B46]'}`} />
                <h3 className={`text-2xl font-bold mb-4 ${currentTheme.text}`}>
                  Laisser un témoignage
                </h3>
                <p className={`${currentTheme.text} mb-6 leading-relaxed`}>
                  Vous avez suivi une de nos formations ? Partagez votre retour d'expérience 
                  pour aider la communauté à faire son choix.
                </p>
                <button
                  onClick={() => setShowTestimonialForm(true)}
                  className={`${currentTheme.button} font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  Rédiger mon témoignage
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`rounded-2xl border ${currentTheme.card} p-8 backdrop-blur-sm`}
              >
                <h3 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>
                  Votre témoignage
                </h3>
                
                <form onSubmit={handleTestimonialSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                        Votre nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={testimonialForm.name}
                        onChange={(e) => setTestimonialForm(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full p-3 border rounded-md ${theme === 'dark' ? 'bg-[#1A1F16] border-[#3E4C22] text-white' : 'bg-white border-[#D4B483] text-[#2D3A25]'}`}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                        Votre email *
                      </label>
                      <input
                        type="email"
                        required
                        value={testimonialForm.email}
                        onChange={(e) => setTestimonialForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full p-3 border rounded-md ${theme === 'dark' ? 'bg-[#1A1F16] border-[#3E4C22] text-white' : 'bg-white border-[#D4B483] text-[#2D3A25]'}`}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                      Titre de votre témoignage *
                    </label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.title}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full p-3 border rounded-md ${theme === 'dark' ? 'bg-[#1A1F16] border-[#3E4C22] text-white' : 'bg-white border-[#D4B483] text-[#2D3A25]'}`}
                      placeholder="Ex: Formation exceptionnelle !"
                    />
                  </div>

                  <div>
                    <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                      Votre avis *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={testimonialForm.quote}
                      onChange={(e) => setTestimonialForm(prev => ({ ...prev, quote: e.target.value }))}
                      className={`w-full p-3 border rounded-md ${theme === 'dark' ? 'bg-[#1A1F16] border-[#3E4C22] text-white' : 'bg-white border-[#D4B483] text-[#2D3A25]'}`}
                      placeholder="Partagez votre expérience avec nos formations..."
                    />
                  </div>

                  <div>
                    <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                      Note *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTestimonialForm(prev => ({ ...prev, rating: star }))}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <FiStar
                            className={`w-8 h-8 ${
                              star <= testimonialForm.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTestimonialForm(false)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                        theme === 'dark' 
                          ? 'bg-[#2D3A25] hover:bg-[#3E4C22] text-white' 
                          : 'bg-[#E8DFCA] hover:bg-[#D4B483] text-[#2D3A25]'
                      }`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTestimonial}
                      className={`${currentTheme.button} font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none`}
                    >
                      {isSubmittingTestimonial ? 'Envoi en cours...' : 'Publier mon témoignage'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
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
  );
}
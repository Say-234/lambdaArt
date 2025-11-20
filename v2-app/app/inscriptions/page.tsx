'use client';
// app/inscription/page.tsx

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from "framer-motion"
import { HeroHeader } from "../../components/hero-header"
import { useContent } from "../hooks/useContent"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
  price: number;
}

interface Etablissement {
  id: string;
  nom: string;
  ville: string;
  contact: string;
}

function InscriptionPageContent() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const { modules, whatsappNumber, loading } = useContent()
  const registrationFormRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams()

  const [registrationForm, setRegistrationForm] = useState({
    nom: '',
    prenom: '',
    countryCode: '+229',
    contact: '',
    email: '',
    modulesSouhaites: [] as string[],
    etablissement: '',
    ville: '',
  });
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationSubmitMessage, setRegistrationSubmitMessage] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loadingEtablissements, setLoadingEtablissements] = useState(true);

  // Récupérer l'établissement depuis l'URL
  const etablissementFromUrl = searchParams.get('etablissement')

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Charger la liste des établissements
  useEffect(() => {
    const fetchEtablissements = async () => {
      try {
        // Simuler le chargement depuis Firebase
        const fakeEtablissements: Etablissement[] = [
          { id: '1', nom: 'Centre Artisanal de Cotonou', ville: 'Cotonou', contact: '+229 01 02 03 04' },
          { id: '2', nom: 'Atelier Créatif de Porto-Novo', ville: 'Porto-Novo', contact: '+229 05 06 07 08' },
          { id: '3', nom: 'Espace Formation Parakou', ville: 'Parakou', contact: '+229 09 10 11 12' },
          { id: '4', nom: 'Centre Lambda\'Art Abomey', ville: 'Abomey', contact: '+229 13 14 15 16' },
          { id: '5', nom: 'Autre établissement', ville: '', contact: '' }
        ];
        setEtablissements(fakeEtablissements);
        
        // Si un établissement est spécifié dans l'URL, le pré-remplir
        if (etablissementFromUrl) {
          const etab = fakeEtablissements.find(e => e.id === etablissementFromUrl);
          if (etab) {
            setRegistrationForm(prev => ({
              ...prev,
              etablissement: etab.id,
              ville: etab.ville
            }));
          }
        }
      } catch (error) {
        console.error('Erreur chargement établissements:', error);
      } finally {
        setLoadingEtablissements(false);
      }
    };

    fetchEtablissements();
  }, [etablissementFromUrl]);

  // Calcul du prix total
  const totalPrice = useMemo(() => {
    return registrationForm.modulesSouhaites.reduce((total, slug) => {
      const module = modules.find(m => m.slug === slug);
      return total + (module?.price || 0);
    }, 0);
  }, [registrationForm.modulesSouhaites, modules]);

  const themeColors = {
    dark: {
      background: 'from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
      text: 'text-white',
      card: 'bg-[#2D3A25]/50 border-[#3E4C22]',
      input: 'bg-[#2D3A25] border-[#3E4C22] text-white placeholder-gray-400'
    },
    light: {
      background: 'from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
      text: 'text-[#2D3A25]',
      card: 'bg-white/50 border-[#D4B483]',
      input: 'bg-white border-[#D4B483] text-[#2D3A25] placeholder-gray-600'
    }
  }

  const currentTheme = themeColors[theme]

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si l'établissement change, mettre à jour automatiquement la ville
    if (name === 'etablissement' && value) {
      const etabSelectionne = etablissements.find(e => e.id === value);
      setRegistrationForm(prev => ({
        ...prev,
        [name]: value,
        ville: etabSelectionne?.ville || ''
      }));
    } else {
      setRegistrationForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleModuleSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setRegistrationForm(prev => {
      const newModules = checked
        ? [...prev.modulesSouhaites, value]
        : prev.modulesSouhaites.filter(slug => slug !== value);
      return { ...prev, modulesSouhaites: newModules };
    });
  };

  const getWhatsappLink = (number: string, message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const cleanedNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
  };

  const handleRegistrationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingRegistration(true);
    setRegistrationSubmitMessage(null);

    // Validation
    if (!registrationForm.nom || !registrationForm.prenom || !registrationForm.contact || registrationForm.modulesSouhaites.length === 0) {
      setRegistrationSubmitMessage("Erreur: Veuillez remplir tous les champs obligatoires et sélectionner au moins un module.");
      setIsSubmittingRegistration(false);
      return;
    }

    if (!registrationForm.etablissement) {
      setRegistrationSubmitMessage("Erreur: Veuillez sélectionner un établissement.");
      setIsSubmittingRegistration(false);
      return;
    }

    if (registrationForm.countryCode === '+229') {
      const beninPhoneNumberRegex = /^[4-9][0-9]{7}$/;
      if (!beninPhoneNumberRegex.test(registrationForm.contact)) {
        setRegistrationSubmitMessage(
          "Erreur: Veuillez entrer un numéro de téléphone béninois valide de 8 chiffres (commençant par 4, 5, 6, 7, 8 ou 9)."
        );
        setIsSubmittingRegistration(false);
        return;
      }
    }

    try {
      // Sauvegarder en base de données
      const inscriptionId = await saveInscriptionToDatabase(registrationForm, totalPrice);
      
      // Afficher message de succès
      setRegistrationSubmitMessage("✅ Votre inscription a été enregistrée ! Vous recevrez un message de confirmation sous peu.");
      
      // Réinitialiser le formulaire après délai
      setTimeout(() => {
        setRegistrationForm({
          nom: '',
          prenom: '',
          countryCode: '+229',
          contact: '',
          email: '',
          modulesSouhaites: [],
          etablissement: '',
          ville: '',
        });
        setShowPayment(false);
      }, 5000);
      
    } catch (error) {
      setRegistrationSubmitMessage("❌ Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const saveInscriptionToDatabase = async (formData: any, total: number) => {
    const inscriptionData = {
      ...formData,
      totalPrice: total,
      dateInscription: new Date().toISOString(),
      statut: 'en_attente',
      etablissementNom: etablissements.find(e => e.id === formData.etablissement)?.nom || 'Inconnu',
      // Ajouter un ID unique pour le suivi
      inscriptionId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
    
    // Simulation - À remplacer par votre appel Firebase
    console.log('Inscription sauvegardée:', inscriptionData);
    // const docRef = await addDoc(collection(db, 'inscriptions'), inscriptionData);
    // return docRef.id;
    
    return inscriptionData.inscriptionId;
  };

  const handlePayment = (method: 'whatsapp' | 'wave' | 'mtn' | 'orange') => {
    const modulesNames = registrationForm.modulesSouhaites
      .map(slug => modules.find(m => m.slug === slug)?.title || slug)
      .join(', ');

    const fullContactNumber = registrationForm.countryCode + registrationForm.contact;
    const etablissementNom = etablissements.find(e => e.id === registrationForm.etablissement)?.nom || 'Inconnu';

    let messageContent = '';
    let paymentLink = '';

    switch (method) {
      case 'whatsapp':
        messageContent = `Nouvelle demande d'inscription :\n` +
          `Nom: ${registrationForm.nom}\n` +
          `Prénom: ${registrationForm.prenom}\n` +
          `Contact: ${fullContactNumber}\n` +
          `Email: ${registrationForm.email || 'Non renseigné'}\n` +
          `Établissement: ${etablissementNom}\n` +
          `Ville: ${registrationForm.ville}\n` +
          `Modules souhaités: ${modulesNames}\n` +
          `Coût total: ${new Intl.NumberFormat('fr-FR').format(totalPrice)} FCFA`;
        
        window.open(getWhatsappLink(whatsappNumber, messageContent), '_blank');
        break;

      case 'wave':
        paymentLink = `https://wave.com/payment?amount=${totalPrice}&description=Formation ${modulesNames}`;
        window.open(paymentLink, '_blank');
        break;

      case 'mtn':
        paymentLink = `https://mtn.com/payment?amount=${totalPrice}&description=Formation ${modulesNames}`;
        window.open(paymentLink, '_blank');
        break;

      case 'orange':
        paymentLink = `https://orange.com/payment?amount=${totalPrice}&description=Formation ${modulesNames}`;
        window.open(paymentLink, '_blank');
        break;
    }

    setRegistrationSubmitMessage("Votre inscription a été enregistrée ! Vous allez être redirigé pour le paiement.");
    setTimeout(() => {
      setRegistrationForm({
        nom: '',
        prenom: '',
        countryCode: '+229',
        contact: '',
        email: '',
        modulesSouhaites: [],
        etablissement: '',
        ville: '',
      });
      setShowPayment(false);
    }, 3000);
  };

  const inputStyles = `w-full p-3 border rounded-md text-base ${currentTheme.input} placeholder-gray-400 focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 focus:bg-white/80 outline-none transition-all duration-300`;

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
      
      {/* Hero Section */}
      <section className={`min-h-[30vh] flex items-center justify-center bg-gradient-to-b ${currentTheme.background} overflow-hidden text-center px-6 pt-24`}>
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl md:text-6xl font-bold ${currentTheme.text} mb-4`}
          >
            Inscription
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl ${currentTheme.text} opacity-90`}
          >
            {etablissementFromUrl ? `Inscription via ${etablissements.find(e => e.id === etablissementFromUrl)?.nom}` : 'Rejoignez nos formations artisanales'}
          </motion.p>
        </div>
      </section>

      {/* Formulaire d'inscription */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-[#1A1F16]' : 'bg-[#F5F1E8]'} transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-8 shadow-xl`}
          >
            <h2 className={`text-3xl font-bold ${currentTheme.text} text-center mb-6`}>
              Formulaire d'Inscription
            </h2>
            <p className={`${currentTheme.text} text-lg text-center mb-8 leading-relaxed`}>
              {etablissementFromUrl 
                ? `Vous vous inscrivez via l'établissement partenaire`
                : 'Veuillez remplir le formulaire ci-dessous pour vous inscrire à une formation.'
              }
            </p>
            
            {!showPayment ? (
              <form onSubmit={handleRegistrationSubmit} className="grid gap-6" ref={registrationFormRef}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nom" className={`block mb-2 font-semibold ${currentTheme.text}`}>Nom :</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={registrationForm.nom}
                      onChange={handleRegistrationChange}
                      required
                      placeholder="Votre nom"
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <label htmlFor="prenom" className={`block mb-2 font-semibold ${currentTheme.text}`}>Prénom :</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={registrationForm.prenom}
                      onChange={handleRegistrationChange}
                      required
                      placeholder="Votre prénom"
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className={`block mb-2 font-semibold ${currentTheme.text}`}>Email :</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={registrationForm.email}
                      onChange={handleRegistrationChange}
                      placeholder="Votre email"
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact" className={`block mb-2 font-semibold ${currentTheme.text}`}>Téléphone :</label>
                    <div className="flex items-center gap-3">
                      <select
                        id="countryCode"
                        name="countryCode"
                        value={registrationForm.countryCode}
                        onChange={handleRegistrationChange}
                        required
                        className={`${inputStyles} w-1/3`}
                      >
                        <option value="+229">+229</option>
                        <option value="+226">+226</option>
                        <option value="+225">+225</option>
                      </select>
                      <input
                        type="tel"
                        id="contact"
                        name="contact"
                        value={registrationForm.contact}
                        onChange={handleRegistrationChange}
                        required
                        placeholder="61234567"
                        className={`${inputStyles} w-2/3`}
                        pattern="[0-9]{8}"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="etablissement" className={`block mb-2 font-semibold ${currentTheme.text}`}>Établissement :</label>
                    <select
                      id="etablissement"
                      name="etablissement"
                      value={registrationForm.etablissement}
                      onChange={handleRegistrationChange}
                      required
                      className={inputStyles}
                      disabled={!!etablissementFromUrl} // Désactivé si venant d'un lien partagé
                    >
                      <option value="">Sélectionnez un établissement</option>
                      {etablissements.map(etab => (
                        <option key={etab.id} value={etab.id}>
                          {etab.nom} {etab.ville && `- ${etab.ville}`}
                        </option>
                      ))}
                    </select>
                    {etablissementFromUrl && (
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#D4B483]' : 'text-[#5D7B46]'}`}>
                        Établissement pré-sélectionné via le lien partagé
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="ville" className={`block mb-2 font-semibold ${currentTheme.text}`}>Ville :</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={registrationForm.ville}
                      onChange={handleRegistrationChange}
                      required
                      placeholder="Ville de l'établissement"
                      className={inputStyles}
                      readOnly // Lecture seule car remplie automatiquement
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-3 font-semibold ${currentTheme.text}`}>Modules souhaités :</label>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md border ${currentTheme.input}`}>
                    {modules.length > 0 ? (
                      modules.map((module) => (
                        <label key={module.slug} className={`flex items-center justify-between cursor-pointer ${currentTheme.text} select-none p-2 rounded hover:bg-opacity-20 hover:bg-[#B08D57] transition-colors`}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              value={module.slug}
                              checked={registrationForm.modulesSouhaites.includes(module.slug)}
                              onChange={handleModuleSelection}
                              className="sr-only peer"
                            />
                            <span className="w-5 h-5 bg-white border-2 border-gray-300 rounded-sm mr-3 flex-shrink-0 peer-checked:bg-[#B08D57] peer-checked:border-[#B08D57] transition-all duration-300 relative">
                              <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                            </span>
                            <span>{module.title}</span>
                          </div>
                          <span className={`text-sm ${theme === 'dark' ? 'text-[#D4B483]' : 'text-[#5D7B46]'} font-semibold`}>
                            {module.price ? new Intl.NumberFormat('fr-FR').format(module.price) + ' FCFA' : 'Gratuit'}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className={currentTheme.text}>Chargement des modules...</p>
                    )}
                  </div>
                  
                  {/* Affichage du prix total */}
                  {registrationForm.modulesSouhaites.length > 0 && (
                    <div className={`mt-4 p-4 rounded-md border-2 ${theme === 'dark' ? 'border-[#B08D57] bg-[#3E4C22]/30' : 'border-[#5D7B46] bg-[#E8DFCA]'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${currentTheme.text}`}>Total à payer :</span>
                        <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#D4B483]' : 'text-[#5D7B46]'}`}>
                          {new Intl.NumberFormat('fr-FR').format(totalPrice)} FCFA
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {registrationForm.modulesSouhaites.length} module(s) sélectionné(s)
                      </p>
                    </div>
                  )}
                </div>

                {registrationSubmitMessage && (
                  <div className={`p-4 rounded-md font-medium text-center ${
                    registrationSubmitMessage.includes('Erreur') 
                      ? 'bg-red-100 text-red-700 border border-red-700' 
                      : 'bg-green-100 text-green-700 border border-green-700'
                  }`}>
                    {registrationSubmitMessage}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`${
                    theme === 'dark' ? 'bg-[#B08D57] hover:bg-[#8B6B3D]' : 'bg-[#5D7B46] hover:bg-[#3E4C22]'
                  } text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  disabled={isSubmittingRegistration || registrationForm.modulesSouhaites.length === 0 || !registrationForm.etablissement}
                >
                  {isSubmittingRegistration ? 'Validation...' : `S'inscrire - ${new Intl.NumberFormat('fr-FR').format(totalPrice)} FCFA`}
                </button>
              </form>
            ) : (
              // Section de paiement (inchangée)
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-6`}>
                  Choisissez votre mode de paiement
                </h3>
                <p className={`${currentTheme.text} mb-8`}>
                  Total à payer : <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#D4B483]' : 'text-[#5D7B46]'}`}>
                    {new Intl.NumberFormat('fr-FR').format(totalPrice)} FCFA
                  </span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <button
                    onClick={() => handlePayment('whatsapp')}
                    className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-[#B08D57] hover:bg-[#B08D57]' : 'border-[#5D7B46] hover:bg-[#5D7B46]'} transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-3xl mb-2">💬</div>
                    <span className={currentTheme.text}>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => handlePayment('wave')}
                    className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-[#B08D57] hover:bg-[#B08D57]' : 'border-[#5D7B46] hover:bg-[#5D7B46]'} transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-3xl mb-2">🌊</div>
                    <span className={currentTheme.text}>Wave</span>
                  </button>
                  
                  <button
                    onClick={() => handlePayment('mtn')}
                    className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-[#B08D57] hover:bg-[#B08D57]' : 'border-[#5D7B46] hover:bg-[#5D7B46]'} transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-3xl mb-2">📱</div>
                    <span className={currentTheme.text}>MTN Money</span>
                  </button>
                  
                  <button
                    onClick={() => handlePayment('orange')}
                    className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'border-[#B08D57] hover:bg-[#B08D57]' : 'border-[#5D7B46] hover:bg-[#5D7B46]'} transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-3xl mb-2">🍊</div>
                    <span className={currentTheme.text}>Orange Money</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowPayment(false)}
                  className={`border-2 ${theme === 'dark' ? 'border-[#B08D57] text-[#B08D57]' : 'border-[#5D7B46] text-[#5D7B46]'} font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105`}
                >
                  Retour au formulaire
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InscriptionPageContent />
    </Suspense>
  );
}
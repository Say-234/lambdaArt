// app/page.tsx
'use client';

import Head from 'next/head';
import Link from 'next/link';
import ModulesCard from './components/ModulesCard';
import './globals.css';
import { useState, useEffect, useRef } from 'react';

import { db } from './lib/firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';

interface Module { // Renommé 'Module' pour plus de clarté
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

export default function HomePage() {
  const [modulesData, setModulesData] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const DEFAULT_WHATSAPP_NUMBER = '+22967507870'; // Ton numéro par défaut si non trouvé

  // Référence pour la section des modules (pour le défilement)
  const modulesSectionRef = useRef<HTMLHeadingElement>(null);
  // Référence pour la section du formulaire d'inscription
  const registrationFormRef = useRef<HTMLFormElement>(null);

  // --- Nouveaux états pour le formulaire d'inscription ---
  const [registrationForm, setRegistrationForm] = useState({
    nom: '',
    prenom: '',
    countryCode: '+229', // NOUVEAU : Code pays par défaut pour le Bénin
    contact: '', // Le numéro local sans le code pays
    modulesSouhaites: [] as string[], // Tableau de slugs de modules
    message: '',
  });
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [registrationSubmitMessage, setRegistrationSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // --- Récupération des modules ---
        const modulesCollectionRef = collection(db, 'modules');
        const q = modulesCollectionRef;

        const unsubscribeModules = onSnapshot(q, (querySnapshot) => {
          const modulesList: Module[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            if (data.slug && data.iconSrc && data.title && data.shortDesc) {
              modulesList.push({
                slug: data.slug,
                iconSrc: data.iconSrc,
                title: data.title,
                shortDesc: data.shortDesc,
              } as Module);
            } else {
              console.warn("Document incomplet trouvé dans la collection 'modules':", doc.id, data);
            }
          });
          setModulesData(modulesList);
          setLoading(false);
        }, (err) => {
          console.error("Erreur lors de la récupération des modules en temps réel:", err);
          setError("Échec du chargement des modules. Veuillez réessayer plus tard.");
          setLoading(false);
        });

        // --- Récupération du numéro WhatsApp ---
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef);
        if (settingsDoc.exists()) {
          setWhatsappNumber(settingsDoc.data().whatsappNumber || DEFAULT_WHATSAPP_NUMBER);
        } else {
          setWhatsappNumber(DEFAULT_WHATSAPP_NUMBER);
        }

        return () => unsubscribeModules();

      } catch (err: any) {
        console.error("Erreur globale lors de la récupération des données:", err);
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchData();

  }, []); // Exécute une fois au montage

  // --- EFFET POUR GÉRER LE DÉFILEMENT VERS LA SECTION DES MODULES ---
  useEffect(() => {
    // Tenter de défiler seulement si le chargement initial des données est terminé ET que modulesData n'est pas vide
    if (!loading && modulesData.length > 0) {
      const shouldScroll = localStorage.getItem('scrollToModules');

      if (shouldScroll === 'true' && modulesSectionRef.current) {
        console.log("Tentative de défilement vers la section des modules...");
        // Délai augmenté pour permettre plus de temps de rendu
        const timer = setTimeout(() => {
          if (modulesSectionRef.current) {
            modulesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            localStorage.removeItem('scrollToModules'); // Effacer le flag après le défilement réussi
            console.log("Défilement vers la section des modules tenté et flag effacé.");
          } else {
            console.warn("modulesSectionRef.current est null même après le délai.");
          }
        }, 500); // <-- Délai recommandé pour la fiabilité, essaie 1000ms si ça ne marche pas

        return () => clearTimeout(timer); // Nettoyer le timer
      }
    }
  }, [loading, modulesData]); // Dépend de loading et modulesData pour réévaluer quand les données sont prêtes


  // --- Fonctions du formulaire d'inscription ---
  // Gère les changements pour tous les champs du formulaire (y compris le nouveau 'countryCode')
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({ ...prev, [name]: value }));
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

  const handleRegistrationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingRegistration(true);
    setRegistrationSubmitMessage(null); // Réinitialise le message avant la soumission

    // --- Validation du formulaire ---
    if (!registrationForm.nom || !registrationForm.prenom || !registrationForm.contact || registrationForm.modulesSouhaites.length === 0) {
      setRegistrationSubmitMessage("Erreur: Veuillez remplir tous les champs obligatoires et sélectionner au moins un module.");
      setIsSubmittingRegistration(false);
      return;
    }
    if (!whatsappNumber) {
      setRegistrationSubmitMessage("Erreur: Le numéro WhatsApp n'est pas configuré. Veuillez réessayer plus tard.");
      setIsSubmittingRegistration(false);
      return;
    }

    // Validation spécifique pour le Bénin (+229)
    if (registrationForm.countryCode === '+229') {
      // Regex pour un numéro de mobile béninois (8 chiffres, commençant par 4, 5, 6 ou 7)
      const beninPhoneNumberRegex = /^[4-7][0-9]{7}$/;
      if (!beninPhoneNumberRegex.test(registrationForm.contact)) {
        setRegistrationSubmitMessage(
          "Erreur: Veuillez entrer un numéro de téléphone béninois valide de 8 chiffres (commençant par 4, 5, 6 ou 7) après le +229."
        );
        setIsSubmittingRegistration(false);
        return;
      }
    }
    // Tu peux ajouter des validations similaires pour d'autres codes pays ici
    // Exemple pour la France (+33) avec 9 chiffres après le code pays
    // if (registrationForm.countryCode === '+33') {
    //   if (!/^[0-9]{9}$/.test(registrationForm.contact)) {
    //     setRegistrationSubmitMessage(
    //       "Erreur: Veuillez entrer un numéro de téléphone français valide de 9 chiffres après le +33."
    //     );
    //     setIsSubmittingRegistration(false);
    //     return;
    //   }
    // }


    // --- Préparation du message WhatsApp ---
    const modulesNames = registrationForm.modulesSouhaites
      .map(slug => modulesData.find(m => m.slug === slug)?.title || slug)
      .join(', ');

    const fullContactNumber = registrationForm.countryCode + registrationForm.contact;

    const messageContent = `Nouvelle demande d'inscription :\n` +
      `Nom: ${registrationForm.nom}\n` +
      `Prénom: ${registrationForm.prenom}\n` +
      `Contact: ${fullContactNumber}\n` + // Utilise le numéro complet ici
      `Modules souhaités: ${modulesNames}\n` +
      (registrationForm.message ? `Message: ${registrationForm.message}` : '');

    try {
      // Ouvre le lien WhatsApp dans une nouvelle fenêtre/onglet
      window.open(getWhatsappLink(whatsappNumber, messageContent), '_blank');
      setRegistrationSubmitMessage("Votre demande a été envoyée ! Nous vous contacterons bientôt.");
      // Réinitialiser le formulaire
      setRegistrationForm({
        nom: '',
        prenom: '',
        countryCode: '+229', // Réinitialise avec le code pays par défaut
        contact: '',
        modulesSouhaites: [],
        message: '',
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      setRegistrationSubmitMessage("Erreur: Échec de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  // Fonction utilitaire pour générer l'URL WhatsApp
  const getWhatsappLink = (number: string, message: string = "Bonjour, je suis intéressé par votre formation.") => {
    const encodedMessage = encodeURIComponent(message);
    const cleanedNumber = number.replace(/\D/g, ''); // Retire tous les non-chiffres du numéro
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
  };

  // --- Gestion de l'affichage du chargement et des erreurs ---
  if (loading) {
    return <p>Chargement du contenu...</p>;
  }

  if (error) {
    return <p>Erreur: {error}</p>;
  }

  if (modulesData.length === 0 && !whatsappNumber) {
    return <p>Aucun contenu disponible pour le moment. Veuillez vérifier votre connexion ou si le contenu est configuré.</p>;
  }

  // Fonction pour scroller vers le formulaire d'inscription
  const scrollToRegistrationForm = () => {
    if (registrationFormRef.current) {
      registrationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };


  return (
    <>
      <Head>
        <title>Lambda'Art - L'Art de faire, à Portée de Main</title>
        <meta name="description" content="Découvrez l'artisanat sous un nouveau jour avec nos formations pratiques et conviviales." />
      </Head>

      <header>
        <h1 className="logo">Lambda'<span>Art</span></h1>
        <h2>Imagination – Création – Découverte de soi</h2>
      </header>

      <section className="welcome-section">
        <div className="welcome-content">
          <h2>Bienvenue chez Lambda'Art</h2>
          <p>Un espace de formation et d'expression dédié à toutes les formes de savoir-faire pratiques. Des activités manuelles et créatives, aux réalisations artisanales en passant par des techniques avancées proches des métiers d'usine et de production, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.<br />Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda’Art vous accompagne pas à pas dans un cadre convivial et motivant.</p>
          <p>Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez votre estime personnelle grâce à vos talents pratiques.</p>
          {/* Le bouton "Je m'inscris" scrollera vers le formulaire */}
          <Link href="#inscription-form" onClick={scrollToRegistrationForm} className="cta-button">
            Je m'inscris
          </Link>
        </div>
      </section>

      {/* Attachez la ref au H2 des modules */}
      <h2 className="module-title" ref={modulesSectionRef}>Nos Modules de Formation</h2>
      <section className="module-list">
        {modulesData.length > 0 ? (
          modulesData.map((module) => (
            <ModulesCard key={module.slug} module={module} />
          ))
        ) : (
          <p>Aucun module disponible pour le moment.</p>
        )}
      </section>

      {/* SECTION DU FORMULAIRE D'INSCRIPTION */}
      <section id="inscription-form" className="form-section animated-section">
        <div className="form-container">
          <h2 className="form-title">Inscription / Contact</h2>
          <p className="form-description">
            Veuillez remplir le formulaire ci-dessous pour vous inscrire à une formation ou nous laisser un message. Nous vous contacterons très prochainement !
          </p>
          <form onSubmit={handleRegistrationSubmit} className="registration-form" ref={registrationFormRef}>
            <div className="form-group">
              <label htmlFor="nom">Nom :</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={registrationForm.nom}
                onChange={handleRegistrationChange}
                required
                placeholder="Votre nom"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom :</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={registrationForm.prenom}
                onChange={handleRegistrationChange}
                required
                placeholder="Votre prénom"
                className="form-input"
              />
            </div>

            {/* Début du champ de contact modifié avec code pays */}
            <div className="form-group">
              <label htmlFor="contact">Contact (Numéro WhatsApp) :</label>
              <div className="contact-input-row"> {/* Conteneur flex pour aligner */}
                <select
                  id="countryCode"
                  name="countryCode"
                  value={registrationForm.countryCode}
                  onChange={handleRegistrationChange}
                  required
                  className="form-input country-code-select" // Ajoute une classe personnalisée pour le style
                  title="Sélectionnez le code pays" // Fournit un nom accessible
                >
                  {/* Pays de l'UEMOA */}
                  <option value="+229">+229 (Bénin)</option>
                  <option value="+226">+226 (Burkina Faso)</option>
                  <option value="+238">+238 (Cap-Vert)</option>
                  <option value="+225">+225 (Côte d&apos;Ivoire)</option>
                  <option value="+220">+220 (Gambie)</option>
                  <option value="+233">+233 (Ghana)</option>
                  <option value="+224">+224 (Guinée)</option>
                  <option value="+224">+224 (Guinée-Bissau)</option>
                  <option value="+241">+241 (Gabon)</option>
                  <option value="+231">+231 (Liberia)</option>
                  <option value="+223">+223 (Mali)</option>
                  <option value="+222">+222 (Mauritanie)</option>
                  <option value="+227">+227 (Niger)</option>
                  <option value="+234">+234 (Nigeria)</option>
                  <option value="+243">+243 (République Démocratique du Congo)</option>
                  <option value="+221">+221 (Sénégal)</option>
                  <option value="+232">+232 (Sierra Leone)</option>
                  <option value="+228">+228 (Togo)</option>

                  {/* Quelques pays occidentaux */}
                  <option value="+33">+33 (France)</option>
                  <option value="+32">+32 (Belgique)</option>
                  <option value="+41">+41 (Suisse)</option>
                  <option value="+1">+1 (Canada/USA)</option>
                  <option value="+44">+44 (Royaume-Uni)</option>
                  {/* Ajoute d'autres pays pertinents ici */}
                </select>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={registrationForm.contact}
                  onChange={handleRegistrationChange}
                  required
                  // Placeholder dynamique
                  placeholder={
                    registrationForm.countryCode === '+229'
                      ? 'Ex: 01 suivi de 8 chiffres'
                      : (registrationForm.countryCode === '+33' ? 'Ex: 9 chiffres' : 'Votre numéro local')
                  }
                  className="form-input"
                  // maxLength et pattern dynamiques (validation HTML5)
                  maxLength={registrationForm.countryCode === '+229' ? 10 : (registrationForm.countryCode === '+33' ? 9 : undefined)}
                  pattern={registrationForm.countryCode === '+229' ? '[0-9]{8}' : (registrationForm.countryCode === '+33' ? '[0-9]{9}' : undefined)}
                  title={
                    registrationForm.countryCode === '+229'
                      ? 'Veuillez entrer un numéro de téléphone béninois de 01 suivi de 8 chiffres (ex: 01XXXXXXXX).'
                      : (registrationForm.countryCode === '+33' ? 'Veuillez entrer un numéro de téléphone français de 9 chiffres (ex: 6XXXXXXXX).' : 'Veuillez entrer votre numéro de téléphone local.')
                  }
                />
              </div>
            </div>
            {/* Fin du champ de contact modifié */}

            <div className="form-group">
              <label className="modules-label">Modules souhaités (Sélectionnez un ou plusieurs) :</label>
              <div className="modules-checkbox-grid">
                {modulesData.length > 0 ? (
                  modulesData.map((module) => (
                    <label key={module.slug} className="checkbox-item">
                      <input
                        type="checkbox"
                        value={module.slug}
                        checked={registrationForm.modulesSouhaites.includes(module.slug)}
                        onChange={handleModuleSelection}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">{module.title}</span>
                    </label>
                  ))
                ) : (
                  <p>Chargement des modules ou aucun module disponible.</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Votre message (optionnel) :</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={registrationForm.message}
                onChange={handleRegistrationChange}
                placeholder="Des questions spécifiques ? Laissez votre message ici."
                className="form-textarea"
              ></textarea>
            </div>

            {registrationSubmitMessage && (
              <p className={`submit-message ${registrationSubmitMessage.includes('Erreur') ? 'error' : ''}`}>
                {registrationSubmitMessage}
              </p>
            )}

            <button type="submit" className="submit-btn" disabled={isSubmittingRegistration}>
              {isSubmittingRegistration ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
          </form>
        </div>
      </section>

      <footer>
        <p>© {new Date().getFullYear()} Lambda'Art. Tous droits réservés.</p>
        <p>Contacte : +229 01 53 72 74 79 / +229 01 94 57 74 57</p>
        <p>Email : lambdaart17@gmail.com</p>
      </footer>

    </>
  );
}
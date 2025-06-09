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
    contact: '',
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
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setRegistrationSubmitMessage(null);

    // Basic validation
    if (!registrationForm.nom || !registrationForm.prenom || !registrationForm.contact || registrationForm.modulesSouhaites.length === 0) {
      setRegistrationSubmitMessage("Veuillez remplir tous les champs obligatoires et sélectionner au moins un module.");
      setIsSubmittingRegistration(false);
      return;
    }
    if (!whatsappNumber) {
      setRegistrationSubmitMessage("Le numéro WhatsApp n'est pas configuré. Veuillez réessayer plus tard.");
      setIsSubmittingRegistration(false);
      return;
    }

    // Format the message for WhatsApp
    const modulesNames = registrationForm.modulesSouhaites
      .map(slug => modulesData.find(m => m.slug === slug)?.title || slug)
      .join(', ');

    const messageContent = `Nouvelle demande d'inscription :\n` +
                           `Nom: ${registrationForm.nom}\n` +
                           `Prénom: ${registrationForm.prenom}\n` +
                           `Contact: ${registrationForm.contact}\n` +
                           `Modules souhaités: ${modulesNames}\n` +
                           (registrationForm.message ? `Message: ${registrationForm.message}` : '');

    try {
      window.open(getWhatsappLink(whatsappNumber, messageContent), '_blank');
      setRegistrationSubmitMessage("Votre demande a été envoyée ! Nous vous contacterons bientôt.");
      // Réinitialiser le formulaire
      setRegistrationForm({
        nom: '',
        prenom: '',
        contact: '',
        modulesSouhaites: [],
        message: '',
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      setRegistrationSubmitMessage("Échec de l'envoi de la demande. Veuillez réessayer.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  // Fonction utilitaire pour générer l'URL WhatsApp
  const getWhatsappLink = (number: string, message: string = "Bonjour, je suis intéressé par votre formation.") => {
    const encodedMessage = encodeURIComponent(message);
    const cleanedNumber = number.replace(/\D/g, '');
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
          <p>Un espace de formation et d'expression dédié à toutes les formes de savoir-faire pratiques. De l’artisanat aux techniques manuelles, en passant par les activités créatives et techniques, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.<br />Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda’Art vous accompagne pas à pas dans un cadre convivial et motivant.</p>
          <p>Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez un avenir concret grâce à vos talents pratiques. Des activités manuelles et créatives, aux réalisations artisanales en passant par des techniques avancées proches des métiers d'usine et de production, nous vous offrons...</p>
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


<section id="inscription-form" className="form-section animated-section"> {/* Ajout de 'form-section' */}
  <div className="form-container"> {/* Nouveau conteneur pour centrer et styler */}
    <h2 className="form-title">Inscription / Contact</h2> {/* Ajout de 'form-title' */}
    <p className="form-description">Veuillez remplir le formulaire ci-dessous pour vous inscrire à une formation ou nous laisser un message. Nous vous contacterons très prochainement !</p>
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
          className="form-input" // Ajout de 'form-input'
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
          className="form-input" // Ajout de 'form-input'
        />
      </div>
      <div className="form-group">
        <label htmlFor="contact">Contact (Numéro WhatsApp) :</label>
        <input
          type="tel"
          id="contact"
          name="contact"
          value={registrationForm.contact}
          onChange={handleRegistrationChange}
          required
          placeholder="+229XXXXXXXX"
          className="form-input" // Ajout de 'form-input'
        />
      </div>

      <div className="form-group">
        <label className="modules-label">Modules souhaités (Sélectionnez un ou plusieurs) :</label> {/* Ajout de 'modules-label' */}
        <div className="modules-checkbox-grid">
          {modulesData.length > 0 ? (
            modulesData.map((module) => (
              <label key={module.slug} className="checkbox-item"> {/* Renommé 'checkbox-label' en 'checkbox-item' */}
                <input
                  type="checkbox"
                  value={module.slug}
                  checked={registrationForm.modulesSouhaites.includes(module.slug)}
                  onChange={handleModuleSelection}
                  className="checkbox-input" // Ajout de 'checkbox-input'
                />
                <span className="checkbox-custom"></span> {/* Pour un style de checkbox personnalisé */}
                <span className="checkbox-text">{module.title}</span> {/* Ajout de 'checkbox-text' */}
              </label>
            ))
          ) : (
            <p>Aucun module disponible.</p>
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
          className="form-textarea" // Ajout de 'form-textarea'
        ></textarea>
      </div>

      {registrationSubmitMessage && (
        <p className="submit-message">{registrationSubmitMessage}</p>
      )}

      <button type="submit" className="submit-btn" disabled={isSubmittingRegistration}>
        {isSubmittingRegistration ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
    </form>
  </div>
</section>

      {/* --- Section Contact (si tu veux garder un bouton WhatsApp séparé du formulaire) --- */}
      <section id="contact" className="animated-section">
        <h2>Contactez-nous</h2>
        <p>Pour des questions rapides, vous pouvez nous contacter directement par WhatsApp :</p>
        <div className="contact-methods">
          {whatsappNumber ? (
            <Link href={getWhatsappLink(whatsappNumber)} target="_blank" rel="noopener" className="whatsapp-button">
              <i className="bx bxl-whatsapp"></i> WhatsApp Direct
            </Link>
          ) : (
            <p>Numéro WhatsApp en cours de chargement ou non configuré.</p>
          )}
        </div>
      </section>

    </>
  );
}
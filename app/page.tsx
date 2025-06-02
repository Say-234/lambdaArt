// app/page.tsx
'use client';

import Head from 'next/head';
import Link from 'next/link';
import ModulesCard from './components/ModulesCard';
import './globals.css';
import { useState, useEffect } from 'react';

import { db } from './lib/firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore'; // Ajout de 'doc' et 'getDoc'

interface Modules {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

export default function HomePage() {
  const [selectedModule, setSelectedModule] = useState('');
  const [comment, setComment] = useState('');
  const [modulesData, setModulesData] = useState<Modules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(''); // Nouveau: État pour le numéro WhatsApp
  const DEFAULT_WHATSAPP_NUMBER = '+229'; // Ton numéro par défaut si non trouvé dans Firestore

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fonction asynchrone pour récupérer les données
    const fetchData = async () => {
      try {
        // --- Récupération des modules ---
        const modulesCollectionRef = collection(db, 'modules');
        const q = modulesCollectionRef;

        const unsubscribeModules = onSnapshot(q, (querySnapshot) => {
          const modulesList: Modules[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            if (data.slug && data.iconSrc && data.title && data.shortDesc) {
              modulesList.push({
                slug: data.slug,
                iconSrc: data.iconSrc,
                title: data.title,
                shortDesc: data.shortDesc,
              } as Modules);
            } else {
              console.warn("Document incomplet trouvé dans la collection 'modules':", doc.id, data);
            }
          });
          setModulesData(modulesList);
          setLoading(false); // Le chargement des modules est terminé ici
        }, (err) => {
          console.error("Erreur lors de la récupération des modules en temps réel:", err);
          setError("Échec du chargement des modules. Veuillez réessayer plus tard.");
          setLoading(false);
        });

        // --- Récupération du numéro WhatsApp ---
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef); // Utilise getDoc ici, car c'est un document unique
        if (settingsDoc.exists()) {
          setWhatsappNumber(settingsDoc.data().whatsappNumber || DEFAULT_WHATSAPP_NUMBER);
        } else {
          setWhatsappNumber(DEFAULT_WHATSAPP_NUMBER); // Utilise le numéro par défaut si le document n'existe pas
        }

        // Retourne la fonction de nettoyage pour le listener des modules
        return () => unsubscribeModules();

      } catch (err: any) {
        console.error("Erreur globale lors de la récupération des données:", err);
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.");
        setLoading(false); // S'assurer que le chargement se termine même en cas d'erreur
      }
    };

    fetchData(); // Appelle la fonction de récupération des données

  }, []); // Le tableau de dépendances vide signifie que cet effet ne s'exécute qu'une fois au montage


  // Fonction pour générer l'URL WhatsApp
  const getWhatsappLink = (number: string, message: string = "Bonjour, je suis intéressé par votre formation.") => {
    const encodedMessage = encodeURIComponent(message);
    // Supprimer les espaces et autres caractères non numériques du numéro pour l'URL
    const cleanedNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedModule && comment.trim()) {
      const message = `Nouveau commentaire via le site :\nModule : ${selectedModule}\nMessage : ${comment}`;
      // Utilise le numéro WhatsApp dynamique
      if (whatsappNumber) {
        window.open(getWhatsappLink(whatsappNumber, message), '_blank');
      } else {
        alert('Le numéro WhatsApp n\'est pas disponible pour le moment. Veuillez réessayer plus tard.');
      }
      setSelectedModule('');
      setComment('');
    } else {
      alert('Veuillez choisir un module et écrire votre message.');
    }
  };

  const handleModuleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModule(event.target.value);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  if (loading) {
    return <p>Chargement du contenu...</p>;
  }

  if (error) {
    return <p>Erreur: {error}</p>;
  }

  // Pas de modules ou numéro non configuré
  if (modulesData.length === 0 && !whatsappNumber) {
    return <p>Aucun contenu disponible pour le moment. Veuillez vérifier votre connexion ou si le contenu est configuré.</p>;
  }


  return (
    <>
      <Head>
        <title>Lambda'Art - L'Art de faire, à Portée de Main</title>
        <meta name="description" content="Découvrez l'artisanat sous un nouveau jour avec nos formations pratiques et conviviales." />
        {/* Tu peux ajouter d'autres balises meta ici */}
      </Head>

      <header>
        <h1 className="logo">Lambda'<span>Art</span></h1>
        <h2>Imagination – Création – Découverte de soi</h2>
      </header>

      <section className="welcome-section">
        <div className="welcome-content">
            <h2>Bienvenue chez Lambda'Art</h2>
            <p>Un espace de formation et d'expression dédié à toutes les formes de savoir-faire pratiques. De l’artisanat aux techniques manuelles, en passant par les activités créatives et techniques, nous vous offrons des ateliers accessibles, vivants et adaptés à tous les niveaux.<br />Que vous souhaitiez apprendre un métier de vos mains, découvrir une passion ou développer des compétences utiles et monétisables, Lambda’Art vous accompagne pas à pas dans un cadre convivial et motivant.</p>
            <p>Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez un avenir concret grâce à vos talents pratiques.</p>
          <Link href="#contact" className="cta-button">
            Je m'inscris
          </Link>
        </div>
      </section>

      <h2 className="module-title" id="modules-section">Nos Modules de Formation</h2>
      <section className="module-list">
        {modulesData.length > 0 ? (
          modulesData.map((module) => (
            <ModulesCard key={module.slug} module={module} />
          ))
        ) : (
          <p>Aucun module disponible pour le moment.</p>
        )}
      </section>

      <section id="contact" className="animated-section">
        <h2>Contactez-nous</h2>
        <p>Pour réserver votre place ou obtenir plus d'informations :</p>
        <div className="contact-methods">
          {/* Utilise le numéro WhatsApp dynamique ici */}
          {whatsappNumber ? (
            <Link href={getWhatsappLink(whatsappNumber)} target="_blank" rel="noopener" className="whatsapp-button">
              <i className="bx bxl-whatsapp"></i> WhatsApp
            </Link>
          ) : (
            <p>Numéro WhatsApp en cours de chargement ou non configuré.</p>
          )}
        </div>
      </section>

      <section id="commentaires">
        <h2>Laissez-nous un message</h2>
        <form id="comment-form" onSubmit={handleSubmit}>
          <label htmlFor="module">Choisissez un module :</label>
          <select id="module" name="module" value={selectedModule} onChange={handleModuleChange}>
            <option value=""> Sélectionnez un module </option>
            {modulesData.map((module) => (
              <option key={module.slug} value={module.slug}>{module.title.toUpperCase()}</option>
            ))}
          </select>

          <label htmlFor="comment">Votre message :</label>
          <textarea id="comment" name="comment" rows={4} required placeholder="Dites-nous ce qui vous intéresse..." value={comment} onChange={handleCommentChange}></textarea>

          <button type="submit" className="submit-btn">
            <i className="bx bx-paper-plane"></i> Envoyer
          </button>
        </form>
      </section>
    </>
  );
}
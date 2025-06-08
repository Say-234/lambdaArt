// app/page.tsx
'use client';

import Head from 'next/head';
import Link from 'next/link';
import ModulesCard from './components/ModulesCard';
import './globals.css';
import { useState, useEffect, useRef } from 'react'; // Assurez-vous que useRef est importé

import { db } from './lib/firebase';
import { collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';

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
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const DEFAULT_WHATSAPP_NUMBER = '+229';

  // Plus besoin de useSearchParams si on utilise le flag localStorage pour le défilement inter-pages
  // const searchParams = useSearchParams();

  const modulesSectionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
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
          // Important : Mettre loading à false seulement après que les modules soient récupérés.
          // Cela rend le useEffect de défilement plus fiable car il dépend de `!loading`.
          setLoading(false);
        }, (err) => {
          console.error("Erreur lors de la récupération des modules en temps réel:", err);
          setError("Échec du chargement des modules. Veuillez réessayer plus tard.");
          setLoading(false);
        });

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

  }, []); // Tableau de dépendances vide, s'exécute une fois au montage

  // NOUVEL EFFET POUR GÉRER LE DÉFILEMENT APRÈS LE CHARGEMENT INITIAL ET QUAND LES DONNÉES SONT PRÊTES
  useEffect(() => {
    // Tenter de défiler seulement si le chargement initial des données est terminé ET que modulesData n'est pas vide
    // (Cela garantit que les éléments DOM pour les modules sont probablement rendus)
    if (!loading && modulesData.length > 0) {
      const shouldScroll = localStorage.getItem('scrollToModules');

      if (shouldScroll === 'true' && modulesSectionRef.current) {
        console.log("Tentative de défilement vers la section des modules...");
        console.log("modulesSectionRef.current:", modulesSectionRef.current);

        // Délai augmenté pour permettre plus de temps de rendu
        const timer = setTimeout(() => {
          if (modulesSectionRef.current) {
            modulesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            localStorage.removeItem('scrollToModules'); // Effacer le flag après le défilement réussi
            console.log("Défilement vers la section des modules tenté et flag effacé.");
          } else {
            console.warn("modulesSectionRef.current est null même après le délai.");
          }
        }, 500); // <-- Délai augmenté à 500ms (essayez 1000ms si 500 échoue)

        return () => clearTimeout(timer); // Nettoyer le timer
      } else if (shouldScroll === 'true' && !modulesSectionRef.current) {
        console.warn("Flag localStorage défini, mais modulesSectionRef.current est null avant le délai.");
      } else if (shouldScroll === 'true' && modulesData.length === 0) {
        console.warn("Flag localStorage défini, mais modulesData est vide. Impossible de défiler vers la section des modules.");
      }
    } else {
      console.log("Pas prêt à défiler : loading=", loading, "modulesData.length=", modulesData.length);
    }
  }, [loading, modulesData]); // Dépend de loading et modulesData pour réévaluer quand les données sont prêtes


  const getWhatsappLink = (number: string, message: string = "Bonjour, je suis intéressé par votre formation.") => {
    const encodedMessage = encodeURIComponent(message);
    const cleanedNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedModule && comment.trim()) {
      const message = `Nouveau commentaire via le site :\nModule : ${selectedModule}\nMessage : ${comment}`;
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

  if (modulesData.length === 0 && !whatsappNumber) {
    return <p>Aucun contenu disponible pour le moment. Veuillez vérifier votre connexion ou si le contenu est configuré.</p>;
  }


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
          <p>Rejoignez une communauté dynamique et bienveillante de passionnés, de curieux et de créateurs. Avec Lambda’Art, révélez votre potentiel et construisez un avenir concret grâce à vos talents pratiques.</p>
          <Link href="#contact" className="cta-button">
            Je m'inscris
          </Link>
        </div>
      </section>

      {/* Attachez la ref au H2 */}
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

      <section id="contact" className="animated-section">
        <h2>Contactez-nous</h2>
        <p>Pour réserver votre place ou obtenir plus d'informations :</p>
        <div className="contact-methods">
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
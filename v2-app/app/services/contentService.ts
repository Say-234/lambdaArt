import { doc, getDoc, collection, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Testimonial, FAQ } from '@/types/faq';

// Export types for use in other components
export type { Testimonial, FAQ };

// Check if Firebase is properly configured
const isMockMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                   !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
                   !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export interface ContentSection {
  id: string;
  key: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  description: string;
  gallery: string[];
  price: number;
  duration: string;
  level: string;
  category: string;
  featured: boolean;
  color?: string;
  containerColor?: string;
  createdAt?: any;
  updatedAt?: any;
}


// Fonction pour calculer le prix total
export const calculateTotalPrice = (moduleSlugs: string[], modules: Module[]): number => {
  return moduleSlugs.reduce((total, slug) => {
    const module = modules.find(m => m.slug === slug);
    return total + (module?.price || 0);
  }, 0);
};

// Récupérer les sections de contenu modifiable
export const getContentSections = async (): Promise<ContentSection[]> => {
  try {
    const sectionsCollection = collection(db, 'contentSections');
    const sectionsSnapshot = await getDocs(sectionsCollection);
    const sectionsList = sectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as ContentSection[];
    
    return sectionsList;
  } catch (error) {
    console.error('Error fetching content sections:', error);
    return [];
  }
};

// Récupérer une section spécifique
export const getContentSection = async (key: string): Promise<ContentSection | null> => {
  try {
    const sectionsCollection = collection(db, 'contentSections');
    const q = query(sectionsCollection, where('key', '==', key));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as ContentSection;
    }
    return null;
  } catch (error) {
    console.error('Error fetching content section:', error);
    return null;
  }
};

// Récupérer tous les modules
export const getModules = async (): Promise<Module[]> => {
  if (isMockMode) {
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, 'modules'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug || doc.id,
        title: data.title || 'Sans titre',
        shortDesc: data.shortDesc || data.description || '',
        longDesc: data.longDesc || data.description || '',
        description: data.description || '',
        iconSrc: data.iconSrc || data.image || '/default-icon.png',
        gallery: data.gallery || data.images || [],
        price: data.price || 0,
        duration: data.duration || 'Non spécifié',
        level: data.level || 'débutant',
        category: data.category || 'général',
        featured: data.featured || false,
        color: data.color,
        containerColor: data.containerColor,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
  } catch (error) {
    console.error('Erreur chargement modules:', error);
    return [];
  }
};

// Récupérer le numéro WhatsApp
export const getWhatsappNumber = async (): Promise<string> => {
  try {
    const DEFAULT_WHATSAPP_NUMBER = '+22953727479';
    const settingsDocRef = doc(db, 'settings', 'global');
    const settingsDoc = await getDoc(settingsDocRef);
    if (settingsDoc.exists()) {
      return settingsDoc.data().whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
    }
    return DEFAULT_WHATSAPP_NUMBER;
  } catch (error) {
    console.error('Error fetching WhatsApp number:', error);
    return '+22953727479';
  }
};

// FAQ Services
export const getFAQs = async (): Promise<FAQ[]> => {
  if (isMockMode) {
    return [
      {
        id: '1',
        question: 'Comment fonctionnent les formations ?',
        answer: 'Nos formations sont pratiques et accessibles à tous les niveaux. Chaque module combine théorie et pratique avec un accompagnement personnalisé.',
        category: 'formations',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        question: 'Quels sont les prérequis pour participer ?',
        answer: 'Aucun prérequis spécifique ! Nos formations sont conçues pour les débutants comme pour les personnes ayant déjà de l\'expérience.',
        category: 'inscriptions',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        question: 'Comment puis-je payer ma formation ?',
        answer: 'Nous acceptons les paiements via Wave, MTN Money, Orange Money et cartes bancaires. Des facilités de paiement sont possibles.',
        category: 'paiement',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  try {
    const q = query(
      collection(db, 'faqs'), 
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FAQ[];
  } catch (error) {
    console.error('Erreur chargement FAQ:', error);
    return [];
  }
};

export const saveFAQ = async (faq: Omit<FAQ, 'id'> & { id?: string }): Promise<void> => {
  if (isMockMode) {
    console.log('Mock: Sauvegarde FAQ', faq);
    return;
  }

  try {
    const faqData = {
      ...faq,
      updatedAt: new Date(),
      createdAt: faq.createdAt || new Date()
    };

    if (faq.id) {
      await updateDoc(doc(db, 'faqs', faq.id), faqData);
    } else {
      await addDoc(collection(db, 'faqs'), faqData);
    }
  } catch (error) {
    console.error('Erreur sauvegarde FAQ:', error);
    throw error;
  }
};

export const deleteFAQ = async (id: string): Promise<void> => {
  if (isMockMode) {
    console.log('Mock: Suppression FAQ', id);
    return;
  }

  try {
    await deleteDoc(doc(db, 'faqs', id));
  } catch (error) {
    console.error('Erreur suppression FAQ:', error);
    throw error;
  }
};

// Testimonials Services
export const getTestimonials = async (approvedOnly: boolean = true): Promise<Testimonial[]> => {
  if (isMockMode) {
    const testimonials = [
      {
        id: '1',
        name: 'Marie K.',
        email: 'marie@email.com',
        title: 'Formation Exceptionnelle',
        quote: 'Une expérience incroyable ! Les formateurs sont très pédagogues.',
        rating: 5,
        isApproved: true,
        moduleName: 'Création de Bijoux',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Jean D.',
        email: 'jean@email.com',
        title: 'Très satisfait',
        quote: 'En tant que débutant complet, j\'ai apprécié la patience des formateurs.',
        rating: 4,
        isApproved: true,
        moduleName: 'Menuiserie Basique',
        createdAt: new Date()
      }
    ];
    return approvedOnly ? testimonials : testimonials;
  }

  try {
    let q;
    if (approvedOnly) {
      q = query(
        collection(db, 'testimonials'), 
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'testimonials'),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Testimonial[];
  } catch (error) {
    console.error('Erreur chargement témoignages:', error);
    return [];
  }
};

export const saveTestimonial = async (testimonial: Omit<Testimonial, 'id'> & { id?: string }): Promise<void> => {
  if (isMockMode) {
    console.log('Mock: Sauvegarde témoignage', testimonial);
    return;
  }

  try {
    const testimonialData = {
      ...testimonial,
      updatedAt: new Date(),
      createdAt: testimonial.createdAt || new Date(),
      expiresAt: testimonial.expiresAt || (testimonial.isApproved ? null : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
    };

    if (testimonial.id) {
      await updateDoc(doc(db, 'testimonials', testimonial.id), testimonialData);
    } else {
      await addDoc(collection(db, 'testimonials'), testimonialData);
    }
  } catch (error) {
    console.error('Erreur sauvegarde témoignage:', error);
    throw error;
  }
};

export const approveTestimonial = async (id: string): Promise<void> => {
  if (isMockMode) {
    console.log('Mock: Approbation témoignage', id);
    return;
  }

  try {
    await updateDoc(doc(db, 'testimonials', id), {
      isApproved: true,
      updatedAt: new Date(),
      expiresAt: null
    });
  } catch (error) {
    console.error('Erreur approbation témoignage:', error);
    throw error;
  }
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  if (isMockMode) {
    console.log('Mock: Suppression témoignage', id);
    return;
  }

  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    throw error;
  }
};
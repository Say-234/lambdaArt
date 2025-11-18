import { useState, useEffect } from 'react';
import { 
  ContentSection, 
  Module, 
  FAQ,
  Testimonial,
  getContentSections, 
  getModules, 
  getTestimonials, 
  getWhatsappNumber,
  getFAQs
} from '../services/contentService';

export const useContent = () => {
  const [contentSections, setContentSections] = useState<Record<string, ContentSection>>({});
  const [modules, setModules] = useState<Module[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+22953727479');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        const [
          sections, 
          modulesData, 
          testimonialsData, 
          whatsapp,
          faqsData,
          allTestimonialsData
        ] = await Promise.all([
          getContentSections(),
          getModules(),
          getTestimonials(true),
          getWhatsappNumber(),
          getFAQs(),
          getTestimonials(false)
        ]);

        // Convertir les sections en objet pour accès facile
        const sectionsObj: Record<string, ContentSection> = {};
        sections.forEach(section => {
          sectionsObj[section.key] = section;
        });

        setContentSections(sectionsObj);
        setModules(modulesData);
        setTestimonials(testimonialsData);
        setFaqs(faqsData);
        setAllTestimonials(allTestimonialsData);
        setWhatsappNumber(whatsapp);
        
      } catch (err) {
        setError('Erreur lors du chargement du contenu');
        console.error('Erreur useContent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { 
    contentSections, 
    modules, 
    testimonials,
    faqs,
    allTestimonials,
    whatsappNumber, 
    loading, 
    error 
  };
};
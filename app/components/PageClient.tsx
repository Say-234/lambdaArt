'use client';

import { useRef, useEffect } from 'react';
import WelcomeSection from './WelcomESection';
import ModulesList from './ModulesList';
import RegistrationForm from './RegistrationForm';

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

interface PageClientProps {
  modulesData: Module[];
  whatsappNumber: string;
}

export default function PageClient({ modulesData, whatsappNumber }: PageClientProps) {
  const modulesSectionRef = useRef<HTMLHeadingElement>(null);
  const registrationFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const shouldScroll = localStorage.getItem('scrollToModules');
    if (shouldScroll === 'true' && modulesSectionRef.current) {
      const timer = setTimeout(() => {
        if (modulesSectionRef.current) {
          modulesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          localStorage.removeItem('scrollToModules');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [modulesData]);

  const scrollToRegistrationForm = () => {
    if (registrationFormRef.current) {
      // Note: The ref is on the form inside RegistrationForm, so direct scroll might not work.
      // A better approach would be to pass the ref down or use an ID.
      // For now, we rely on the Link's default anchor behavior.
      const formElement = document.getElementById('inscription-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <main>
      <WelcomeSection scrollToRegistrationForm={scrollToRegistrationForm} />

      <h2 className="module-title" ref={modulesSectionRef}>Nos Modules de Formation</h2>
      <ModulesList modulesData={modulesData} />

      <RegistrationForm modulesData={modulesData} whatsappNumber={whatsappNumber} />
    </main>
  );
}

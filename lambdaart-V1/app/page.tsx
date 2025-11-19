// app/page.tsx
import RegistrationForm from './components/RegistrationForm';
import ModulesList from './components/ModulesList';
import WelcomeSection from './components/WelcomeSection';
import PageClient from './components/PageClient'; 
import './globals.css';

import { db } from './lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Module {
  slug: string;
  iconSrc: string;
  title: string;
  shortDesc: string;
}

async function getModules(): Promise<Module[]> {
  const modulesCollectionRef = collection(db, 'modules');
  const querySnapshot = await getDocs(modulesCollectionRef);
  const modulesList: Module[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.slug && data.iconSrc && data.title && data.shortDesc) {
      modulesList.push({
        slug: data.slug,
        iconSrc: data.iconSrc,
        title: data.title,
        shortDesc: data.shortDesc,
      } as Module);
    }
  });
  return modulesList;
}

async function getWhatsappNumber(): Promise<string> {
  const DEFAULT_WHATSAPP_NUMBER = '+22967507870';
  const settingsDocRef = doc(db, 'settings', 'global');
  const settingsDoc = await getDoc(settingsDocRef);
  if (settingsDoc.exists()) {
    return settingsDoc.data().whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export default async function HomePage() {
  const modulesData = await getModules();
  const whatsappNumber = await getWhatsappNumber();

  return (
    <>
      <PageClient modulesData={modulesData} whatsappNumber={whatsappNumber} />
    </>
  );
}
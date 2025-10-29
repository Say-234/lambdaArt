// app/page.tsx
import Head from 'next/head';
import RegistrationForm from './components/RegistrationForm';
import ModulesList from './components/ModulesList';
import WelcomeSection from './components/WelcomESection';
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
      <Head>
        <title>Lambda'Art - L'Art de faire, à Portée de Main</title>
        <meta name="description" content="Découvrez l'artisanat sous un nouveau jour avec nos formations pratiques et conviviales." />
      </Head>

      <header>
        <h1 className="logo">Lambda'<span>Art</span></h1>
        <h2>Imagination – Création – Découverte de soi</h2>
      </header>

      <PageClient modulesData={modulesData} whatsappNumber={whatsappNumber} />

      <footer>
        <p> {new Date().getFullYear()} Lambda'Art. Tous droits réservés.</p>
        <p>Contacts : +229 01 53 72 74 79 / +229 01 94 57 74 57</p>
        <p>Email : lambdaart17@gmail.com</p>
      </footer>
    </>
  );
}
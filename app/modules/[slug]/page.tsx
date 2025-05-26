'use client';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Module {
  id: string;
  slug: string;
  title: string;
  longDesc: string;
  gallery: string[];
}

export default function ModuleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleSlug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchModuleData = async () => {
      try {
        const modulesCollectionRef = collection(db, 'modules');
        const querySnapshot = await getDocs(modulesCollectionRef);
        let foundModule: Module | null = null;

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          if (data.slug === moduleSlug) {
            foundModule = { id: doc.id, ...data } as Module;
          }
        });

        if (foundModule) {
          setModuleData(foundModule);
        } else {
          setError('Module non trouvé');
          router.push('/');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données du module:", err);
        setError("Échec du chargement des données du module. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleSlug, router]);

  if (loading) {
    return <div className="module-details"><p>Chargement...</p></div>;
  }

  if (error) {
    return <div className="module-details"><p>{error}</p></div>;
  }

  return (
    <div className="module-details">
      <Head>
        <title>{moduleData?.title ?? 'Module'}</title>
        <meta name="description" content={moduleData?.longDesc ?? ''} />
      </Head>
      <div className="details-container">
        <Link href="/" className="back-btn">
          <i className="bx bx-arrow-back"></i> Retour aux modules
        </Link>
        {moduleData && (
          <>
            <h2>{moduleData.title}</h2>
            <p className="long-desc">{moduleData.longDesc}</p>
            <div className="gallery">
              {moduleData.gallery?.map((imgSrc, index) => (
                <Image
                  key={index}
                  src={imgSrc}
                  alt={`${moduleData.title} image ${index + 1}`}
                  width={200}
                  height={150}
                  className="gallery-image"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// app/admin/etablissement/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { EtablissementSidebar } from '../../../components/admin/EtablissementSidebar';

interface Etudiant {
  id: string;
  etudiant: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  modules: string[];
  dateInscription: string;
}

export default function DashboardEtablissement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [statistiques, setStatistiques] = useState({
    totalEtudiants: 0,
    inscriptionsMois: 0
  });

  const [statistiquesDetaillees, setStatistiquesDetaillees] = useState({
    totalEtudiants: 0,
    inscriptionsMois: 0,
    inscriptionsSemaine: 0,
    modulesPopulaires: [] as string[]
  });

  // Récupérer l'ID de l'établissement depuis les claims ou une collection séparée
  const etablissementId = (user as any)?.etablissementId;

  useEffect(() => {
    if (etablissementId) {
      chargerEtudiants();
      chargerStatistiquesDetaillees();
    }
  }, [etablissementId]);

  const chargerEtudiants = async () => {
    if (!etablissementId) return;

    const inscriptionsRef = collection(db, 'inscriptions');
    const q = query(inscriptionsRef, where('etablissementId', '==', etablissementId));
    const querySnapshot = await getDocs(q);
    
    const etudiantsData: Etudiant[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Etudiant));
    
    setStatistiques({
      totalEtudiants: etudiantsData.length,
      inscriptionsMois: etudiantsData.filter(etud => {
        const dateInscription = new Date(etud.dateInscription);
        const now = new Date();
        return dateInscription.getMonth() === now.getMonth() && 
               dateInscription.getFullYear() === now.getFullYear();
      }).length
    });
  };

  // Charger les statistiques détaillées
  const chargerStatistiquesDetaillees = async () => {
    if (!etablissementId) return;

    const inscriptionsRef = collection(db, 'inscriptions');
    const q = query(inscriptionsRef, where('etablissementId', '==', etablissementId));
    const querySnapshot = await getDocs(q);
    
    const etudiantsData: Etudiant[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Etudiant));

    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const debutSemaine = new Date(maintenant.setDate(maintenant.getDate() - maintenant.getDay()));

    // Calcul des modules populaires
    const modulesCount: { [key: string]: number } = {};
    etudiantsData.forEach(etud => {
      etud.modules.forEach(module => {
        modulesCount[module] = (modulesCount[module] || 0) + 1;
      });
    });

    const modulesPopulaires = Object.entries(modulesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([module]) => module);

    setStatistiquesDetaillees({
      totalEtudiants: etudiantsData.length,
      inscriptionsMois: etudiantsData.filter(etud => 
        new Date(etud.dateInscription) >= debutMois
      ).length,
      inscriptionsSemaine: etudiantsData.filter(etud => 
        new Date(etud.dateInscription) >= debutSemaine
      ).length,
      modulesPopulaires
    });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-900">
      <EtablissementSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />

      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'dashboard' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Dashboard Établissement</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Étudiants Total</h3>
                <p className="text-3xl font-bold text-blue-600">{statistiques.totalEtudiants}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Inscriptions Ce Mois</h3>
                <p className="text-3xl font-bold text-green-600">{statistiques.inscriptionsMois}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow">
              <h2 className="text-xl font-semibold p-4 border-b">Mes Étudiants</h2>
              <div className="p-4">
                {etudiants.length > 0 ? (
                  etudiants.map(etudiant => (
                    <div key={etudiant.id} className="border-b py-3 last:border-b-0">
                      <p className="font-semibold">
                        {etudiant.etudiant.prenom} {etudiant.etudiant.nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {etudiant.etudiant.telephone}
                      </p>
                      <p className="text-sm text-gray-500">
                        {etudiant.modules.length} module(s) - 
                        Inscrit le {new Date(etudiant.dateInscription).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucun étudiant inscrit pour le moment
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeSection === 'lien' && (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Lien d'Inscription</h1>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
              <p className="mb-4">Partagez ce lien avec vos étudiants :</p>
              <div className="flex gap-2 mb-4">
                <input 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/inscription?etablissement=${etablissementId}`}
                  readOnly
                  className="flex-1 p-2 border rounded dark:bg-neutral-700"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(
                    `${typeof window !== 'undefined' ? window.location.origin : ''}/inscription?etablissement=${etablissementId}`
                  )}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Tous les étudiants qui s'inscrivent via ce lien seront automatiquement attribués à votre établissement.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
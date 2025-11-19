'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import ModuleForm from '../components/admin/Moduleform';
import './dashboard.css'

export default function AdminDashboard() {
  const [modules, setModules] = useState<any[]>([]);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(''); // Nouvel état pour le numéro WhatsApp
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(true); // État de chargement pour le numéro
  const [savingWhatsapp, setSavingWhatsapp] = useState(false); // État de sauvegarde pour le numéro
  const [whatsappError, setWhatsappError] = useState<string | null>(null); // Erreur de sauvegarde
  const router = useRouter();
  const { user, loading } = useAuth(true);

  // Récupérer tous les modules
  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      const querySnapshot = await getDocs(collection(db, 'modules'));
      const modulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModules(modulesData);
    };

    fetchModules();
  }, [user]);

  // Charger le numéro WhatsApp
  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      setLoadingWhatsapp(true);
      try {
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsDocRef);
        if (settingsDoc.exists()) {
          setWhatsappNumber(settingsDoc.data().whatsappNumber || '');
        } else {
          // Si le document n'existe pas, il sera créé lors de la première sauvegarde
          setWhatsappNumber(''); // Ou une valeur par défaut vide
        }
      } catch (error) {
        console.error("Erreur lors du chargement du numéro WhatsApp:", error);
        setWhatsappError("Échec du chargement du numéro WhatsApp.");
      } finally {
        setLoadingWhatsapp(false);
      }
    };

    fetchWhatsappNumber();
  }, [user]);

  // Gérer la sauvegarde du numéro WhatsApp
  const handleSaveWhatsappNumber = async () => {
    setSavingWhatsapp(true);
    setWhatsappError(null);
    try {
      const settingsDocRef = doc(db, 'settings', 'global');
      // setDoc avec merge: true pour ne pas écraser d'autres champs si le document 'global' en avait
      await setDoc(settingsDocRef, { whatsappNumber: whatsappNumber }, { merge: true });
      alert('Numéro WhatsApp enregistré avec succès !');
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du numéro WhatsApp:", error);
      setWhatsappError("Échec de la sauvegarde du numéro WhatsApp.");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Supprimer un module
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      await deleteDoc(doc(db, 'modules', id));
      setModules(modules.filter(module => module.id !== id));
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!user) return null;

  return (
    <div className="">
      <div className="dashboard">
        <h1 className="title">Tableau de Bord Admin</h1>
        <button
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </div>

       {/* Section de gestion du numéro WhatsApp */}
      <div className="whatsappSettingsSection">
        <h2 >Paramètres WhatsApp</h2>
        {loadingWhatsapp ? (
          <p>Chargement du numéro...</p>
        ) : (
          <div className="formGroup">
            <label htmlFor="whatsappInput" className="formLabel">Numéro WhatsApp:</label>
            <input
              id="whatsappInput"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="formInput"
              placeholder="Ex: +229XXXXXXXX (avec code pays)"
              disabled={savingWhatsapp}
            />
            <button
              onClick={handleSaveWhatsappNumber}
              className="submitButton"
              disabled={savingWhatsapp}
            >
              {savingWhatsapp ? 'Sauvegarde...' : 'Sauvegarder Numéro'}
            </button>
          </div>
        )}
        {whatsappError && <p className="errorMessage ">{whatsappError}</p>}
      </div>

      <div className="mb-6">
        <button 
          onClick={() => {
            setEditingModule(null);
            setIsAdding(true);
          }}
          className="add"
        >
          + Ajouter un module
        </button>
      </div>

      {isAdding && (
        <ModuleForm 
          onClose={() => setIsAdding(false)}
          onSave={(newModule: any) => {
            setModules([...modules, newModule]);
            setIsAdding(false);
          }}
        />
      )}

      {editingModule && (
        <ModuleForm 
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onSave={(updatedModule: any) => {
            setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
            setEditingModule(null);
          }}
        />
      )}

      <div className="modules">
        {modules.map((module) => (
          <div key={module.id} className="module">
            <div className="module-card">
              <div className="card">
                <h3>{module.title}</h3>
                <div className="actions">
                  <button 
                    onClick={() => setEditingModule(module)}
                    className="modifier"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(module.id)}
                    className="supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <p>{module.shortDesc}</p>
              <div className="flex items-center mb-2">
                <img 
                  src={module.iconSrc} 
                  alt="Icône" 
                  className="w-10 h-10 rounded-full mr-2"
                />
                <span className="text-sm text-gray-500">{module.slug}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {module.gallery?.map((img: string, index: number) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Gallery ${index}`}
                    className="h-20 w-full object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
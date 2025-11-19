// app/admin/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleForm from '../../../components/admin/ModuleForm';
import { FAQ, Testimonial } from '../../../types/faq';
import { getFAQs, saveFAQ, deleteFAQ, getTestimonials, saveTestimonial, approveTestimonial, deleteTestimonial } from '@/app/services/contentService';
import { 
  FiHome, 
  FiSettings, 
  FiBook, 
  FiEdit, 
  FiCreditCard, 
  FiUsers,
  FiMoon,
  FiSun,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiMenu,
  FiBell,
  FiSearch,
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiHelpCircle,
  FiStar,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';

// Types basés sur votre structure Firebase
interface PaymentSettings {
  waveNumber: string;
  mtnNumber: string;
  orangeNumber: string;
  whatsappNumber: string;
  updatedAt?: any;
}

interface GlobalSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    facebook: string;
    instagram: string;
  };
  paymentMethods: string[];
  updatedAt?: any;
}

interface ContentSection {
  id: string;
  key: string;
  title: string;
  content: string;
  updatedAt?: any;
}

interface Module {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  iconSrc: string;
  gallery: string[];
  price: number;
  duration: string;
  level: string;
  category: string;
  featured: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface Etablissement {
  id: string;
  nom: string;
  email: string;
  contact: string;
  ville: string;
  statut: string;
  responsable?: string;
  dateCreation: any;
  invitationId?: string;
}

// Palette de couleurs Lambda'Art
const themeColors = {
  dark: {
    background: 'bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
    sidebar: 'bg-[#1A1F16] border-r border-[#2D3A25]',
    header: 'bg-[#1A1F16] border-b border-[#2D3A25]',
    card: 'bg-[#2D3A25]/80 backdrop-blur-sm border border-[#3E4C22]',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      accent: 'text-[#B08D57]'
    },
    button: {
      primary: 'bg-[#B08D57] hover:bg-[#8B6B3D] text-white',
      secondary: 'bg-[#2D3A25] hover:bg-[#3E4C22] text-white border border-[#3E4C22]',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white'
    },
    input: 'bg-[#2D3A25] border border-[#3E4C22] text-white placeholder-gray-400'
  },
  light: {
    background: 'bg-gradient-to-br from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
    sidebar: 'bg-[#F5F1E8] border-r border-[#E8DFCA]',
    header: 'bg-[#F5F1E8] border-b border-[#E8DFCA]',
    card: 'bg-white/80 backdrop-blur-sm border border-[#D4B483]',
    text: {
      primary: 'text-[#2D3A25]',
      secondary: 'text-[#5D7B46]',
      accent: 'text-[#5D7B46]'
    },
    button: {
      primary: 'bg-[#5D7B46] hover:bg-[#3E4C22] text-white',
      secondary: 'bg-[#E8DFCA] hover:bg-[#D4B483] text-[#2D3A25] border border-[#D4B483]',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white'
    },
    input: 'bg-white border border-[#D4B483] text-[#2D3A25] placeholder-gray-500'
  }
};

export default function SuperAdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // États des données
  const [stats, setStats] = useState({
    totalModules: 0,
    totalEtablissements: 0,
    totalInscriptions: 0,
    revenusTotal: 0,
    totalFAQs: 0,
    totalTestimonials: 0,
    pendingTestimonials: 0
  });
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    waveNumber: '',
    mtnNumber: '',
    orangeNumber: '',
    whatsappNumber: '+22953727479'
  });
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    whatsappNumber: '+22953727479',
    contactEmail: 'lambdaart17@gmail.com',
    contactPhone: '+2290153727479',
    socialMedia: {
      facebook: 'https://facebook.com/lambdaart',
      instagram: 'https://instagram.com/lambdaart'
    },
    paymentMethods: ['wave', 'mtn-money', 'orange-money', 'carte-bancaire']
  });
  
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [etablissementsStats, setEtablissementsStats] = useState<any>({});
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // États UI
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentSection | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();
  const colors = themeColors[theme];

  // Dans les états, ajoutez :
const [showCreateEtablissement, setShowCreateEtablissement] = useState(false);
const [newEtablissement, setNewEtablissement] = useState({
  nom: '',
  email: '',
  contact: '',
  ville: '',
  responsable: ''
});

useEffect(() => {
  const calculateStats = async () => {
    const stats: any = {};
    const inscriptionsSnap = await getDocs(collection(db, 'inscriptions'));
    inscriptionsSnap.forEach(inscriptionDoc => {
      const inscription = inscriptionDoc.data();
      if (inscription.etablissementId) {
        if (!stats[inscription.etablissementId]) {
          stats[inscription.etablissementId] = { totalApprenants: 0 };
        }
        stats[inscription.etablissementId].totalApprenants++;
      }
    });
    setEtablissementsStats(stats);
  };

  if (etablissements.length > 0) {
    calculateStats();
  }
}, [etablissements]);

  // Gestion du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('lambdaart-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lambdaart-theme', newTheme);
  };

  // Chargement des données
  useEffect(() => {
    if (user && user.role === 'super_admin') {
      loadAllData();
    } else if (user && user.role !== 'super_admin') {
      router.push('/login');
    }
  }, [user]);

  const loadAllData = async () => {
    console.log('🔄 Début du chargement des données...');
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadAllSettings(),
        loadContentSections(),
        loadModules(),
        loadEtablissements(),
        loadFAQs(),
        loadTestimonials()
      ]);
      console.log('✅ Chargement des données terminé');
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [modulesSnap, etablissementsSnap, inscriptionsSnap, faqsSnap, testimonialsSnap] = await Promise.all([
        getDocs(collection(db, 'modules')),
        getDocs(collection(db, 'etablissements')),
        getDocs(collection(db, 'inscriptions')),
        getDocs(collection(db, 'faqs')),
        getDocs(collection(db, 'testimonials'))
      ]);

      const pendingTestimonials = testimonialsSnap.docs.filter(doc => !doc.data().isApproved).length;
      
      setStats({
        totalModules: modulesSnap.size,
        totalEtablissements: etablissementsSnap.size,
        totalInscriptions: inscriptionsSnap.size,
        revenusTotal: 0,
        totalFAQs: faqsSnap.size,
        totalTestimonials: testimonialsSnap.size,
        pendingTestimonials
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const loadAllSettings = async () => {
    try {
      const [globalDoc, paymentDoc] = await Promise.all([
        getDoc(doc(db, 'settings', 'global')),
        getDoc(doc(db, 'settings', 'paiement'))
      ]);

      if (globalDoc.exists()) {
        const data = globalDoc.data();
        setGlobalSettings(prev => ({
          ...prev,
          ...data,
          socialMedia: data.socialMedia || prev.socialMedia,
          paymentMethods: data.paymentMethods || prev.paymentMethods
        }));
      }

      if (paymentDoc.exists()) {
        const data = paymentDoc.data();
        setPaymentSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Erreur paramètres:', error);
    }
  };

  const loadContentSections = async () => {
    console.log('📄 Chargement des sections de contenu...');
    try {
      const snapshot = await getDocs(collection(db, 'contentSections'));
      console.log(`📊 ${snapshot.docs.length} sections trouvées`);
      const sections = snapshot.docs.map(doc => ({
        id: doc.id,
        key: doc.id,
        title: doc.data().title || `Section ${doc.id}`,
        content: doc.data().content || '',
        updatedAt: doc.data().updatedAt
      }));
      setContentSections(sections);
      console.log('✅ Sections de contenu chargées:', sections.length);
    } catch (error) {
      console.error('❌ Erreur contenu:', error);
    }
  };

  const loadModules = async () => {
    console.log('📚 Chargement des modules...');
    try {
      const snapshot = await getDocs(collection(db, 'modules'));
      console.log(`📊 ${snapshot.docs.length} modules trouvés`);
      const modulesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: data.slug || doc.id,
          title: data.title || 'Sans titre',
          shortDesc: data.shortDesc || data.description || '',
          longDesc: data.longDesc || data.description || '',
          iconSrc: data.iconSrc || data.image || '/default-icon.png',
          gallery: data.gallery || data.images || [],
          price: data.price || 0,
          duration: data.duration || 'Non spécifié',
          level: data.level || 'débutant',
          featured: data.featured || false,
          category: data.category || 'general',
          containerColor: data.containerColor,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });
      setModules(modulesData);
      console.log('✅ Modules chargés:', modulesData.length);
    } catch (error) {
      console.error('❌ Erreur modules:', error);
    }
  };

  const loadEtablissements = async () => {
    console.log('🏫 Chargement des établissements...');
    try {
      const snapshot = await getDocs(collection(db, 'etablissements'));
      console.log(`📊 ${snapshot.docs.length} établissements trouvés`);
      const etabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Etablissement[];
      setEtablissements(etabs);
      console.log('✅ Établissements chargés:', etabs.length);
    } catch (error) {
      console.error('❌ Erreur établissements:', error);
    }
  };

  // Fonction pour créer un établissement
const handleCreateEtablissement = async () => {
  if (!user) {
    alert('❌ Erreur: utilisateur non authentifié');
    return;
  }

  try {
    const etablissementData = {
      ...newEtablissement,
      statut: 'actif',
      dateCreation: new Date(),
      createdBy: user.uid,
      // Générer un ID unique pour le lien d'inscription
      invitationId: `ETAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const docRef = await addDoc(collection(db, 'etablissements'), etablissementData);
    
    // Générer le lien d'invitation
    const invitationLink = `${window.location.origin}/admin/etablissement/inscription?token=${etablissementData.invitationId}`;
    
    // Réinitialiser le formulaire
    setNewEtablissement({
      nom: '',
      email: '',
      contact: '',
      ville: '',
      responsable: ''
    });
    setShowCreateEtablissement(false);
    
    // Afficher le lien d'invitation
    alert(`✅ Établissement créé !\n\nLien d'invitation : ${invitationLink}\n\nCopiez ce lien et envoyez-le à l'établissement.`);
    
    await loadEtablissements();
    await loadStats();
    
  } catch (error) {
    alert('❌ Erreur création établissement');
    console.error(error);
  }
};

const generateInvitationLink = (etabId: string) => {
  const etab = etablissements.find(e => e.id === etabId);
  if (etab && etab.invitationId) {
    const invitationLink = `${window.location.origin}/admin/etablissement/inscription?token=${etab.invitationId}`;
    alert(`Lien d'invitation pour ${etab.nom}:\n\n${invitationLink}`);
  } else {
    alert("Impossible de générer le lien : token d'invitation non trouvé.");
  }
};

  const loadFAQs = async () => {
    console.log('❓ Chargement des FAQs...');
    try {
      const faqsData = await getFAQs();
      console.log(`📊 ${faqsData.length} FAQs trouvées`);
      setFaqs(faqsData);
      console.log('✅ FAQs chargées:', faqsData.length);
    } catch (error) {
      console.error('❌ Erreur chargement FAQs:', error);
    }
  };

  const loadTestimonials = async () => {
    console.log('⭐ Chargement des témoignages...');
    try {
      const testimonialsData = await getTestimonials(false); // Tous les témoignages
      console.log(`📊 ${testimonialsData.length} témoignages trouvés`);
      setTestimonials(testimonialsData);
      console.log('✅ Témoignages chargés:', testimonialsData.length);
    } catch (error) {
      console.error('❌ Erreur chargement témoignages:', error);
    }
  };

  // Fonctions de sauvegarde
  const saveGlobalSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...globalSettings,
        updatedAt: new Date()
      }, { merge: true });
      alert('✅ Paramètres globaux sauvegardés !');
    } catch (error) {
      alert('❌ Erreur sauvegarde paramètres');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'paiement'), {
        ...paymentSettings,
        updatedAt: new Date()
      }, { merge: true });
      alert('✅ Paramètres de paiement sauvegardés !');
    } catch (error) {
      alert('❌ Erreur sauvegarde paiement');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveContentSection = async (section: ContentSection) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'contentSections', section.id), {
        ...section,
        updatedAt: new Date()
      }, { merge: true });
      setEditingContent(null);
      await loadContentSections();
      alert('✅ Contenu sauvegardé !');
    } catch (error) {
      alert('❌ Erreur sauvegarde contenu');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModule = async (moduleData: any) => {
    try {
      const moduleWithDefaults = {
        ...moduleData,
        featured: moduleData.featured || false,
        createdAt: moduleData.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (moduleData.id) {
        await updateDoc(doc(db, 'modules', moduleData.id), moduleWithDefaults);
      } else {
        await addDoc(collection(db, 'modules'), moduleWithDefaults);
      }
      
      setEditingModule(null);
      setIsAddingModule(false);
      await loadModules();
      alert('✅ Module sauvegardé !');
    } catch (error) {
      alert('❌ Erreur sauvegarde module');
      console.error(error);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        await deleteDoc(doc(db, 'modules', id));
        setModules(modules.filter(module => module.id !== id));
        alert('✅ Module supprimé !');
      } catch (error) {
        alert('❌ Erreur suppression module');
        console.error(error);
      }
    }
  };

  // Fonctions FAQ
  const handleSaveFAQ = async (faqData: Omit<FAQ, 'id'> & { id?: string }) => {
    setSaving(true);
    try {
      await saveFAQ(faqData);
      setEditingFAQ(null);
      setIsAddingFAQ(false);
      await loadFAQs();
      await loadStats();
      alert('✅ FAQ sauvegardée !');
    } catch (error) {
      alert('❌ Erreur sauvegarde FAQ');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      try {
        await deleteFAQ(id);
        setFaqs(faqs.filter(faq => faq.id !== id));
        await loadStats();
        alert('✅ FAQ supprimée !');
      } catch (error) {
        alert('❌ Erreur suppression FAQ');
        console.error(error);
      }
    }
  };

  // Fonctions Témoignages
  const handleApproveTestimonial = async (id: string) => {
    try {
      await approveTestimonial(id);
      await loadTestimonials();
      await loadStats();
      alert('✅ Témoignage approuvé !');
    } catch (error) {
      alert('❌ Erreur approbation témoignage');
      console.error(error);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      try {
        await deleteTestimonial(id);
        setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
        await loadStats();
        alert('✅ Témoignage supprimé !');
      } catch (error) {
        alert('❌ Erreur suppression témoignage');
        console.error(error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Écrans de chargement
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.background}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#B08D57] mx-auto"></div>
          <p className={`mt-4 ${colors.text.primary}`}>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.background}`}>
        <div className="text-center">
          <p className={`text-xl ${colors.text.primary}`}>Accès non autorisé</p>
          <button 
            onClick={() => router.push('/login')}
            className={`mt-4 px-6 py-2 rounded-lg ${colors.button.primary}`}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${colors.background} transition-colors duration-300 overflow-hidden`}>
      {/* Sidebar avec animation - gérée par le composant AdminSidebar */}
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        onLogout={handleLogout}
        theme={theme}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-auto">
        {/* Header */}
        <header className={`${colors.header} p-4 border-b sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className={`text-xl font-bold ${colors.text.primary}`}>
                {activeSection === 'dashboard' && 'Tableau de Bord'}
                {activeSection === 'modules' && 'Gestion des Modules'}
                {activeSection === 'etablissements' && 'Établissements'}
                {activeSection === 'contenu' && 'Contenu du Site'}
                {activeSection === 'faq' && 'Gestion des FAQs'}
                {activeSection === 'temoignages' && 'Gestion des Témoignages'}
                {activeSection === 'paiement' && 'Paramètres de Paiement'}
                {activeSection === 'parametres' && 'Paramètres Généraux'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${colors.button.secondary}`}
              >
                {theme === 'dark' ? <FiSun className="text-yellow-300" /> : <FiMoon className="text-gray-600" />}
              </button>

              <div className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${colors.text.primary}`}>
                  {user.nom || user.email}
                </p>
                <p className={`text-xs ${colors.text.secondary}`}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {/* SECTION DASHBOARD */}
            {activeSection === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    { label: 'Modules', value: stats.totalModules, color: 'from-blue-500 to-blue-600', icon: FiBook },
                    { label: 'Établissements', value: stats.totalEtablissements, color: 'from-green-500 to-green-600', icon: FiUsers },
                    { label: 'Inscriptions', value: stats.totalInscriptions, color: 'from-purple-500 to-purple-600', icon: FiEdit },
                    { label: 'FAQs', value: stats.totalFAQs, color: 'from-orange-500 to-orange-600', icon: FiHelpCircle },
                    { label: 'Témoignages', value: stats.totalTestimonials, color: 'from-pink-500 to-pink-600', icon: FiMessageCircle },
                    { label: 'En attente', value: stats.pendingTestimonials, color: 'from-yellow-500 to-yellow-600', icon: FiClock },
                    { label: 'Revenus Total', value: `${stats.revenusTotal.toLocaleString()} FCFA`, color: 'from-emerald-500 to-emerald-600', icon: FiCreditCard }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 lg:p-6 text-white shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">{stat.label}</p>
                          <p className="text-2xl lg:text-3xl font-bold mt-2">{stat.value}</p>
                        </div>
                        <stat.icon className="text-2xl opacity-80" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${colors.card} rounded-xl p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
                      Actions Rapides
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Ajouter Module', section: 'modules', icon: FiPlus },
                        { label: 'Gérer Contenu', section: 'contenu', icon: FiEdit2 },
                        { label: 'Gérer FAQs', section: 'faq', icon: FiHelpCircle },
                        { label: 'Témoignages', section: 'temoignages', icon: FiMessageCircle },
                        { label: 'Paramètres', section: 'parametres', icon: FiSettings },
                        { label: 'Établissements', section: 'etablissements', icon: FiUsers }
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => setActiveSection(action.section)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${colors.button.secondary}`}
                        >
                          <action.icon className="text-lg" />
                          <span className="text-sm font-medium text-center">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`${colors.card} rounded-xl p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
                      Activité Récente
                    </h3>
                    <div className="space-y-3">
                      {stats.pendingTestimonials > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                          <FiClock className="text-yellow-500" />
                          <div>
                            <p className="text-sm font-medium text-yellow-600">
                              {stats.pendingTestimonials} témoignage(s) en attente
                            </p>
                            <button 
                              onClick={() => setActiveSection('temoignages')}
                              className="text-xs text-yellow-700 underline"
                            >
                              Vérifier maintenant
                            </button>
                          </div>
                        </div>
                      )}
                      <p className={colors.text.secondary}>
                        {stats.pendingTestimonials === 0 && 'Aucune activité récente'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION MODULES (garder le code existant) */}
            {activeSection === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* ... Le code existant pour les modules ... */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Gestion des Modules</h2>
                    <p className={colors.text.secondary}>{modules.length} module(s) disponible(s)</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingModule(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${colors.button.primary} self-start`}
                  >
                    <FiPlus />
                    Nouveau Module
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {modules.map((module) => (
                    <motion.div
                     key={module.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className={`${colors.card} rounded-xl p-6`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-lg font-semibold ${colors.text.primary}`}>
                          {module.title}
                        </h3>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setEditingModule(module)}
                            className={`p-2 rounded-lg ${colors.button.secondary}`}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteModule(module.id)}
                            className={`p-2 rounded-lg ${colors.button.danger}`}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <p className={`mb-4 line-clamp-2 ${colors.text.secondary}`}>
                        {module.shortDesc}
                      </p>
                      
                      <div className="flex items-center mb-4">
                        <img 
                          src={module.iconSrc} 
                          alt="Icône" 
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <span className={`text-sm block ${colors.text.secondary}`}>{module.slug}</span>
                          <span className={`text-sm ${colors.text.secondary}`}>{module.category}</span>
                        </div>
                      </div>

                      {module.gallery && module.gallery.length > 0 && (
                        <div className="mb-4">
                          <p className={`text-sm font-medium mb-2 ${colors.text.secondary}`}>
                            Gallery ({module.gallery.length} image(s))
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {module.gallery.slice(0, 3).map((img: string, index: number) => (
                              <img 
                                key={index} 
                                src={img} 
                                alt={`Gallery ${index}`}
                                className="h-20 w-full object-cover rounded"
                              />
                            ))}
                            {module.gallery.length > 3 && (
                              <div className={`h-20 w-full rounded flex items-center justify-center ${theme === 'dark' ? 'bg-[#3E4C22]' : 'bg-[#E8DFCA]'}`}>
                                <span className={`text-sm ${colors.text.secondary}`}>
                                  +{module.gallery.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-lg font-bold ${colors.text.accent}`}>
                          {module.price.toLocaleString()} FCFA
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {module.level}
                        </span>
                      </div>

                      {module.featured && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                          ⭐ En vedette
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {(isAddingModule || editingModule) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                      <ModuleForm 
                        module={editingModule}
                        onClose={() => {
                          setEditingModule(null);
                          setIsAddingModule(false);
                        }}
                        onSave={handleSaveModule}
                        theme={theme}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* SECTION FAQ */}
            {activeSection === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Gestion des FAQs</h2>
                    <p className={colors.text.secondary}>{faqs.length} question(s) fréquente(s)</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingFAQ(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${colors.button.primary} self-start`}
                  >
                    <FiPlus />
                    Nouvelle FAQ
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  {faqs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${colors.card} rounded-xl p-6`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-2 ${colors.text.primary}`}>
                            {faq.question}
                          </h3>
                          <p className={`whitespace-pre-line ${colors.text.secondary}`}>
                            {faq.answer}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {faq.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              faq.isActive 
                                ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                            }`}>
                              {faq.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                            }`}>
                              Ordre: {faq.order}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingFAQ(faq)}
                            className={`p-2 rounded-lg ${colors.button.secondary}`}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className={`p-2 rounded-lg ${colors.button.danger}`}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {faqs.length === 0 && (
                  <div className={`${colors.card} rounded-xl p-8 text-center`}>
                    <FiHelpCircle className={`text-4xl mx-auto mb-4 ${colors.text.secondary}`} />
                    <p className={colors.text.secondary}>Aucune FAQ créée</p>
                    <button 
                      onClick={() => setIsAddingFAQ(true)}
                      className={`mt-4 px-6 py-2 rounded-lg ${colors.button.primary}`}
                    >
                      + Créer la première FAQ
                    </button>
                  </div>
                )}

                {/* Modal Édition FAQ */}
                <AnimatePresence>
                  {(isAddingFAQ || editingFAQ) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                      <div className={`rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto ${colors.card}`}>
                        <h3 className={`text-xl font-bold mb-4 ${colors.text.primary}`}>
                          {editingFAQ ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                              Question
                            </label>
                            <input
                              type="text"
                              value={editingFAQ?.question || ''}
                              onChange={(e) => setEditingFAQ(prev => prev ? {...prev, question: e.target.value} : {
                                id: '',
                                question: e.target.value,
                                answer: '',
                                category: 'formations',
                                order: faqs.length + 1,
                                isActive: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                              })}
                              className={`w-full p-3 rounded-lg ${colors.input}`}
                              placeholder="Entrez la question..."
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                              Réponse
                            </label>
                            <textarea
                              value={editingFAQ?.answer || ''}
                              onChange={(e) => setEditingFAQ(prev => prev ? {...prev, answer: e.target.value} : {
                                id: '',
                                question: '',
                                answer: e.target.value,
                                category: 'formations',
                                order: faqs.length + 1,
                                isActive: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                              })}
                              rows={4}
                              className={`w-full p-3 rounded-lg resize-none ${colors.input}`}
                              placeholder="Entrez la réponse..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                                Catégorie
                              </label>
                              <select
                                value={editingFAQ?.category || 'formations'}
                                onChange={(e) => setEditingFAQ(prev => prev ? {...prev, category: e.target.value} : {
                                  id: '',
                                  question: '',
                                  answer: '',
                                  category: e.target.value,
                                  order: faqs.length + 1,
                                  isActive: true,
                                  createdAt: new Date(),
                                  updatedAt: new Date()
                                })}
                                className={`w-full p-3 rounded-lg ${colors.input}`}
                              >
                                <option value="formations">Formations</option>
                                <option value="inscriptions">Inscriptions</option>
                                <option value="paiement">Paiement</option>
                                <option value="general">Général</option>
                              </select>
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                                Ordre d'affichage
                              </label>
                              <input
                                type="number"
                                value={editingFAQ?.order || faqs.length + 1}
                                onChange={(e) => setEditingFAQ(prev => prev ? {...prev, order: parseInt(e.target.value)} : {
                                  id: '',
                                  question: '',
                                  answer: '',
                                  category: 'formations',
                                  order: parseInt(e.target.value),
                                  isActive: true,
                                  createdAt: new Date(),
                                  updatedAt: new Date()
                                })}
                                className={`w-full p-3 rounded-lg ${colors.input}`}
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isActive"
                              checked={editingFAQ?.isActive ?? true}
                              onChange={(e) => setEditingFAQ(prev => prev ? {...prev, isActive: e.target.checked} : {
                                id: '',
                                question: '',
                                answer: '',
                                category: 'formations',
                                order: faqs.length + 1,
                                isActive: e.target.checked,
                                createdAt: new Date(),
                                updatedAt: new Date()
                              })}
                              className="rounded"
                            />
                            <label htmlFor="isActive" className={`text-sm ${colors.text.primary}`}>
                              FAQ active (visible sur le site)
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap mt-6">
                          <button
                            onClick={() => handleSaveFAQ(editingFAQ!)}
                            disabled={saving || !editingFAQ?.question || !editingFAQ?.answer}
                            className={`px-4 py-2 rounded-lg ${colors.button.primary} disabled:opacity-50`}
                          >
                            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingFAQ(null);
                              setIsAddingFAQ(false);
                            }}
                            className={`px-4 py-2 rounded-lg ${colors.button.secondary}`}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* SECTION TÉMOIGNAGES */}
            {activeSection === 'temoignages' && (
              <motion.div
                key="temoignages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
                    Gestion des Témoignages
                  </h2>
                  <p className={colors.text.secondary}>
                    {testimonials.filter(t => t.isApproved).length} approuvé(s) • {' '}
                    {testimonials.filter(t => !t.isApproved).length} en attente
                  </p>
                </div>

                {/* Témoignages en attente */}
                {testimonials.filter(t => !t.isApproved).length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
                      ⏳ Témoignages en attente de validation
                    </h3>
                    <div className="grid grid-cols-1 gap-4 lg:gap-6 mb-8">
                      {testimonials
                        .filter(t => !t.isApproved)
                        .map((testimonial) => (
                          <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${colors.card} rounded-xl p-6 border-l-4 border-yellow-500`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex-1">
                                    <h4 className={`font-semibold ${colors.text.primary}`}>
                                      {testimonial.name}
                                    </h4>
                                    <p className={`text-sm ${colors.text.secondary}`}>
                                      {testimonial.email}
                                    </p>
                                    {testimonial.moduleName && (
                                      <p className={`text-xs ${colors.text.secondary} mt-1`}>
                                        Module: {testimonial.moduleName}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={`${
                                          i < testimonial.rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                        size={16}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <p className={`italic mb-3 ${colors.text.secondary}`}>
                                  "{testimonial.quote}"
                                </p>
                                
                                {testimonial.title && (
                                  <p className={`text-sm font-medium ${colors.text.accent}`}>
                                    {testimonial.title}
                                  </p>
                                )}
                                
                                <p className={`text-xs ${colors.text.secondary} mt-2`}>
                                  Soumis le {testimonial.createdAt?.toDate?.().toLocaleDateString() || 'Date inconnue'}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveTestimonial(testimonial.id)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.button.success}`}
                                >
                                  <FiCheck size={14} />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleDeleteTestimonial(testimonial.id)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.button.danger}`}
                                >
                                  <FiTrash2 size={14} />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Témoignages approuvés */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
                    ✅ Témoignages approuvés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {testimonials
                      .filter(t => t.isApproved)
                      .map((testimonial) => (
                        <motion.div
                          key={testimonial.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`${colors.card} rounded-xl p-6 border-l-4 border-green-500`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${colors.text.primary}`}>
                                {testimonial.name}
                              </h4>
                              <p className={`text-sm ${colors.text.secondary}`}>
                                {testimonial.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`${
                                    i < testimonial.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  size={16}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className={`italic mb-3 ${colors.text.secondary}`}>
                            "{testimonial.quote}"
                          </p>
                          
                          {testimonial.title && (
                            <p className={`text-sm font-medium ${colors.text.accent}`}>
                              {testimonial.title}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-4">
                            <p className={`text-xs ${colors.text.secondary}`}>
                              Approuvé le {testimonial.updatedAt?.toDate?.().toLocaleDateString() || 'Date inconnue'}
                            </p>
                            <button
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className={`p-2 rounded-lg ${colors.button.danger}`}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {testimonials.length === 0 && (
                  <div className={`${colors.card} rounded-xl p-8 text-center`}>
                    <FiMessageCircle className={`text-4xl mx-auto mb-4 ${colors.text.secondary}`} />
                    <p className={colors.text.secondary}>Aucun témoignage reçu</p>
                    <p className={`text-sm ${colors.text.secondary} mt-2`}>
                      Les témoignages soumis par les utilisateurs apparaîtront ici.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* SECTION CONTENU DU SITE */}
{activeSection === 'contenu' && (
  <motion.div
    key="contenu"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
        Gestion du Contenu du Site
      </h2>
      <p className={colors.text.secondary}>
        Modifiez le contenu des différentes sections de votre site
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:gap-6">
      {contentSections.map((section) => (
        <div key={section.id} className={`${colors.card} rounded-xl p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h3 className={`text-xl font-semibold ${colors.text.primary}`}>
              {section.title}
            </h3>
            <button
              onClick={() => setEditingContent(section)}
              className={`px-4 py-2 rounded-lg ${colors.button.primary} self-start lg:self-auto`}
            >
              Modifier
            </button>
          </div>
          <p className={`whitespace-pre-line ${colors.text.secondary} line-clamp-3`}>
            {section.content}
          </p>
        </div>
      ))}
    </div>

    {contentSections.length === 0 && (
      <div className={`${colors.card} rounded-xl p-8 text-center`}>
        <FiEdit className={`text-4xl mx-auto mb-4 ${colors.text.secondary}`} />
        <p className={colors.text.secondary}>Aucune section de contenu trouvée</p>
        <p className={`text-sm ${colors.text.secondary} mt-2`}>
          Les sections de contenu modifiable apparaîtront ici.
        </p>
      </div>
    )}

    {/* Modal Édition Contenu */}
    <AnimatePresence>
      {editingContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto ${colors.card}`}>
            <h3 className={`text-xl font-bold mb-4 ${colors.text.primary}`}>
              Modifier: {editingContent.title}
            </h3>
            <textarea
              value={editingContent.content}
              onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
              rows={12}
              className={`w-full p-3 rounded-lg mb-4 resize-none ${colors.input}`}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => saveContentSection(editingContent)}
                disabled={saving}
                className={`px-4 py-2 rounded-lg ${colors.button.primary} disabled:opacity-50`}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => setEditingContent(null)}
                className={`px-4 py-2 rounded-lg ${colors.button.secondary}`}
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)}


{/* SECTION PARAMÈTRES GÉNÉRAUX */}
{activeSection === 'parametres' && (
  <motion.div
    key="parametres"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
        Paramètres Généraux
      </h2>
      <p className={colors.text.secondary}>
        Configurez les paramètres globaux de votre application
      </p>
    </div>

    <div className={`${colors.card} rounded-xl p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
        Informations de contact
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Numéro WhatsApp
          </label>
          <input
            type="text"
            value={globalSettings.whatsappNumber}
            onChange={(e) => setGlobalSettings(prev => ({...prev, whatsappNumber: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="+22953727479"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Email de contact
          </label>
          <input
            type="email"
            value={globalSettings.contactEmail}
            onChange={(e) => setGlobalSettings(prev => ({...prev, contactEmail: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="lambdaart17@gmail.com"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Téléphone de contact
          </label>
          <input
            type="text"
            value={globalSettings.contactPhone}
            onChange={(e) => setGlobalSettings(prev => ({...prev, contactPhone: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="+2290153727479"
          />
        </div>
      </div>

      <h3 className={`text-lg font-semibold mt-6 mb-4 ${colors.text.primary}`}>
        Réseaux sociaux
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Facebook
          </label>
          <input
            type="url"
            value={globalSettings.socialMedia.facebook}
            onChange={(e) => setGlobalSettings(prev => ({
              ...prev, 
              socialMedia: {...prev.socialMedia, facebook: e.target.value}
            }))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="https://facebook.com/lambdaart"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Instagram
          </label>
          <input
            type="url"
            value={globalSettings.socialMedia.instagram}
            onChange={(e) => setGlobalSettings(prev => ({
              ...prev, 
              socialMedia: {...prev.socialMedia, instagram: e.target.value}
            }))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="https://instagram.com/lambdaart"
          />
        </div>
      </div>

      <h3 className={`text-lg font-semibold mt-6 mb-4 ${colors.text.primary}`}>
        Méthodes de paiement acceptées
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['wave', 'mtn-money', 'orange-money', 'carte-bancaire'].map((method) => (
          <label key={method} className={`flex items-center gap-2 ${colors.text.primary}`}>
            <input
              type="checkbox"
              checked={globalSettings.paymentMethods.includes(method)}
              onChange={(e) => {
                const newMethods = e.target.checked
                  ? [...globalSettings.paymentMethods, method]
                  : globalSettings.paymentMethods.filter(m => m !== method);
                setGlobalSettings(prev => ({...prev, paymentMethods: newMethods}));
              }}
              className="rounded"
            />
            <span className="capitalize">
              {method === 'wave' && 'Wave'}
              {method === 'mtn-money' && 'MTN Money'}
              {method === 'orange-money' && 'Orange Money'}
              {method === 'carte-bancaire' && 'Carte Bancaire'}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mt-6">
        <button
          onClick={saveGlobalSettings}
          disabled={saving}
          className={`px-4 py-2 rounded-lg ${colors.button.primary} disabled:opacity-50`}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  </motion.div>
)}


{/* SECTION PARAMÈTRES DE PAIEMENT */}
{activeSection === 'paiement' && (
  <motion.div
    key="paiement"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
        Paramètres de Paiement
      </h2>
      <p className={colors.text.secondary}>
        Configurez les numéros pour les différents modes de paiement
      </p>
    </div>

    <div className={`${colors.card} rounded-xl p-6`}>
      <h3 className={`text-lg font-semibold mb-6 ${colors.text.primary}`}>
        Numéros de paiement mobile
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Numéro Wave
          </label>
          <input
            type="text"
            value={paymentSettings.waveNumber}
            onChange={(e) => setPaymentSettings(prev => ({...prev, waveNumber: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="Numéro Wave"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Numéro MTN Money
          </label>
          <input
            type="text"
            value={paymentSettings.mtnNumber}
            onChange={(e) => setPaymentSettings(prev => ({...prev, mtnNumber: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="Numéro MTN Money"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Numéro Orange Money
          </label>
          <input
            type="text"
            value={paymentSettings.orangeNumber}
            onChange={(e) => setPaymentSettings(prev => ({...prev, orangeNumber: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="Numéro Orange Money"
          />
        </div>

        <div>
          <label className={`block mb-2 font-semibold ${colors.text.primary}`}>
            Numéro WhatsApp (Contact)
          </label>
          <input
            type="text"
            value={paymentSettings.whatsappNumber}
            onChange={(e) => setPaymentSettings(prev => ({...prev, whatsappNumber: e.target.value}))}
            className={`w-full p-3 rounded-lg ${colors.input}`}
            placeholder="+22953727479"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-6">
        <button
          onClick={savePaymentSettings}
          disabled={saving}
          className={`px-4 py-2 rounded-lg ${colors.button.primary} disabled:opacity-50`}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>

    <div className={`${colors.card} rounded-xl p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${colors.text.primary}`}>
        Instructions de paiement
      </h3>
      <p className={colors.text.secondary}>
        Les utilisateurs pourront effectuer leurs paiements via les numéros configurés ci-dessus.
        Assurez-vous que les numéros sont corrects et actifs.
      </p>
    </div>
  </motion.div>
)}

{/* SECTION ÉTABLISSEMENTS */}
{activeSection === 'etablissements' && (
  <motion.div
    key="etablissements"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>
          Gestion des Établissements
        </h2>
        <p className={colors.text.secondary}>
          {etablissements.length} établissement(s) partenaire(s)
        </p>
      </div>
      <button 
        onClick={() => setShowCreateEtablissement(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${colors.button.primary} self-start`}
      >
        <FiPlus />
        Créer un établissement
      </button>
    </div>

    {/* Cartes des établissements */}
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {etablissements.map((etab) => (
        <motion.div
          key={etab.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${colors.card} rounded-xl p-6`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-lg font-semibold ${colors.text.primary}`}>
              {etab.nom}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              etab.statut === 'actif' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {etab.statut}
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className={`flex items-center gap-2 ${colors.text.secondary}`}>
              <FiUsers size={14} />
              {etab.responsable || 'Non spécifié'}
            </p>
            <p className={`flex items-center gap-2 ${colors.text.secondary}`}>
              <FiMail size={14} />
              {etab.email}
            </p>
            <p className={`flex items-center gap-2 ${colors.text.secondary}`}>
              <FiPhone size={14} />
              {etab.contact}
            </p>
            <p className={`flex items-center gap-2 ${colors.text.secondary}`}>
              <FiMapPin size={14} />
              {etab.ville}
            </p>
          </div>

          {/* Statistiques rapides */}
          <div className={`border-t pt-3 ${theme === 'dark' ? 'border-[#3E4C22]' : 'border-[#D4B483]'}`}>
            <div className="flex justify-between text-sm">
              <span className={colors.text.secondary}>Apprenants:</span>
              <span className={`font-semibold ${colors.text.accent}`}>
                {/* À calculer depuis les inscriptions */}
                {etablissementsStats[etab.id]?.totalApprenants || 0}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => generateInvitationLink(etab.id)}
              className={`flex-1 px-3 py-2 rounded-lg ${colors.button.secondary} text-sm`}
            >
              Lien d'invitation
            </button>
            <button className={`p-2 rounded-lg ${colors.button.danger}`}>
              <FiTrash2 size={14} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>

    {etablissements.length === 0 && (
      <div className={`${colors.card} rounded-xl p-8 text-center`}>
        <FiUsers className={`text-4xl mx-auto mb-4 ${colors.text.secondary}`} />
        <p className={colors.text.secondary}>Aucun établissement créé</p>
        <p className={`text-sm ${colors.text.secondary} mt-2`}>
          Créez votre premier établissement pour commencer à gérer vos partenaires.
        </p>
        <button 
          onClick={() => setShowCreateEtablissement(true)}
          className={`mt-4 px-6 py-2 rounded-lg ${colors.button.primary}`}
        >
          + Créer le premier établissement
        </button>
      </div>
    )}

    {/* Modal Création Établissement */}
    <AnimatePresence>
      {showCreateEtablissement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className={`rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto ${colors.card}`}>
            <h3 className={`text-xl font-bold mb-4 ${colors.text.primary}`}>
              Créer un nouvel établissement
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={newEtablissement.nom}
                  onChange={(e) => setNewEtablissement(prev => ({...prev, nom: e.target.value}))}
                  className={`w-full p-3 rounded-lg ${colors.input}`}
                  placeholder="Ex: Lycée Technique de Cotonou"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newEtablissement.email}
                    onChange={(e) => setNewEtablissement(prev => ({...prev, email: e.target.value}))}
                    className={`w-full p-3 rounded-lg ${colors.input}`}
                    placeholder="contact@etablissement.com"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    value={newEtablissement.contact}
                    onChange={(e) => setNewEtablissement(prev => ({...prev, contact: e.target.value}))}
                    className={`w-full p-3 rounded-lg ${colors.input}`}
                    placeholder="+229 XX XX XX XX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={newEtablissement.ville}
                    onChange={(e) => setNewEtablissement(prev => ({...prev, ville: e.target.value}))}
                    className={`w-full p-3 rounded-lg ${colors.input}`}
                    placeholder="Cotonou"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${colors.text.primary}`}>
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={newEtablissement.responsable}
                    onChange={(e) => setNewEtablissement(prev => ({...prev, responsable: e.target.value}))}
                    className={`w-full p-3 rounded-lg ${colors.input}`}
                    placeholder="Nom du responsable"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mt-6">
              <button
                onClick={handleCreateEtablissement}
                disabled={!newEtablissement.nom || !newEtablissement.email || !newEtablissement.contact}
                className={`px-4 py-2 rounded-lg ${colors.button.primary} disabled:opacity-50`}
              >
                Créer et générer le lien
              </button>
              <button
                onClick={() => setShowCreateEtablissement(false)}
                className={`px-4 py-2 rounded-lg ${colors.button.secondary}`}
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)}


            {/* Autres sections existantes (contenu, etablissements, parametres, paiement) */}
            {/* ... Garder le code existant pour ces sections ... */}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
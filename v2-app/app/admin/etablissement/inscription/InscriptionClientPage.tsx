'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { motion } from 'framer-motion';

export default function InscriptionClientPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [etablissement, setEtablissement] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nomResponsable: '',
    telephone: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const q = query(collection(db, 'etablissements'), where('invitationId', '==', token));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('Lien d\'invitation invalide ou expiré');
        return;
      }

      const etabDoc = snapshot.docs[0];
      const etabData = etabDoc.data();
      
      if (etabData.statut !== 'actif') {
        setError('Cet établissement n\'est pas actif');
        return;
      }

      setEtablissement({
        id: etabDoc.id,
        ...etabData
      });
      
      // Pré-remplir l\'email
      setFormData(prev => ({...prev, email: etabData.email}));
      
    } catch (error) {
      setError('Erreur de vérification du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSubmitting(true);

    try {
      // Créer le compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Créer le document user avec le rôle établissement
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        role: 'etablissement',
        nom: formData.nomResponsable,
        etablissementId: etablissement.id,
        etablissementNom: etablissement.nom,
        telephone: formData.telephone,
        createdAt: new Date(),
        active: true
      });

      // Mettre à jour l\'établissement avec les infos du responsable
      await setDoc(doc(db, 'etablissements', etablissement.id), {
        responsableComplet: formData.nomResponsable,
        telephoneResponsable: formData.telephone,
        compteCree: true,
        dateActivation: new Date()
      }, { merge: true });

      setSuccess(true);
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email');
      } else {
        setError('Erreur lors de la création du compte');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#B08D57] mx-auto"></div>
          <p className="mt-4">Vérification du lien d\'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Lien invalide</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Compte créé avec succès !</h1>
          <p className="mb-6">Votre compte établissement a été activé.</p>
          <a 
            href="/admin/etablissement"
            className="bg-[#B08D57] hover:bg-[#8B6B3D] text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Accéder au dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1F16] via-[#2D3A25] to-[#3E4C22] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Activation de compte
          </h1>
          <p className="text-gray-600">
            {etablissement?.nom} - {etablissement?.ville}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du responsable *
            </label>
            <input
              type="text"
              required
              value={formData.nomResponsable}
              onChange={(e) => setFormData(prev => ({...prev, nomResponsable: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-[#B08D57] outline-none"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="text"
              required
              value={formData.telephone}
              onChange={(e) => setFormData(prev => ({...prev, telephone: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-[#B08D57] outline-none"
              placeholder="+229 XX XX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-[#B08D57] outline-none"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B08D57] focus:border-[#B08D57] outline-none"
              placeholder="Retapez votre mot de passe"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#B08D57] hover:bg-[#8B6B3D] text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50"
          >
            {submitting ? 'Création du compte...' : 'Activer mon compte'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

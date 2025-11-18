// hooks/useAuth.ts
"use client"; // ⚠️ AJOUTEZ CETTE LIGNE

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          console.log('🔍 Utilisateur auth détecté, chargement des données...');
          
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userWithData: User = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email!,
              ...userData 
            } as User;
            
            setUser(userWithData);
            console.log('✅ Données utilisateur chargées:', userData.role);
          } else {
            console.warn('⚠️ Document user non trouvé dans Firestore');
            setError('Profil utilisateur incomplet');
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: 'unknown',
              nom: 'Utilisateur'
            } as User);
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('❌ Erreur chargement données utilisateur:', err);
        
        if (err.code === 'permission-denied') {
          setError('Permissions insuffisantes. Vérifiez les règles Firestore.');
        } else {
          setError('Erreur de chargement des données utilisateur');
        }
        
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
}
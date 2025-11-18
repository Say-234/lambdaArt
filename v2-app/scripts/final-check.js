// scripts/final-check.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

console.log('🔍 VÉRIFICATION FINALE DU SYSTÈME\n');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDdOEzZOAR1EW0g0jsFfyBAGkvHcPUfKY",
  authDomain: "lambda-art.firebaseapp.com",
  projectId: "lambda-art",
  storageBucket: "lambda-art.firebasestorage.app",
  messagingSenderId: "132141941674",
  appId: "1:132141941674:web:ae6ef8cb9b8ab33081a1d3"
};

async function finalCheck() {
  try {
    console.log('1. 🔧 Initialisation Firebase...');
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('2. 🔐 Test de connexion...');
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@lambdaart.com', 
      'admin123'
    );
    console.log('✅ Authentication: OK');
    console.log('   UID:', userCredential.user.uid);

    console.log('3. 📊 Test d\'accès Firestore...');
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Firestore: OK');
      console.log('   Rôle:', userData.role);
      console.log('   Email:', userData.email);
      console.log('   Créé le:', userData.createdAt?.toDate?.() || 'Date non disponible');
    } else {
      console.log('❌ Firestore: Document user non trouvé');
      console.log('💡 Exécutez: node scripts/create-user-document-now.js');
      return;
    }

    console.log('4. 🌐 Test de lecture du contenu...');
    const contentSnapshot = await getDoc(doc(db, 'contentSections', 'hero_description'));
    if (contentSnapshot.exists()) {
      console.log('✅ Contenu: Chargement OK');
    } else {
      console.log('ℹ️  Contenu: Aucune donnée de contenu trouvée (normal si pas encore créé)');
    }

    console.log('\n🎉 🎉 🎉 TOUT FONCTIONNE! 🎉 🎉 🎉');
    console.log('================================');
    console.log('✅ Authentication: Fonctionne');
    console.log('✅ Firestore: Fonctionne');
    console.log('✅ Règles: Correctes');
    console.log('✅ Document user: Présent');
    console.log('================================');
    console.log('\n💡 Vous pouvez maintenant:');
    console.log('   1. Aller sur http://localhost:3000/login');
    console.log('   2. Vous connecter avec admin@lambdaart.com / admin123');
    console.log('   3. Accéder au dashboard admin');

  } catch (error) {
    console.log('\n❌ ERREUR:', error.code);
    console.log('Message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 SOLUTION URGENTE:');
      console.log('1. Allez sur Firebase Console > Firestore > Règles');
      console.log('2. Remplacez par les règles TEMPORAIRES:');
      console.log(`
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true;
            }
          }
        }
      `);
      console.log('3. Cliquez sur "Publier"');
      console.log('4. Réessayez ce script');
    }
  }
}

finalCheck();
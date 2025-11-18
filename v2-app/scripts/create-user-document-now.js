// scripts/create-user-document-now.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

console.log('🚀 CRÉATION DU DOCUMENT USER (avec règles ouvertes)\n');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDdOEzZOAR1EW0g0jsFfyBAGkvHcPUfKY",
  authDomain: "lambda-art.firebaseapp.com",
  projectId: "lambda-art",
  storageBucket: "lambda-art.firebasestorage.app",
  messagingSenderId: "132141941674",
  appId: "1:132141941674:web:ae6ef8cb9b8ab33081a1d3"
};

async function createUserDocument() {
  try {
    console.log('1. 🔧 Initialisation Firebase...');
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const adminEmail = 'admin@lambdaart.com';
    const adminPassword = 'admin123';

    console.log('2. 🔐 Connexion avec admin@lambdaart.com...');
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const userId = userCredential.user.uid;
    
    console.log('✅ Connexion réussie!');
    console.log('   UID:', userId);
    console.log('   Email:', userCredential.user.email);

    console.log('3. 📝 Création du document user dans Firestore...');
    
    const userData = {
      email: adminEmail,
      role: 'super_admin',
      nom: 'Super Administrateur Lambda Art',
      createdAt: new Date(),
      permissions: ['all'],
      etablissementId: null,
      active: true,
      lastLogin: new Date()
    };

    await setDoc(doc(db, 'users', userId), userData);

    console.log('4. ✅ DOCUMENT USER CRÉÉ AVEC SUCCÈS!');
    console.log('\n📋 Données sauvegardées:');
    console.log(JSON.stringify(userData, null, 2));
    
    console.log('\n🎉 TOUT EST PRÊT MAINTENANT!');
    console.log('💡 Vous pouvez vous connecter sur: http://localhost:3000/login');

  } catch (error) {
    console.log('\n❌ ERREUR:', error.code);
    console.log('Message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 PROBLÈME: Les règles Firestore sont toujours restrictives');
      console.log('💡 Vérifiez que vous avez bien publié les règles temporaires:');
      console.log('   1. Firebase Console > Firestore > Règles');
      console.log('   2. Collez les règles temporaires');
      console.log('   3. Cliquez sur "Publier"');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('\n🔧 Problème d\'authentification');
      console.log('💡 Vérifiez email/mot de passe');
    }
  }
}

createUserDocument();
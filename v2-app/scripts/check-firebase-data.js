// scripts/check-firebase-data.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

console.log('🔍 DIAGNOSTIC DES DONNÉES FIREBASE\n');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDdOEzZOAR1EW0g0jsFfyBAGkvHcPUfKY",
  authDomain: "lambda-art.firebaseapp.com",
  projectId: "lambda-art",
  storageBucket: "lambda-art.firebasestorage.app",
  messagingSenderId: "132141941674",
  appId: "1:132141941674:web:ae6ef8cb9b8ab33081a1d3"
};

async function checkFirebaseData() {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app);

    console.log('📊 COLLECTIONS À VÉRIFIER:\n');

    // Vérifier les collections principales
    const collections = [
      'users',
      'etablissements', 
      'contentSections',
      'modules',
      'settings',
      'inscriptions'
    ];

    for (const collectionName of collections) {
      console.log(`\n📁 ${collectionName.toUpperCase()}:`);
      
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        if (querySnapshot.empty) {
          console.log('   ❌ AUCUN DOCUMENT');
        } else {
          console.log(`   ✅ ${querySnapshot.size} document(s) trouvé(s)`);
          
          // Afficher les premiers documents pour inspection
          querySnapshot.docs.slice(0, 3).forEach((docSnap, index) => {
            console.log(`   📄 Document ${index + 1}:`, docSnap.id);
            console.log('      Data:', JSON.stringify(docSnap.data(), null, 2).substring(0, 200) + '...');
          });
        }
      } catch (error) {
        console.log(`   ❌ ERREUR: ${error.message}`);
      }
    }

    // Vérification spécifique des settings
    console.log('\n⚙️  VÉRIFICATION DES PARAMÈTRES:');
    
    const settingsToCheck = ['global', 'paiement'];
    for (const setting of settingsToCheck) {
      try {
        const docRef = doc(db, 'settings', setting);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`   ✅ settings/${setting}: PRÉSENT`);
          console.log('      Data:', JSON.stringify(docSnap.data(), null, 2));
        } else {
          console.log(`   ❌ settings/${setting}: MANQUANT`);
        }
      } catch (error) {
        console.log(`   ❌ settings/${setting}: ERREUR - ${error.message}`);
      }
    }

    // Vérification du contenu du site
    console.log('\n📝 VÉRIFICATION DU CONTENU DU SITE:');
    
    const contentSections = [
      'hero_description',
      'formations_description', 
      'marketplace_description',
      'testimonials_description'
    ];

    for (const section of contentSections) {
      try {
        const docRef = doc(db, 'contentSections', section);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`   ✅ contentSections/${section}: PRÉSENT`);
          const data = docSnap.data();
          console.log(`      Titre: ${data.title || 'Non défini'}`);
          console.log(`      Contenu: ${data.content ? data.content.substring(0, 50) + '...' : 'Vide'}`);
        } else {
          console.log(`   ❌ contentSections/${section}: MANQUANT`);
        }
      } catch (error) {
        console.log(`   ❌ contentSections/${section}: ERREUR - ${error.message}`);
      }
    }

    console.log('\n🎯 RECOMMANDATIONS:');
    
    // Vérifier ce qui manque
    const missingData = [];
    
    // Vérifier les établissements
    const etablissementsSnapshot = await getDocs(collection(db, 'etablissements'));
    if (etablissementsSnapshot.empty) {
      missingData.push('❌ Aucun établissement créé');
    }
    
    // Vérifier les modules
    const modulesSnapshot = await getDocs(collection(db, 'modules'));
    if (modulesSnapshot.empty) {
      missingData.push('❌ Aucun module créé');
    }
    
    // Vérifier le contenu
    const contentSnapshot = await getDocs(collection(db, 'contentSections'));
    if (contentSnapshot.empty) {
      missingData.push('❌ Aucun contenu de site configuré');
    }

    if (missingData.length > 0) {
      console.log('\n🚨 DONNÉES MANQUANTES:');
      missingData.forEach(item => console.log(`   ${item}`));
    } else {
      console.log('\n✅ TOUTES LES DONNÉES PRÉSENTES!');
    }

  } catch (error) {
    console.log('❌ ERREUR GLOBALE:', error);
  }
}

checkFirebaseData();
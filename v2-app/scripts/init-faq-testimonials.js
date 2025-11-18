// scripts/init-faq-testimonials.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

console.log('🚀 INITIALISATION DES COLLECTIONS FAQ ET TESTIMONIALS\n');

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDdOEzZOAR1EW0g0jsFfyBAGkvHcPUfKY",
  authDomain: "lambda-art.firebaseapp.com",
  projectId: "lambda-art",
  storageBucket: "lambda-art.firebasestorage.app",
  messagingSenderId: "132141941674",
  appId: "1:132141941674:web:ae6ef8cb9b8ab33081a1d3"
};

async function initCollections() {
  try {
    console.log('1. 🔧 Initialisation Firebase...');
    const app = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const adminEmail = 'admin@lambdaart.com';
    const adminPassword = 'admin123';

    console.log('2. 🔐 Connexion avec admin@lambdaart.com...');
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    console.log('✅ Connexion réussie!');

    console.log('3. 📝 Création des FAQs par défaut...');
    
    const defaultFAQs = [
      {
        question: "Comment fonctionnent les formations chez Lambda'Art ?",
        answer: "Nos formations sont pratiques et accessibles à tous les niveaux. Chaque module combine théorie et pratique avec un accompagnement personnalisé. Vous apprenez à votre rythme avec des formateurs expérimentés.",
        category: "formations",
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: "Quels sont les prérequis pour participer aux formations ?",
        answer: "Aucun prérequis spécifique ! Nos formations sont conçues pour les débutants comme pour les personnes ayant déjà de l'expérience. L'essentiel est la motivation et l'envie d'apprendre.",
        category: "inscriptions",
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: "Comment puis-je payer ma formation ?",
        answer: "Nous acceptons les paiements via Wave, MTN Money, Orange Money et cartes bancaires. Des facilités de paiement sont possibles sur demande. Contactez-nous pour discuter des options.",
        category: "paiement",
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const faq of defaultFAQs) {
      await addDoc(collection(db, 'faqs'), faq);
      console.log(`   ✅ FAQ créée: "${faq.question.substring(0, 50)}..."`);
    }

    console.log('4. 📝 Création des témoignages par défaut...');

    const defaultTestimonials = [
      {
        name: "Marie K.",
        email: "marie@email.com",
        title: "Formation Exceptionnelle",
        quote: "Une expérience incroyable ! Les formateurs sont très pédagogues et le cadre d'apprentissage est stimulant.",
        rating: 5,
        isApproved: true,
        moduleName: "Création de Bijoux",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Jean D.",
        email: "jean@email.com",
        title: "Très satisfait",
        quote: "En tant que débutant complet, j'ai apprécié la patience des formateurs. La formation est bien structurée.",
        rating: 4,
        isApproved: true,
        moduleName: "Menuiserie Basique",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const testimonial of defaultTestimonials) {
      await addDoc(collection(db, 'testimonials'), testimonial);
      console.log(`   ✅ Témoignage créé: "${testimonial.name}" - ${testimonial.isApproved ? 'Approuvé' : 'En attente'}`);
    }

    console.log('\n🎉 COLLECTIONS INITIALISÉES AVEC SUCCÈS!');
    console.log('📊 Résumé:');
    console.log(`   • ${defaultFAQs.length} FAQs créées`);
    console.log(`   • ${defaultTestimonials.length} témoignages créés`);

  } catch (error) {
    console.log('\n❌ ERREUR:', error.code);
    console.log('Message:', error.message);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n🔧 Solution: Créez d\'abord le compte admin avec:');
      console.log('   node scripts/create-user-document-now.js');
    }
  }
}

initCollections();
// app/login/page.tsx
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { HeroHeader } from '@/components/hero-header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const router = useRouter();

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Removed duplicated/accidental top-level login logic; the login flow is handled inside handleLogin below.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      setError('Email ou mot de passe incorrect');
      console.error('Erreur connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const themeColors = {
    dark: {
      background: 'from-[#1A1F16] via-[#2D3A25] to-[#3E4C22]',
      text: 'text-white',
      card: 'bg-[#2D3A25]/50 border-[#3E4C22]',
      input: 'bg-[#2D3A25] border-[#3E4C22] text-white'
    },
    light: {
      background: 'from-[#F5F1E8] via-[#E8DFCA] to-[#D4B483]',
      text: 'text-[#2D3A25]',
      card: 'bg-white/50 border-[#D4B483]',
      input: 'bg-white border-[#D4B483] text-[#2D3A25]'
    }
  };

  const currentTheme = themeColors[theme];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <HeroHeader theme={theme} toggleTheme={toggleTheme} whatsappNumber="+22953727479" />
      
      <section className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${currentTheme.background} px-6 pt-24`}>
        <div className="max-w-md w-full">
          <div className={`backdrop-blur-sm rounded-2xl border-2 ${currentTheme.card} p-8 shadow-xl`}>
            <h1 className={`text-3xl font-bold text-center mb-8 ${currentTheme.text}`}>
              Connexion Admin
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full p-3 border rounded-md ${currentTheme.input} focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 outline-none transition-all`}
                  placeholder="admin@lambdaart.com"
                />
              </div>
              
              <div>
                <label className={`block mb-2 font-semibold ${currentTheme.text}`}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full p-3 border rounded-md ${currentTheme.input} focus:border-[#B08D57] focus:ring-2 focus:ring-[#B08D57]/20 outline-none transition-all`}
                  placeholder="Votre mot de passe"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  theme === 'dark' ? 'bg-[#B08D57] hover:bg-[#8B6B3D]' : 'bg-[#5D7B46] hover:bg-[#3E4C22]'
                } text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className={`mt-6 p-4 rounded-md bg-opacity-20 ${
              theme === 'dark' ? 'bg-[#B08D57]' : 'bg-[#5D7B46]'
            }`}>
              <p className={`text-sm text-center ${currentTheme.text}`}>
                <strong>Compte de test :</strong><br />
                Email: admin@lambdaart.com<br />
                Mot de passe: admin123
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
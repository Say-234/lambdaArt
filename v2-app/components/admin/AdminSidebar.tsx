// components/admin/AdminSidebar.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Import des icônes
import { 
  IconDashboard, 
  IconSettings, 
  IconFileText, 
  IconSchool, 
  IconLogout, 
  IconCoin, 
  IconBook, 
  IconMenu2, 
  IconX,
  IconHelp,
  IconMessage
} from "@tabler/icons-react";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
  onLogout: () => void;
  theme: 'light' | 'dark';
}

const themeColors = {
  dark: {
    sidebar: 'bg-[#1A1F16] border-r border-[#2D3A25]',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      accent: 'text-[#B08D57]'
    },
    active: {
      bg: 'bg-[#B08D57]/20',
      border: 'border-[#B08D57]',
      text: 'text-[#B08D57]'
    },
    hover: 'hover:bg-[#2D3A25]'
  },
  light: {
    sidebar: 'bg-[#F5F1E8] border-r border-[#E8DFCA]',
    text: {
      primary: 'text-[#2D3A25]',
      secondary: 'text-[#5D7B46]',
      accent: 'text-[#5D7B46]'
    },
    active: {
      bg: 'bg-[#5D7B46]/20',
      border: 'border-[#5D7B46]',
      text: 'text-[#5D7B46]'
    },
    hover: 'hover:bg-[#E8DFCA]'
  }
};

export function AdminSidebar({
  activeSection,
  setActiveSection,
  user,
  onLogout,
  theme
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const colors = themeColors[theme];

  // Effet pour la détection mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true); // Toujours ouvert sur desktop
      } else {
        setIsOpen(false); // Fermé par défaut sur mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effet séparé pour gérer le défilement
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isOpen]);

  const links = [
    {
      label: "Dashboard",
      section: "dashboard",
      icon: <IconDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Modules",
      section: "modules", 
      icon: <IconBook className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Établissements",
      section: "etablissements",
      icon: <IconSchool className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Contenu Site",
      section: "contenu",
      icon: <IconFileText className="h-5 w-5 shrink-0" />,
    },
    {
      label: "FAQs",
      section: "faq",
      icon: <IconHelp className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Témoignages",
      section: "temoignages",
      icon: <IconMessage className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Paiements",
      section: "paiement",
      icon: <IconCoin className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Paramètres",
      section: "parametres",
      icon: <IconSettings className="h-5 w-5 shrink-0" />,
    },
  ];

  const handleLinkClick = (section: string) => {
    setActiveSection(section);
    if (isMobile) {
      setIsOpen(false); // Ferme la sidebar sur mobile après clic
    }
  };

  return (
    <>
      {/* Bouton menu mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden",
            theme === 'dark' 
              ? 'bg-[#2D3A25] text-white' 
              : 'bg-[#E8DFCA] text-[#2D3A25]',
            "shadow-lg"
          )}
          aria-label="Ouvrir le menu"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
      )}

      {/* Overlay mobile avec animation */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            role="button"
            aria-label="Fermer le menu"
          />
        )}
      </AnimatePresence>

      {/* Sidebar avec animations améliorées */}
      <motion.div
        initial={false}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -320) : 0,
          width: isMobile ? 280 : (isOpen ? 256 : 80),
          opacity: isMobile ? (isOpen ? 1 : 0) : 1,
          boxShadow: isMobile && isOpen ? '8px 0 32px rgba(0, 0, 0, 0.2)' : 'none'
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
          bounce: 0.1,
          mass: 0.5,
          restDelta: 0.01
        }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full border-r transition-all duration-300",
          "lg:shadow-none",
          colors.sidebar,
          isMobile ? "w-[280px]" : isOpen ? "w-64" : "w-20",
          "transform-gpu" // Améliore les performances des animations
        )}
        style={{
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          WebkitTransform: 'translateZ(0)', // Améliore le rendu sur iOS
        }}
      >
        {/* Header avec bouton de fermeture amélioré */}
        <div className="flex items-center justify-between p-4 border-b border-opacity-20">
          <div className="flex-1">
            {isOpen || !isMobile ? <Logo theme={theme} /> : <LogoIcon theme={theme} />}
          </div>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-2 rounded-full transition-colors",
                theme === 'dark' 
                  ? 'text-gray-300 hover:bg-gray-700/50' 
                  : 'text-gray-600 hover:bg-gray-200/50',
                "active:scale-95 transform transition-transform"
              )}
              aria-label="Fermer le menu"
            >
              <IconX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-1 px-3">
            {links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleLinkClick(link.section || 'dashboard')}
                className={cn(
                  "flex items-center gap-3 w-full text-left p-3 rounded-lg transition-all duration-200 group",
                  activeSection === link.section 
                    ? cn(colors.active.bg, "border-l-2", colors.active.border, colors.active.text, "font-semibold") 
                    : cn(colors.text.secondary, "hover:bg-opacity-10 hover:bg-white", "font-medium")
                )}
              >
                {React.cloneElement(link.icon, {
                  className: cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    activeSection === link.section 
                      ? colors.active.text
                      : colors.text.secondary
                  )
                })}
                <AnimatePresence>
                  {(isOpen || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-opacity-20">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg mb-3",
            theme === 'dark' ? 'bg-[#2D3A25]' : 'bg-[#E8DFCA]'
          )}>
            <div className={cn(
              "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold",
              theme === 'dark' ? 'bg-[#B08D57]' : 'bg-[#5D7B46]'
            )}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <AnimatePresence>
              {(isOpen || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className={cn("text-sm font-medium truncate", colors.text.primary)}>
                    {user?.nom || user?.email}
                  </p>
                  <p className={cn("text-xs truncate", colors.text.secondary)}>
                    {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 w-full text-left p-3 rounded-lg transition-all duration-200",
              theme === 'dark' 
                ? 'text-red-400 hover:bg-red-400/10 hover:text-red-300' 
                : 'text-red-500 hover:bg-red-500/10 hover:text-red-600',
              "font-medium"
            )}
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {(isOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </>
  );
}

export const Logo = ({ theme }: { theme: 'light' | 'dark' }) => {
  const colors = themeColors[theme];
  
  return (
    <div className="flex items-center space-x-3">
      <div className={cn(
        "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center",
        theme === 'dark' ? 'bg-[#B08D57]' : 'bg-[#5D7B46]'
      )}>
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className={cn("font-bold text-lg", colors.text.primary)}>
        Lambda'Art
      </span>
    </div>
  );
};

const LogoIcon = ({ theme }: { theme: 'light' | 'dark' }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={cn(
        "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center",
        theme === 'dark' ? 'bg-[#B08D57]' : 'bg-[#5D7B46]'
      )}>
        <span className="text-white font-bold text-sm">L</span>
      </div>
    </div>
  );
};
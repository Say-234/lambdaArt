// components/admin/EtablissementSidebar.tsx
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconDashboard,
  IconUsers,
  IconLink,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EtablissementSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
}

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: React.ReactElement;
    section?: string;
  };
  onClick?: () => void;
  className?: string;
}

const CustomSidebarLink = ({ link, onClick, className }: SidebarLinkProps) => {
  return (
    <div onClick={onClick} className={className}>
      <SidebarLink link={link} />
    </div>
  );
};

export function EtablissementSidebar({ activeSection, setActiveSection, user }: EtablissementSidebarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      section: "dashboard",
      icon: <IconDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Mes Étudiants",
      section: "etudiants",
      icon: <IconUsers className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Lien d'Inscription",
      section: "lien",
      icon: <IconLink className="h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <CustomSidebarLink 
                key={idx} 
                link={{
                  href: "#",
                  icon: React.cloneElement(link.icon, {
                    className: cn(
                      "h-5 w-5 shrink-0",
                      activeSection === link.section 
                        ? "text-[#B08D57]" 
                        : "text-neutral-700 dark:text-neutral-200"
                    )
                  }),
                  label: link.label
                }}
                onClick={() => setActiveSection(link.section)}
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  activeSection === link.section 
                    ? "bg-[#B08D57]/10 text-[#B08D57] border-r-2 border-[#B08D57]" 
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
              />
            ))}
          </div>
        </div>
        
        <div>
          <SidebarLink
            link={{
              label: user?.email || "Établissement",
              href: "#",
              icon: (
                <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "E"}
                </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

const Logo = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-500" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Mon Établissement
      </motion.span>
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-500" />
    </a>
  );
};
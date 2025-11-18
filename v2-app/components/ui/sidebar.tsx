// components/ui/sidebar.tsx
"use client";
import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

export function Sidebar({ children, open, setOpen, className }: SidebarProps) {
  const [openState, setOpenState] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Gestion responsive
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setOpenState(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const contextValue = {
    open: open !== undefined ? open : openState,
    setOpen: setOpen !== undefined ? setOpen : setOpenState,
    isMobile,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className={cn(
        "flex h-full relative",
        className
      )}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, isMobile } = useSidebar();

  return (
    <>
      {/* Sidebar Desktop */}
      <motion.div
        className={cn(
          "hidden lg:flex h-full flex-col border-r bg-background transition-all duration-300",
          open ? "w-64" : "w-20",
          className
        )}
        initial={false}
        animate={{ width: open ? 256 : 80 }}
      >
        {children}
      </motion.div>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobile && open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => useSidebar().setOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden border-r bg-background"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarLinkProps {
  link: {
    icon: React.ReactElement;
    label: string;
    href?: string;
  };
  className?: string;
}

export function SidebarLink({ link, className }: SidebarLinkProps) {
  const { open } = useSidebar();

  return (
    <a
      href={link.href || "#"}
      className={cn(
        "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(link.icon, {
          className: cn(link.icon.props.className, "shrink-0"),
        })}
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-pre font-medium overflow-hidden"
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </a>
  );
}
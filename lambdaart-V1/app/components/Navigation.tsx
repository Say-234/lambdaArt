"use client";
import Link from "next/link";
import { ShoppingBag, BookOpen, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-light/80 backdrop-blur-lg border-b border-dark/10 shadow-sm">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-title font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Lambda'Art
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/formations"
              className="flex items-center space-x-2 text-dark/80 hover:text-primary transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              <span>Formations</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center space-x-2 text-dark/80 hover:text-primary transition-all duration-300"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            <Button variant="ghost" size="icon" className="text-dark/80 hover:text-primary">
              <User className="w-5 h-5" />
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-dark/80 hover:text-primary">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-light border-dark/10">
                <SheetHeader>
                  <SheetTitle className="font-title text-primary">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <Link
                    href="/formations"
                    className="flex items-center space-x-2 text-dark/80 hover:text-primary transition-all duration-300"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Formations</span>
                  </Link>
                  <Link
                    href="/marketplace"
                    className="flex items-center space-x-2 text-dark/80 hover:text-primary transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Marketplace</span>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-dark/80 hover:text-primary">
                    <User className="w-5 h-5" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

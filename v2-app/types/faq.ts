export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Testimonial {
  id: string;
  name: string;
  email: string;
  title: string;
  quote: string;
  rating: number;
  isApproved: boolean;
  moduleId?: string;
  moduleName?: string;
  createdAt: any;
  updatedAt?: any;
  expiresAt?: any; // Pour la suppression automatique après 15 jours
}
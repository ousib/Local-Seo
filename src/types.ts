export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

export type PlanId = 'free' | 'starter' | 'pro' | 'agency';
export type BillingCycle = 'monthly' | 'quarterly' | 'biannual' | 'yearly';

export interface PlanDetails {
  id: PlanId;
  name: string;
  price: {
    monthly: number;
    quarterly: number;
    biannual: number;
    yearly: number;
  };
  limits: {
    generations: number;
    businesses: number;
  };
  features: string[];
}

export interface UserUsage {
  userId: string;
  currentPlan: PlanId;
  billingCycle: BillingCycle;
  generationsUsed: number;
  generationLimit: number;
  renewalDate: string;
  businessesUsed: number;
  businessLimit: number;
}

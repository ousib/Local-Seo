import { PlanDetails } from "./types";

export const PLANS: PlanDetails[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: {
      monthly: 19,
      quarterly: 49,
      biannual: 89,
      yearly: 168
    },
    limits: {
      generations: 60,
      businesses: 1
    },
    features: [
      "1 business/location",
      "60 generations/month",
      "GBP post generation",
      "Review response generation",
      "Basic exports"
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: {
      monthly: 39,
      quarterly: 105,
      biannual: 199,
      yearly: 348
    },
    limits: {
      generations: 250,
      businesses: 5
    },
    features: [
      "5 businesses/locations",
      "250 generations/month",
      "Local landing pages",
      "Service area pages",
      "Advanced SEO workflows",
      "Advanced exports",
      "Priority support"
    ]
  },
  {
    id: 'agency',
    name: 'Agency Plan',
    price: {
      monthly: 79,
      quarterly: 219,
      biannual: 399,
      yearly: 708
    },
    limits: {
      generations: 800,
      businesses: 25
    },
    features: [
      "25 businesses/locations",
      "800 generations/month",
      "White-label exports",
      "Team collaboration",
      "Priority support",
      "Agency workflow tools"
    ]
  }
];

export const FREE_LIMITS = {
  visitor: 5,
  registered: 10
};

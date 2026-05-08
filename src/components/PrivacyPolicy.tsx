import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 text-accent hover:underline flex items-center"
        >
          &larr; Back to Home
        </button>
        
        <div className="glass-panel p-10 rounded-3xl">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>

          <div className="prose prose-invert max-w-none text-white/70 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, generate content, or communicate with us. This includes your email address and any business details you input into our generators.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our platform and users.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Advertising and Analytics</h2>
              <p>We may use third-party advertising companies to serve ads when you visit our website. These companies may use cookies and other tracking technologies to collect information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Content Ownership</h2>
              <p>Content generated using our AI tools is owned by the user who generated it. However, we do not guarantee the uniqueness of AI-generated content across multiple users.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at support@local-seo-suite.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

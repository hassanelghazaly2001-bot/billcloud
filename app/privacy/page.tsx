import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy | Billcloud",
  description: "Learn how Billcloud protects your data and respects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-cyan-600 font-bold mb-12 hover:underline transition-all"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-4xl font-black mb-8 text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest font-bold">Last Updated: March 2026</p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">1. Information We Collect</h2>
            <p>Billcloud is designed as a "privacy-first" tool. For guest users, all invoice data is stored locally in your browser's <code>localStorage</code>. We do not store this data on our servers unless you create an account.</p>
            <p>If you choose to sign up with Google, we collect your name, email address, and profile picture to provide your account features.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain the Service.</li>
              <li>Sync your invoice data across devices (for registered users).</li>
              <li>Improve our tool based on anonymous usage patterns.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">3. Data Security</h2>
            <p>We use industry-standard security measures to protect your data. However, please remember that no method of transmission over the internet or electronic storage is 100% secure.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">4. Third-Party Services</h2>
            <p>We use Google for authentication and Supabase for database management. These services have their own privacy policies which we recommend you review.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">5. US SEO Compliance</h2>
            <p>This policy is compliant with standard US SaaS requirements, including GDPR and CCPA where applicable for US residents.</p>
          </section>

          <section className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">If you have any questions about this Privacy Policy, please contact us at support@billcloud.io</p>
          </section>
        </article>
      </div>
    </div>
  );
}

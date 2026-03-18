import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Terms of Service | Billcloud",
  description: "Read our terms of service and usage conditions for the Billcloud invoice generator.",
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-black mb-8 text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest font-bold">Last Updated: March 2026</p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">1. Acceptance of Terms</h2>
            <p>By accessing or using the Billcloud Service, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">2. Description of Service</h2>
            <p>Billcloud is an online invoice generator for freelancers and small businesses. We provide tools to create, manage, and download professional PDF invoices.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">3. User Obligations</h2>
            <p>You are responsible for the accuracy of the information you provide and for ensuring that your use of the Service complies with all local laws, including tax regulations.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">4. Intellectual Property</h2>
            <p>The Billcloud name, logo, and overall design are protected by US copyright and trademark laws. You may not copy, reproduce, or modify our branding without permission.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">5. Limitation of Liability</h2>
            <p>Billcloud is provided "as is" without any warranty. We are not responsible for any financial errors, lost data, or legal disputes arising from your use of the tool.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">6. US Law Compliance</h2>
            <p>These terms are governed by the laws of the United States. Any disputes will be handled in the appropriate US jurisdiction.</p>
          </section>

          <section className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">For support or inquiries regarding these terms, please reach out to legal@billcloud.io</p>
          </section>
        </article>
      </div>
    </div>
  );
}

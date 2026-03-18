import { Metadata } from 'next';
import InvoicePage from '../../../src/components/InvoicePage';

export const metadata: Metadata = {
  title: 'Free Word to PDF Invoice Converter | Professional 2026 Templates',
  description: 'Stop struggling with Word. Use our instant generator for a professional PDF in 30 seconds. 100% Free, No Signup, US Letter standard.',
  keywords: 'word to pdf invoice, invoice converter, free invoice template word, professional invoice generator',
};

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <InvoicePage 
        nicheName="Word to PDF Converter"
        nicheH1="Free Word to PDF Invoice Converter"
        nicheSeoText="Stop struggling with Microsoft Word templates. Our instant generator creates professional, US Letter-standard PDF invoices in under 30 seconds."
      />
      
      <section className="py-20 bg-white border-t">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-6 text-slate-900">Why Billcloud is Better Than Word</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Microsoft Word is great for documents, but it's a nightmare for invoicing. Tables break, formatting shifts when you save to PDF, and calculations have to be done manually. 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2">Automatic Calculations</h3>
              <p className="text-sm text-slate-600">Billcloud handles all subtotals, taxes, and discounts automatically. No more calculator errors.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2">Perfect PDF Formatting</h3>
              <p className="text-sm text-slate-600">Every invoice is perfectly aligned to US Letter standards (8.5" x 11") every single time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

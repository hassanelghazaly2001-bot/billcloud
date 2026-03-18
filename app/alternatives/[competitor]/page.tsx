import { Metadata } from 'next';
import InvoicePage from '../../../src/components/InvoicePage';
import { competitors } from '../../../constants/competitors';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ competitor: string }>;
}

export async function generateStaticParams() {
  return competitors.map((c) => ({
    competitor: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params;
  const config = competitors.find((c) => c.slug === competitor);

  if (!config) {
    return {
      title: 'Alternative Not Found',
    };
  }

  return {
    title: `Best Free ${config.name} Alternative | No Signup Invoice | Billcloud`,
    description: config.seoDescription,
    keywords: `${config.name} alternative, free invoice generator, no signup invoice, professional billing`,
  };
}

export default async function Page({ params }: Props) {
  const { competitor } = await params;
  const config = competitors.find((c) => c.slug === competitor);

  if (!config) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <InvoicePage 
        nicheName={`Alternative to ${config.name}`}
        nicheH1={config.heroTitle}
        nicheSeoText={config.seoDescription}
      />
      
      {/* Comparison Section */}
      <section className="py-20 bg-white border-t">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-slate-900">
            Billcloud vs {config.name}: Why Switch?
          </h2>
          
          <div className="overflow-x-auto rounded-2xl border shadow-xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-6 text-sm font-bold uppercase tracking-widest text-slate-500">Feature</th>
                  <th className="p-6 text-xl font-black text-cyan-500">Billcloud</th>
                  <th className="p-6 text-sm font-bold text-slate-500">{config.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-6 font-bold text-slate-900">Pricing</td>
                  <td className="p-6 font-black text-cyan-500">100% Free (Forever)</td>
                  <td className="p-6 text-slate-600">Paid / Subscription</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900">Registration</td>
                  <td className="p-6 font-black text-cyan-500">No Signup Required</td>
                  <td className="p-6 text-slate-600">Login Required</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900">Ease of Use</td>
                  <td className="p-6 font-black text-cyan-500">Instant (Under 60s)</td>
                  <td className="p-6 text-slate-600">Complex Setup</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900">Niche Templates</td>
                  <td className="p-6 font-black text-cyan-500">HVAC, Cleaning, etc.</td>
                  <td className="p-6 text-slate-600">Generic Only</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-16 prose prose-slate max-w-none">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">The Billcloud Advantage</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Unlike {config.name}, Billcloud is built specifically for US-based small businesses and freelancers who value speed and privacy. We don't ask for your credit card, and we don't store your data on our servers. Everything happens locally in your browser, ensuring 100% data privacy while delivering a professional US Letter-standard PDF.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mt-4">
              Whether you're looking for a <strong>free {config.name} alternative</strong> for your photography business, construction company, or cleaning service, our niche-specific templates give you the professional edge without the monthly fee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

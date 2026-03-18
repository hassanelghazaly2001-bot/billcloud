import { Metadata } from 'next';
import InvoicePage from '../../../src/components/InvoicePage';
import { states } from '../../../constants/states';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return states.map((s) => ({
    state: s.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const config = states.find((s) => s.slug === state);

  if (!config) {
    return {
      title: 'Location Not Found',
    };
  }

  return {
    title: `Free Professional Invoice Generator for ${config.name} Businesses | Billcloud`,
    description: config.seoDescription,
    keywords: `${config.name} invoice, ${config.name} business forms, free invoice generator US, ${config.name} tax compliant`,
  };
}

export default async function Page({ params }: Props) {
  const { state } = await params;
  const config = states.find((s) => s.slug === state);

  if (!config) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <InvoicePage 
        nicheName={`${config.name} Business`}
        nicheH1={config.h1}
        nicheSeoText={config.seoDescription}
      />
      <div className="bg-white py-12 border-t no-print">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Looking for a different industry? Check our{' '}
            <Link href="/construction-invoice-template" className="text-cyan-600 hover:underline font-bold">Construction</Link>,{' '}
            <Link href="/photography-invoice-template" className="text-cyan-600 hover:underline font-bold">Photography</Link>, or{' '}
            <Link href="/cleaning-invoice-template" className="text-cyan-600 hover:underline font-bold">Cleaning</Link> templates.
          </p>
        </div>
      </div>
    </div>
  );
}

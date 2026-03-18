import { Metadata } from 'next';
import InvoicePage from '../../src/components/InvoicePage';
import { niches } from '../../constants/niches';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ niche: string }>;
}

export async function generateStaticParams() {
  return niches.map((n) => ({
    niche: n.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche } = await params;
  const config = niches.find((n) => n.slug === niche);

  if (!config) {
    return {
      title: 'Invoice Template Not Found',
    };
  }

  return {
    title: `Free ${config.name} Invoice Template 2026 | PDF & Print | Billcloud`,
    description: config.seoDescription,
    keywords: `${config.name} invoice, billing template, free invoice generator, US business forms`,
  };
}

export default async function Page({ params }: Props) {
  const { niche } = await params;
  const config = niches.find((n) => n.slug === niche);

  if (!config) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <InvoicePage 
        nicheName={config.name}
        nicheH1={config.h1}
        nicheSeoText={config.seoDescription}
        defaultNotes={config.defaultNotes}
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

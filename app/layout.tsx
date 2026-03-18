import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { niches } from "../constants/niches";
import { competitors } from "../constants/competitors";
import { states } from "../constants/states";
import GoogleAnalytics from "../src/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Online Invoice Generator | No Login Required",
  description: "Create professional PDF invoices instantly. 100% free, no sign-up, no registration. The fastest tool for US freelancers and small businesses.",
  keywords: "free invoice generator, no login invoice, professional pdf invoice, freelancer tools usa",
  openGraph: {
    title: "Instant Free Invoice Generator - No Account Needed",
    description: "Professional PDF invoices in seconds. Zero friction, just results.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': 
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], 
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); 
            })(window,document,'script','dataLayer','GTM-N8X34ZLW');`,
          }}
        />
        {/* Google AdSense Placeholder - Replace with your actual client ID when ready */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossorigin="anonymous"></script> */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <GoogleAnalytics />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N8X34ZLW"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <main className="flex-grow">{children}</main>

        <footer className="no-print bg-card text-muted-foreground py-12 border-t border-card-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-to-br from-[#22d3ee] to-[#0891b2] w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg">
                    B
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Billcloud</span>
                </Link>
                <p className="text-sm leading-relaxed max-w-md">
                  Professional Invoicing for US Freelancers. Create, print, and download high-quality invoices in seconds. Optimized for US Letter standard and tax-compliant layouts.
                </p>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                <h3 className="text-foreground font-bold uppercase tracking-wider text-xs mb-4">Invoice Templates</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {niches.map((niche) => (
                    <Link 
                      key={niche.slug} 
                      href={`/${niche.slug}`}
                      className="text-sm hover:text-cyan-400 transition-colors"
                    >
                      {niche.name} Invoice
                    </Link>
                  ))}
                </div>
              </div>

              <div className="col-span-1 lg:col-span-1">
                <h3 className="text-foreground font-bold uppercase tracking-wider text-xs mb-4">Legal</h3>
                <div className="flex flex-col gap-y-2">
                  <Link href="/privacy" className="text-sm hover:text-cyan-400 transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="text-sm hover:text-cyan-400 transition-colors">Terms of Service</Link>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-card-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">&copy; 2026 Billcloud. All Rights Reserved. US SEO Compliant.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-cyan-500 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-cyan-500 transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Ko-fi Widget */}
        <script src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (typeof kofiWidgetOverlay !== 'undefined') {
                  kofiWidgetOverlay.draw('billcloud', {
                    'type': 'floating-chat',
                    'floating-chat.donateButton.text': 'Tip Us',
                    'floating-chat.donateButton.background-color': '#fcbf47',
                    'floating-chat.donateButton.text-color': '#323842'
                  });
                }
              });
            `
          }}
        />
      </body>
    </html>
  );
}

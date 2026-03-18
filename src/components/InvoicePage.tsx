'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Phone, Mail, Sun, Moon, ArrowLeft, Check, X, ChevronDown, ChevronUp, LayoutDashboard, FileText, Users, Settings, LogIn, Menu, Download, Eye, Edit, Trash, ExternalLink, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';

export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="bg-gradient-to-br from-[#22d3ee] to-[#0891b2] w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
      B
    </div>
    <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Billcloud</span>
  </div>
);

interface InvoicePageProps {
  nicheName?: string;
  nicheH1?: string;
  nicheSeoText?: string;
  defaultNotes?: string;
}

export default function InvoicePage({ 
  nicheName = 'Standard', 
  nicheH1 = 'Professional US Invoice Generator', 
  nicheSeoText = 'Create, Print, and Download Professional Invoices for your US Business. No Sign-up, 100% Free.',
  defaultNotes = '' 
}: InvoicePageProps) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const prevUser = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'invoices' | 'clients' | 'settings'>('builder');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [view, setView] = useState<'landing' | 'new-invoice' | 'privacy' | 'terms'>('landing');

  // 1. Auth & Data Management
  useEffect(() => {
    setMounted(true);
    
    const handleAuth = async (session: any) => {
      if (session?.user) {
        setUser(session.user);
        prevUser.current = session.user;
        setView('new-invoice');
        setActiveTab('dashboard');
        
        // Sync local data to Supabase if it exists
        const invoicesData = localStorage.getItem('billcloud_saved_invoices');
        const clientsData = localStorage.getItem('billcloud_saved_clients');
        
        if (invoicesData) {
          try {
            const localInvoices = JSON.parse(invoicesData);
            if (localInvoices.length > 0) {
              await supabase.from('invoices').insert(
                localInvoices.map((inv: any) => ({ ...inv, user_id: session.user.id, id: undefined }))
              );
              localStorage.removeItem('billcloud_saved_invoices');
            }
          } catch (e) { console.error('Sync invoices failed', e); }
        }
        
        if (clientsData) {
          try {
            const localClients = JSON.parse(clientsData);
            if (localClients.length > 0) {
              await supabase.from('clients').insert(
                localClients.map((c: any) => ({ ...c, user_id: session.user.id, id: undefined }))
              );
              localStorage.removeItem('billcloud_saved_clients');
            }
          } catch (e) { console.error('Sync clients failed', e); }
        }
      } else {
        const isLoggingOut = prevUser.current !== null;
        setUser(null);
        prevUser.current = null;
        if (isLoggingOut) {
          setView('landing');
        }
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuth(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [darkMode, setDarkMode] = useState(false);

  // 2. Dark Mode Management
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  const [logo, setLogo] = useState<string | null>(null);
  const [company, setCompany] = useState({ name: '', address: '', phone: '', email: '' });
  const [client, setClient] = useState({ name: '', address: '', email: '' });
  
  // My Invoices & Clients state
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [savedClients, setSavedClients] = useState<any[]>([]);
  
  // US Date format MM/DD/YYYY
  const getTodayUS = () => {
    const d = new Date();
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getDueDateUS = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const [invoice, setInvoice] = useState({ 
    number: 'INV-2026-001', 
    date: getTodayUS(), 
    dueDate: getDueDateUS(),
    terms: 'Net 30' 
  });
  const [items, setItems] = useState([{ id: 1, name: '', qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState(defaultNotes);
  const [scale, setScale] = useState(0.7);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ad Slot Component
  const AdSlot = ({ className, type = 'horizontal', label = 'Advertisement' }: { className?: string, type?: 'horizontal' | 'vertical', label?: string }) => (
    <div 
      className={`no-print flex items-center justify-center bg-secondary border border-card-border rounded-xl overflow-hidden transition-all duration-300 ${className}`}
      style={{ 
        minHeight: type === 'horizontal' ? '90px' : '600px'
      }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 select-none">
        {label}
      </span>
    </div>
  );

  // 2. Local Storage Persistence
  useEffect(() => {
    if (!mounted) return;
    const storageKey = nicheName !== 'Standard' ? `billcloud_invoice_data_${nicheName.toLowerCase().replace(/\s+/g, '_')}` : 'billcloud_invoice_data';
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.company) setCompany(data.company);
        if (data.client) setClient(data.client);
        if (data.invoice) setInvoice(data.invoice);
        if (data.items) setItems(data.items);
        if (data.taxRate) setTaxRate(data.taxRate);
        if (data.discount) setDiscount(data.discount);
        if (data.notes) setNotes(data.notes);
        if (data.logo) setLogo(data.logo);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }

    // Load saved invoices and clients
    const loadData = async () => {
      if (user) {
        // Fetch from Supabase
        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
        if (invoices) setSavedInvoices(invoices);

        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true });
        if (clients) setSavedClients(clients);
      } else {
        // Fetch from Local Storage
        const invoicesData = localStorage.getItem('billcloud_saved_invoices');
        if (invoicesData) setSavedInvoices(JSON.parse(invoicesData));

        const clientsData = localStorage.getItem('billcloud_saved_clients');
        if (clientsData) setSavedClients(JSON.parse(clientsData));
      }
    };

    loadData();
  }, [mounted, nicheName, user]);

  // Persist current builder state for guests
  useEffect(() => {
    if (!mounted || user) return;
    const storageKey = nicheName !== 'Standard' ? `billcloud_invoice_data_${nicheName.toLowerCase().replace(/\s+/g, '_')}` : 'billcloud_invoice_data';
    const dataToSave = {
      company, client, invoice, items, taxRate, discount, notes, logo
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [company, client, invoice, items, taxRate, discount, notes, logo, mounted, user, nicheName]);

  // Persist invoices and clients for guests
  useEffect(() => {
    if (!mounted || user) return;
    localStorage.setItem('billcloud_saved_invoices', JSON.stringify(savedInvoices));
    localStorage.setItem('billcloud_saved_clients', JSON.stringify(savedClients));
  }, [savedInvoices, savedClients, mounted, user]);

  // 3. Responsive Scaling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        const newScale = (width - 32) / 794; 
        setScale(Math.min(newScale, 0.7));
      } else if (width < 1024) {
        setScale(0.6);
      } else {
        setScale(0.7);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. Calculations
  const subtotal = items.reduce((acc, item) => {
    const qty = Math.max(0, parseFloat(item.qty as any) || 0);
    const price = Math.max(0, parseFloat(item.price as any) || 0);
    const amount = qty * price;
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);
  const taxAmount = Math.max(0, (subtotal * Math.max(0, parseFloat(taxRate as any) || 0)) / 100);
  const discountVal = Math.max(0, parseFloat(discount as any) || 0);
  const total = Math.max(0, subtotal + taxAmount - discountVal);

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let newValue = value;
        if (field === 'qty' || field === 'price') {
          newValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        }
        return { ...item, [field]: newValue };
      }
      return item;
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById('invoice-preview'); 
    if (!element) return; 
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el.classList.contains('exclude-from-pdf')
      }); 
      const imgData = canvas.toDataURL('image/png'); 
      const pdf = new jsPDF('p', 'in', 'letter'); 
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11); 
      pdf.save(`Billcloud_Invoice_${invoice.number}.pdf`);
      
      // Save to My Invoices automatically
      const newInvoice = {
        number: invoice.number,
        client_name: client.name || 'Unnamed Client',
        date: invoice.date,
        total: total.toFixed(2),
        status: 'Pending',
        data: { logo, company, client, invoice, items, taxRate, discount, notes }
      };

      if (user) {
        // Save to Supabase
        const { data, error } = await supabase
          .from('invoices')
          .insert([{ ...newInvoice, user_id: user.id }])
          .select();
        
        if (data) {
          setSavedInvoices(prev => [data[0], ...prev]);
        }
      } else {
        // Save to Local state (which then persists to Local Storage via useEffect)
        setSavedInvoices(prev => [{ ...newInvoice, id: Date.now() }, ...prev]);
        // Show upsell modal for guests
        setShowUpsellModal(true);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!mounted) return;
    const storageKey = nicheName !== 'Standard' ? `billcloud_invoice_data_${nicheName.toLowerCase().replace(/\s+/g, '_')}` : 'billcloud_invoice_data';
    const data = { logo, company, client, invoice, items, taxRate, discount, notes };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setToast({ message: 'Invoice Saved Locally!', visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border-b transition-colors border-card-border">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-6 flex justify-between items-center text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-lg font-bold text-foreground">{question}</span>
          {isOpen ? <ChevronUp size={20} className="text-cyan-500" /> : <ChevronDown size={20} className="text-muted-foreground" />}
        </button>
        {isOpen && (
          <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-base leading-relaxed text-muted">{answer}</p>
          </div>
        )}
      </div>
    );
  };

  const UpsellModal = () => {
    if (!showUpsellModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div 
          className="w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 relative border border-card-border bg-card animate-in zoom-in-95 duration-300"
        >
          <button 
            onClick={() => setShowUpsellModal(false)}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors hover:bg-secondary text-muted-foreground"
          >
            <X size={20} />
          </button>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-500 mb-2">
              <FileText size={40} />
            </div>
            <h3 className="text-3xl font-black text-foreground">Don't lose your data!</h3>
            <p className="text-base leading-relaxed text-muted">
              Create a free account to save this invoice and manage your clients automatically.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <button 
              className="w-full flex items-center justify-center gap-4 bg-card border border-card-border text-foreground py-4 rounded-2xl font-black text-base hover:bg-secondary transition-all shadow-xl shadow-cyan-500/5"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Sign Up with Google
            </button>
            <button 
              onClick={() => setShowUpsellModal(false)}
              className="w-full py-2 rounded-xl font-bold text-sm transition-all text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => {
    const handleNavClick = (tab: any) => {
      if (!user && (tab === 'dashboard' || tab === 'invoices' || tab === 'clients' || tab === 'settings')) {
        supabase.auth.signInWithOAuth({ provider: 'google' });
        return;
      }
      setActiveTab(tab);
    };

    return (
      <div 
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out border-r no-print bg-card border-card-border ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'} `}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-10 px-2">
            {sidebarOpen ? <Logo /> : <div className="bg-gradient-to-br from-[#22d3ee] to-[#0891b2] w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">B</div>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
            >
              {sidebarOpen ? <ArrowLeft size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'builder', icon: Plus, label: 'New Invoice' },
              { id: 'invoices', icon: FileText, label: 'Invoices History' },
              { id: 'clients', icon: Users, label: 'Clients' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t mt-6 border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="space-y-4">
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500`}
                >
                  <LogOut size={20} />
                  {sidebarOpen && <span className="text-sm">Sign Out</span>}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400`}
              >
                <LogIn size={20} />
                {sidebarOpen && <span className="text-sm">Sign In</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Header = () => (
    <header 
      className="w-full transition-colors duration-300 no-print border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 bg-card border-card-border"
    >
      <div className="flex items-center gap-4">
        <Logo />
        {user && (
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {activeTab === 'builder' ? 'Invoice Builder' : 
               activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'invoices' ? 'Invoices History' : 
               activeTab === 'clients' ? 'Clients' : 'Settings'}
            </h1>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs font-bold hidden sm:inline text-slate-600 dark:text-slate-300">
                {user.user_metadata.full_name}
              </span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-all duration-300 border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-yellow-400"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              Sign Up - It's Free
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-all duration-300 border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-yellow-400"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        )}
      </div>
    </header>
  );

  const HeroSection = () => (
    <section className="py-24 px-6 text-center space-y-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
        Professional Invoicing for <br/> <span className="text-cyan-500">US Freelancers</span>. 100% Free.
      </h1>
      <p className="text-xl md:text-2xl max-w-2xl mx-auto text-muted">
        Download high-resolution PDFs instantly. US Letter Standard. No credit card, no hidden fees.
      </p>
      <div className="pt-4">
        <button 
          onClick={() => setView('new-invoice')}
          className="px-10 py-5 bg-cyan-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-cyan-500/30 hover:bg-cyan-600 transition-all hover:scale-105 active:scale-95"
        >
          Create New Invoice (No Login Required)
        </button>
      </div>
    </section>
  );

  const DashboardView = () => (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 text-foreground">
            Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'to BillCloud'}
          </h1>
          <p className="text-muted">Here's what's happening with your invoices.</p>
        </div>
        <button 
          onClick={() => setActiveTab('builder')}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus size={20} />
          Create New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Invoiced', value: `$${savedInvoices.reduce((acc, inv) => acc + parseFloat(inv.total || 0), 0).toFixed(2)}`, icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Total Clients', value: savedClients.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Pending Invoices', value: savedInvoices.filter(inv => inv.status === 'Pending').length, icon: Phone, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border border-card-border bg-card transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-card-border bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-card-border pb-4">
            <h3 className="font-bold text-foreground">Recent Invoices</h3>
            <button onClick={() => setActiveTab('invoices')} className="text-xs font-bold text-cyan-500 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {savedInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-foreground opacity-90">{inv.client_name || inv.clientName}</p>
                  <p className="text-xs text-muted-foreground">{inv.number} • {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-600">${inv.total}</p>
                  <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</p>
                </div>
              </div>
            ))}
            {savedInvoices.length === 0 && <p className="text-center py-4 text-sm text-muted-foreground">No invoices yet.</p>}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-card-border pb-4">
            <h3 className="font-bold text-foreground">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('builder')}
              className="p-4 rounded-xl border border-card-border bg-secondary flex flex-col items-center gap-2 hover:border-cyan-500 transition-all group"
            >
              <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Plus size={20} />
              </div>
              <span className="text-xs font-bold text-foreground opacity-80">New Invoice</span>
            </button>
            <button 
              onClick={() => setActiveTab('clients')}
              className="p-4 rounded-xl border border-card-border bg-secondary flex flex-col items-center gap-2 hover:border-cyan-500 transition-all group"
            >
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold text-foreground opacity-80">Add Client</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const InvoicesView = () => {
    const deleteInvoice = async (id: number) => {
      if (confirm('Are you sure you want to delete this invoice?')) {
        if (user) {
          await supabase.from('invoices').delete().eq('id', id);
          setSavedInvoices(savedInvoices.filter(inv => inv.id !== id));
        } else {
          setSavedInvoices(savedInvoices.filter(inv => inv.id !== id));
        }
      }
    };

    const downloadSavedInvoice = async (inv: any) => {
      // Temporarily set the state to the saved invoice data to generate PDF
      setLogo(inv.data.logo);
      setCompany(inv.data.company);
      setClient(inv.data.client);
      setInvoice(inv.data.invoice);
      setItems(inv.data.items);
      setTaxRate(inv.data.taxRate);
      setDiscount(inv.data.discount);
      setNotes(inv.data.notes);

      // Small delay to allow state update before generation
      setTimeout(async () => {
        await handleDownload();
        setToast({ message: 'Downloading saved invoice...', visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 3000);
      }, 500);
    };

    const editInvoice = (inv: any) => {
      setLogo(inv.data.logo);
      setCompany(inv.data.company);
      setClient(inv.data.client);
      setInvoice(inv.data.invoice);
      setItems(inv.data.items);
      setTaxRate(inv.data.taxRate);
      setDiscount(inv.data.discount);
      setNotes(inv.data.notes);
      setActiveTab('builder');
      setToast({ message: 'Invoice loaded for editing!', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    };

    return (
      <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Invoices History</h1>
          <button 
            onClick={() => setActiveTab('builder')}
            className="flex items-center gap-2 bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            <Plus size={18} />
            New Invoice
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {savedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="p-4 font-bold text-sm text-slate-700 dark:text-slate-300">{inv.number}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{inv.client_name || inv.clientName}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{inv.date}</td>
                    <td className="p-4 text-sm font-black text-right text-cyan-600">${inv.total}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => editInvoice(inv)} title="View/Edit" className="p-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-500 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => downloadSavedInvoice(inv)} title="Download" className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"><Download size={16} /></button>
                        <button onClick={() => deleteInvoice(inv.id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {savedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">No invoices found</p>
                      <p className="text-sm">Create your first invoice to see it here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ClientsView = () => {
    const [newClient, setNewClient] = useState({ name: '', email: '', address: '' });

    const addClient = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newClient.name) return;
      
      if (user) {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...newClient, user_id: user.id }])
          .select();
        
        if (data) {
          setSavedClients([data[0], ...savedClients]);
        }
      } else {
        const client = { ...newClient, id: Date.now() };
        setSavedClients([client, ...savedClients]);
      }

      setNewClient({ name: '', email: '', address: '' });
      setToast({ message: 'Client Added!', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    };

    const deleteClient = async (id: number) => {
      if (confirm('Are you sure? This will not delete their invoices.')) {
        if (user) {
          await supabase.from('clients').delete().eq('id', id);
          setSavedClients(savedClients.filter(c => c.id !== id));
        } else {
          setSavedClients(savedClients.filter(c => c.id !== id));
        }
      }
    };

    return (
      <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Clients</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Client Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card h-fit shadow-sm">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Add New Client</h3>
            <form onSubmit={addClient} className="space-y-4">
              <input 
                placeholder="Client Name"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm outline-none focus:border-cyan-500 transition-all text-slate-900 dark:text-white"
                value={newClient.name}
                onChange={e => setNewClient({...newClient, name: e.target.value})}
                required
              />
              <input 
                type="email"
                placeholder="Email Address"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm outline-none focus:border-cyan-500 transition-all text-slate-900 dark:text-white"
                value={newClient.email}
                onChange={e => setNewClient({...newClient, email: e.target.value})}
              />
              <textarea 
                placeholder="Address"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm outline-none focus:border-cyan-500 transition-all min-h-[100px] text-slate-900 dark:text-white"
                value={newClient.address}
                onChange={e => setNewClient({...newClient, address: e.target.value})}
              />
              <button type="submit" className="w-full bg-cyan-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all">
                Save Client
              </button>
            </form>
          </div>

          {/* Clients Table */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {savedClients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{c.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{c.address}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{c.email || 'No email'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"><Edit size={16} /></button>
                          <button onClick={() => deleteClient(c.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {savedClients.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No clients saved</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
      
      <div className="space-y-6">
        <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Dark Mode</p>
              <p className="text-xs text-slate-400">Adjust the app's visual theme.</p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-all text-slate-600 dark:text-yellow-400"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card space-y-4 shadow-sm">
          <h3 className="font-bold text-red-500">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Clear All Data</p>
              <p className="text-xs text-slate-400">Wipe all local invoices and clients.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm('Are you absolutely sure? This cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
            >
              Reset App
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  if (!mounted) return null;

  // Legal & Landing Pages Rendering
  if (view === 'landing' || view === 'privacy' || view === 'terms') {
    return (
      <div 
        className="min-h-screen flex flex-col font-sans transition-colors duration-300 overflow-y-auto bg-background text-foreground"
      >
        <header className="border-b no-print sticky top-0 z-50 bg-card border-card-border">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-6">
              {view !== 'landing' && (
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-card-border bg-secondary text-foreground hover:bg-secondary/80"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </button>
              )}
              <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
              >
                Sign Up - It's Free
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg transition-all duration-300 border border-card-border bg-secondary text-muted-foreground hover:text-foreground dark:text-yellow-400"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {view === 'landing' ? (
            <div className="flex flex-col">
              <HeroSection />
              <div className="max-w-[1000px] mx-auto px-6 pb-20">
                <section className="mb-24">
                  <h2 className="text-3xl font-black mb-12 text-center text-foreground">
                    Comprehensive Invoicing FAQ
                  </h2>
                  <div className="space-y-2">
                    <FAQItem 
                      question="Do I need to include my SSN on an invoice?" 
                      answer="No, and you shouldn't for security reasons. Use an EIN (Employer Identification Number) instead. It's free to get from the IRS and protects your personal identity."
                    />
                    <FAQItem 
                      question="What is the standard invoice size in the US?" 
                      answer="The standard size is US Letter (8.5 x 11 inches). Billcloud is pre-configured to output high-resolution PDFs in this exact format for perfect printing and filing."
                    />
                    <FAQItem 
                      question="Should I charge sales tax for consulting services?" 
                      answer="In most US states, pure professional services are not taxable. However, some states (like Hawaii or New Mexico) tax nearly everything. Check your local Department of Revenue guidelines."
                    />
                  </div>
                </section>
              </div>
            </div>
          ) : view === 'privacy' ? (
            <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
              <article className="prose dark:prose-invert lg:prose-lg max-w-none text-muted">
                <h1 className="text-4xl font-black mb-8 text-foreground">Privacy Policy</h1>
                <p className="text-lg mb-6">Last Updated: March 2026</p>
                
                <section className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-500">1. Privacy by Design</h2>
                  <p>Billcloud is built with a "Privacy First" philosophy. Unlike other invoice generators, <strong>we do not store your data on our servers</strong>. All information you enter into our tool—including business names, client details, and financial amounts—is processed locally in your web browser.</p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-500">2. Advertising & Cookies</h2>
                  <p>We do not collect personal information. However, to keep this service free, we use <strong>Google AdSense</strong> to serve advertisements. Google AdSense uses cookies to serve ads based on your prior visits to this website or other websites. By using this service, you consent to the use of cookies for personalized advertising.</p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-500">3. Local Storage</h2>
                  <p>For your convenience, our tool may use "Local Storage" in your browser to save your progress. This data never leaves your computer and can be cleared at any time by clearing your browser cache.</p>
                </section>
              </article>
            </div>
          ) : (
            <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
              <article className="prose dark:prose-invert lg:prose-lg max-w-none text-muted">
                <h1 className="text-4xl font-black mb-8 text-foreground">Terms of Service</h1>
                <p className="text-lg mb-6">Last Updated: March 2026</p>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-500">1. Acceptance of Terms</h2>
                  <p>By using Billcloud, you agree to these Terms of Service. If you do not agree, please do not use the service. Billcloud is provided as a free tool for US 1099 contractors, freelancers, and small businesses.</p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-500">2. "As-Is" Service</h2>
                  <p>Billcloud is provided on an "as-is" and "as-available" basis. While we strive for accuracy, we do not guarantee that the invoices generated will be error-free or compliant with all local, state, or federal laws. <strong>You are solely responsible for verifying the accuracy of all financial data and tax calculations.</strong></p>
                </section>
              </article>
            </div>
          )}
        </main>

        <footer className="w-full py-12 border-t text-center bg-card border-card-border">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-muted-foreground">&copy; 2026 Billcloud. All Rights Reserved.</p>
            <div className="flex gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <button onClick={() => setView('privacy')} className="hover:text-cyan-500 transition-colors">Privacy Policy</button>
              <button onClick={() => setView('terms')} className="hover:text-cyan-500 transition-colors">Terms of Service</button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex font-sans transition-colors duration-300 overflow-hidden bg-background text-foreground"
    >
      {user && <Sidebar />}
      <UpsellModal />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
            <div 
              className="bg-cyan-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm"
            >
              {toast.message}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'invoices' && <InvoicesView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'builder' && (
            <div className="flex flex-col h-full">
              <div id="builder-start" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* LEFT SIDE: INVOICE BUILDER */}
                <div 
                  className="w-full lg:w-[480px] lg:h-full overflow-y-auto p-4 md:p-6 no-print border-r transition-colors duration-300 bg-card border-card-border"
                >
                  <div className="space-y-6 pb-12 lg:pb-6">
                    {/* Company Details */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <h2 
                        className="text-sm font-bold border-b border-card-border pb-2 text-foreground transition-colors"
                      >
                        Company Details
                      </h2>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 h-24 border-2 border-dashed border-card-border bg-secondary rounded-xl flex items-center justify-center cursor-pointer transition-all overflow-hidden"
                        >
                          {logo ? (
                            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                              <ImageIcon size={20} />
                              <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter text-center px-2">No Logo Uploaded</span>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="whitespace-nowrap px-4 py-3 sm:py-2 rounded-lg text-sm font-bold text-white transition-colors bg-cyan-500 hover:bg-cyan-600"
                        >
                          + Add Logo
                        </button>
                      </div>

                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Business Name" 
                        value={company.name}
                        onChange={e => setCompany({...company, name: e.target.value})} 
                      />
                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Address" 
                        value={company.address}
                        onChange={e => setCompany({...company, address: e.target.value})} 
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          className="p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                          placeholder="Phone Number" 
                          value={company.phone}
                          onChange={e => setCompany({...company, phone: e.target.value})} 
                        />
                        <input 
                          className="p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                          placeholder="Email Address" 
                          value={company.email}
                          onChange={e => setCompany({...company, email: e.target.value})} 
                        />
                      </div>
                    </section>

                    {/* Client Details */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-card-border pb-2">
                        <h2 
                          className="text-sm font-bold text-foreground transition-colors"
                        >
                          Client Details
                        </h2>
                        {savedClients.length > 0 && (
                          <div className="relative group">
                            <select 
                              className="text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-500 px-2 py-1 rounded-lg outline-none cursor-pointer border border-cyan-500/20"
                              onChange={(e) => {
                                const selected = savedClients.find(c => c.id === parseInt(e.target.value));
                                if (selected) {
                                  setClient({ name: selected.name, address: selected.address, email: selected.email });
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled className="bg-card text-foreground">Select Client</option>
                              {savedClients.map(c => (
                                <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            if (!client.name) {
                              setToast({ message: 'Enter client name first', visible: true });
                              setTimeout(() => setToast({ message: '', visible: false }), 3000);
                              return;
                            }
                            const newC = { ...client, id: Date.now() };
                            setSavedClients([newC, ...savedClients]);
                            setToast({ message: 'Client Saved to CRM!', visible: true });
                            setTimeout(() => setToast({ message: '', visible: false }), 3000);
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 hover:underline"
                        >
                          + Save to CRM
                        </button>
                      </div>
                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Client Name" 
                        value={client.name}
                        onChange={e => setClient({...client, name: e.target.value})} 
                      />
                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Client Address" 
                        value={client.address}
                        onChange={e => setClient({...client, address: e.target.value})} 
                      />
                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Client Email" 
                        value={client.email}
                        onChange={e => setClient({...client, email: e.target.value})} 
                      />
                    </section>

                    {/* Invoice Details */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <h2 
                        className="text-sm font-bold border-b border-card-border pb-2 text-foreground transition-colors"
                      >
                        Invoice Details
                      </h2>
                      <input 
                        className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                        placeholder="Invoice Number" 
                        value={invoice.number}
                        onChange={e => setInvoice({...invoice, number: e.target.value})} 
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date (MM/DD/YYYY)</label>
                          <input 
                            type="text"
                            className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                            value={invoice.date}
                            placeholder="MM/DD/YYYY"
                            onChange={e => setInvoice({...invoice, date: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date (MM/DD/YYYY)</label>
                          <input 
                            type="text"
                            className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                            value={invoice.dueDate}
                            placeholder="MM/DD/YYYY"
                            onChange={e => setInvoice({...invoice, dueDate: e.target.value})} 
                          />
                        </div>
                      </div>
                    </section>

                    {/* Line Items */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <div 
                        className="flex justify-between items-center border-b border-card-border pb-2 transition-colors"
                      >
                        <h2 
                          className="text-sm font-bold text-foreground"
                        >
                          Line Items
                        </h2>
                        <button 
                          onClick={() => setItems([...items, { id: Date.now(), name: '', qty: 1, price: 0 }])} 
                          className="p-1 rounded-lg text-white transition-colors bg-cyan-500 hover:bg-cyan-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-6 md:space-y-4">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex flex-col gap-3 p-3 rounded-lg border border-card-border bg-secondary transition-colors md:grid md:grid-cols-[1fr_80px_100px_100px_40px] md:gap-3 md:items-start md:p-0 md:bg-transparent md:border-none"
                          >
                            <div className="space-y-1.5 flex-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                              <input 
                                className="w-full p-2 border border-card-border bg-card rounded-lg text-xs outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground"
                                placeholder="Item Name" 
                                value={item.name} 
                                onChange={e => updateItem(item.id, 'name', e.target.value)} 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest block text-center text-muted-foreground">Qty</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border border-card-border bg-card rounded-lg text-xs text-center outline-none transition-colors focus:border-cyan-500 text-foreground"
                                value={item.qty} 
                                onChange={e => updateItem(item.id, 'qty', e.target.value)} 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest block text-right text-muted-foreground">Price</label>
                              <input 
                                type="number" 
                                className="w-full p-2 border border-card-border bg-card rounded-lg text-xs text-right outline-none transition-colors focus:border-cyan-500 text-foreground"
                                placeholder="0.00" 
                                value={item.price} 
                                onChange={e => updateItem(item.id, 'price', e.target.value)} 
                              />
                            </div>
                            <div className="space-y-1.5 hidden md:block">
                              <label className="text-[10px] font-bold uppercase tracking-widest block text-right text-muted-foreground">Amount</label>
                              <div 
                                className="w-full p-2 border border-card-border bg-secondary rounded-lg text-xs text-right font-bold transition-colors text-muted"
                              >
                                ${Math.max(0, (parseFloat(item.qty as any) || 0) * (parseFloat(item.price as any) || 0)).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-end justify-end md:pb-1">
                              <button 
                                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Calculations */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <h2 
                        className="text-sm font-bold border-b border-card-border pb-2 text-foreground transition-colors"
                      >
                        Calculations
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tax Rate (%)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground" 
                            placeholder="0"
                            value={taxRate}
                            onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discount (USD)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 border border-card-border bg-secondary rounded-lg text-sm outline-none transition-colors focus:border-cyan-500 text-foreground" 
                            placeholder="0.00"
                            value={discount}
                            onChange={e => setDiscount(parseFloat(e.target.value) || 0)} 
                          />
                        </div>
                      </div>
                      <div className="pt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Subtotal:</span>
                          <span className="font-bold text-foreground">${Math.max(0, subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Tax Amount:</span>
                          <span className="font-bold text-foreground">${Math.max(0, taxAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Discount:</span>
                          <span className="font-bold text-red-500">-${Math.max(0, discountVal).toFixed(2)}</span>
                        </div>
                        <div 
                          className="flex justify-between text-base pt-2 border-t border-card-border transition-colors"
                        >
                          <span className="font-bold text-foreground">Total:</span>
                          <span className="font-black text-cyan-600">${Math.max(0, total).toFixed(2)}</span>
                        </div>
                      </div>
                    </section>

                    {/* Payment Terms & Notes */}
                    <section 
                      className="p-4 md:p-6 rounded-xl border border-card-border bg-card transition-colors duration-300 space-y-4 shadow-sm"
                    >
                      <h2 
                        className="text-sm font-bold border-b border-card-border pb-2 text-foreground transition-colors"
                      >
                        Payment Terms & Notes
                      </h2>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Terms</label>
                        <input 
                          className="w-full p-3 border border-card-border bg-secondary rounded-xl text-sm outline-none transition-colors focus:border-cyan-500 text-foreground placeholder:text-muted-foreground" 
                          placeholder="e.g. Net 30, Due on Receipt" 
                          value={invoice.terms}
                          onChange={e => setInvoice({...invoice, terms: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Additional Notes</label>
                        <textarea 
                          className="w-full p-3 border border-card-border bg-secondary rounded-xl text-sm outline-none transition-colors focus:border-cyan-500 min-h-[100px] text-foreground placeholder:text-muted-foreground" 
                          placeholder="Any extra information..." 
                          value={notes}
                          onChange={e => setNotes(e.target.value)} 
                        />
                      </div>
                    </section>
                  </div>
                </div>

                {/* RIGHT SIDE: LIVE PREVIEW */}
                <div 
                  id="preview-section" 
                  className="flex-1 lg:h-full flex flex-col items-center overflow-y-auto overflow-x-hidden relative transition-colors duration-300 p-4 md:p-8 bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="w-full max-w-[900px] flex flex-col items-center">
                    {/* Preview Controls */}
                    <div className="w-full flex justify-between items-center mb-8 bg-card p-4 rounded-2xl border border-card-border shadow-sm no-print">
                      <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Live Preview</h2>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleSave} 
                          className="px-4 py-2 rounded-lg text-xs font-bold transition-all border border-card-border bg-secondary text-foreground hover:bg-secondary/80"
                        >
                          Save Progress
                        </button>
                        <button 
                          onClick={handleDownload} 
                          disabled={isGenerating}
                          className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20"
                          style={{ 
                            opacity: isGenerating ? 0.75 : 1,
                            cursor: isGenerating ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isGenerating ? 'Generating...' : 'Download PDF'}
                        </button>
                      </div>
                    </div>

                    <div className="relative w-full flex justify-center items-start overflow-visible min-h-[600px] md:min-h-[800px] bg-secondary/30 rounded-3xl p-4 md:p-10 border border-card-border/50">
                      <div 
                        id="invoice-preview" 
                        className="bg-white w-[816px] min-h-[1056px] p-8 md:p-20 flex flex-col font-sans shadow-2xl transition-transform duration-300"
                        style={{ 
                          transform: `scale(${scale})`, 
                          transformOrigin: 'top center',
                          marginBottom: `-${1056 * (1 - scale)}px`,
                          color: '#1e293b',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {/* Top Section: Logo & Company */}
                        <div className="flex justify-between items-start mb-16">
                          <div className="flex-1">
                            {logo ? (
                              <img src={logo} alt="Company Logo" className="h-16 object-contain mb-6" />
                            ) : (
                              <div className="h-16 w-16 rounded-lg flex items-center justify-center mb-6 italic text-xs border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9', color: '#64748b' }}>Logo</div>
                            )}
                            <h2 className="text-2xl font-bold leading-tight mb-2" style={{ color: '#0f172a' }}>{company.name || 'Your Company Name'}</h2>
                            <div className="space-y-1 text-sm" style={{ color: '#64748b' }}>
                              <p>{company.address || 'Company Address'}</p>
                              <p>{company.phone || 'Phone Number'}</p>
                              <p>{company.email || 'Email'}</p>
                            </div>
                          </div>
                          <div className="text-right flex-1">
                            <h2 className="text-5xl font-black uppercase tracking-tight mb-6" style={{ color: '#06b6d4' }}>INVOICE</h2>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-end gap-2">
                                <span className="font-bold" style={{ color: '#0f172a' }}>Invoice #:</span>
                                <span style={{ color: '#475569' }}>{invoice.number}</span>
                              </div>
                              <div className="flex justify-end gap-2">
                                <span className="font-bold" style={{ color: '#0f172a' }}>Date:</span>
                                <span style={{ color: '#475569' }}>{invoice.date}</span>
                              </div>
                              <div className="flex justify-end gap-2">
                                <span className="font-bold" style={{ color: '#0f172a' }}>Due Date:</span>
                                <span style={{ color: '#475569' }}>{invoice.dueDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Details */}
                        <div className="mb-12">
                          <p className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Bill To:</p>
                          <h3 className="text-xl font-bold mb-2" style={{ color: '#1e293b' }}>{client.name || 'Client Name'}</h3>
                          <div className="text-sm space-y-1" style={{ color: '#64748b' }}>
                            <p>{client.address}</p>
                            <p className="font-medium" style={{ color: '#0891b2' }}>{client.email}</p>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1">
                          <table className="w-full mb-10 border-collapse">
                            <thead>
                              <tr style={{ backgroundColor: '#06b6d4', color: '#ffffff' }} className="text-sm">
                                <th className="py-4 px-6 text-left font-bold rounded-l-lg">Description</th>
                                <th className="py-4 px-4 text-center font-bold w-24">Qty</th>
                                <th className="py-4 px-4 text-center font-bold w-32">Unit Price</th>
                                <th className="py-4 px-6 text-right font-bold w-32 rounded-r-lg">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {items.map((item, index) => (
                                <tr 
                                  key={item.id} 
                                  style={{ borderBottom: index === items.length - 1 ? 'none' : '1px solid #f1f5f9' }}
                                >
                                  <td className="py-5 px-6 font-medium" style={{ color: '#1e293b' }}>{item.name || 'Description of service'}</td>
                                  <td className="py-5 px-4 text-center" style={{ color: '#475569' }}>{item.qty}</td>
                                  <td className="py-5 px-4 text-center" style={{ color: '#475569' }}>${(parseFloat(item.price as any) || 0).toFixed(2)}</td>
                                  <td className="py-5 px-6 text-right font-bold" style={{ color: '#0f172a' }}>${Math.max(0, (parseFloat(item.qty as any) || 0) * (parseFloat(item.price as any) || 0)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-auto flex flex-col md:flex-row justify-between items-start pt-10 border-t gap-10" style={{ borderColor: '#f1f5f9' }}>
                          <div className="space-y-6 flex-1">
                            <div className="p-6 rounded-xl max-w-[400px] border" style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)', borderColor: '#f1f5f9' }}>
                              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#0f172a' }}>Terms & Conditions</p>
                              <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>Please pay within {invoice.terms}. All prices are in US Dollars (USD). Tax-compliant US Letter layout.</p>
                            </div>
                            {notes && (
                              <div className="max-w-[400px]">
                                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#0f172a' }}>Notes</p>
                                <p className="text-xs whitespace-pre-wrap" style={{ color: '#64748b' }}>{notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="w-full md:w-72 space-y-3">
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#64748b' }}>Subtotal</span>
                              <span className="font-bold" style={{ color: '#0f172a' }}>${Math.max(0, subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#64748b' }}>Tax ({taxRate}%)</span>
                              <span className="font-bold" style={{ color: '#0f172a' }}>${Math.max(0, taxAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span style={{ color: '#64748b' }}>Discount</span>
                              <span className="font-bold" style={{ color: '#ef4444' }}>-${Math.max(0, discountVal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: '#f1f5f9' }}>
                              <span className="text-lg font-bold" style={{ color: '#0f172a' }}>Total:</span>
                              <span className="text-3xl font-black" style={{ color: '#06b6d4' }}>${Math.max(0, total).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Content at the bottom of Builder for Niche pages */}
              <div className="no-print mt-20">
                <div className="max-w-[1000px] mx-auto px-6 pb-20">
                  <section className="mb-24">
                    <h2 className="text-3xl font-black mb-12 text-center text-foreground">
                      Comprehensive Invoicing FAQ
                    </h2>
                    <div className="space-y-2">
                      <FAQItem 
                        question="Do I need to include my SSN on an invoice?" 
                        answer="No, and you shouldn't for security reasons. Use an EIN (Employer Identification Number) instead. It's free to get from the IRS and protects your personal identity."
                      />
                      <FAQItem 
                        question="What is the standard invoice size in the US?" 
                        answer="The standard size is US Letter (8.5 x 11 inches). Billcloud is pre-configured to output high-resolution PDFs in this exact format for perfect printing and filing."
                      />
                      <FAQItem 
                        question="Should I charge sales tax for consulting services?" 
                        answer="In most US states, pure professional services are not taxable. However, some states (like Hawaii or New Mexico) tax nearly everything. Check your local Department of Revenue guidelines."
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

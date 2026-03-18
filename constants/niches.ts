export interface NicheConfig {
  slug: string;
  name: string;
  h1: string;
  seoDescription: string;
  defaultNotes: string;
}

export const niches: NicheConfig[] = [
  {
    slug: 'cleaning-invoice-template',
    name: 'Cleaning Service',
    h1: 'Free Cleaning Service Invoice Template',
    seoDescription: 'Professional cleaning and maid service invoice for recurring residential and commercial cleaning visits.',
    defaultNotes: 'Thank you for choosing our cleaning services! We appreciate your business.'
  },
  {
    slug: 'photography-invoice-template',
    name: 'Photography',
    h1: 'Free Photography Invoice Template',
    seoDescription: 'Professional photography invoice with itemized session fees, usage rights, and digital delivery terms.',
    defaultNotes: 'Thank you for the session! Usage rights are granted as per our signed agreement upon full payment.'
  },
  {
    slug: 'construction-invoice-template',
    name: 'Construction',
    h1: 'Free Construction Invoice Template',
    seoDescription: 'Professional construction invoice for labor, materials, and equipment. US standard compliant for contractors.',
    defaultNotes: 'Payment due for construction labor and materials. Warranty information available upon request.'
  },
  {
    slug: 'plumbing-invoice-template',
    name: 'Plumbing',
    h1: 'Free Plumbing Service Invoice Template',
    seoDescription: 'Professional plumbing invoice for parts, labor hours, and emergency service fees. US standard compliant.',
    defaultNotes: 'Plumbing service completed. 12-month warranty on all parts installed.'
  },
  {
    slug: 'hvac-invoice-template',
    name: 'HVAC',
    h1: 'Free HVAC Service Invoice Template',
    seoDescription: 'Professional HVAC repair and maintenance invoice. Itemize refrigerant, parts, and diagnostic fees.',
    defaultNotes: 'HVAC system service and repair. Maintenance contract details attached.'
  },
  {
    slug: 'landscaping-invoice-template',
    name: 'Landscaping',
    h1: 'Free Landscaping Invoice Template',
    seoDescription: 'Professional landscaping and lawn care invoice for seasonal cleanups or recurring maintenance.',
    defaultNotes: 'Lawn maintenance and landscaping services completed. Next scheduled visit is noted.'
  },
  {
    slug: 'legal-invoice-template',
    name: 'Legal Services',
    h1: 'Free Legal Service Invoice Template',
    seoDescription: 'Professional legal billing invoice for US attorneys and paralegals. Itemize by hourly rate or retainer.',
    defaultNotes: 'Legal services rendered for the current period. Please review the itemized breakdown.'
  },
  {
    slug: 'dental-invoice-template',
    name: 'Dental',
    h1: 'Free Dental Service Invoice Template',
    seoDescription: 'Professional dental and medical invoice for procedures, consultations, and lab fees.',
    defaultNotes: 'Dental services completed. Please contact our office if you have any insurance questions.'
  },
  {
    slug: 'catering-invoice-template',
    name: 'Catering',
    h1: 'Free Catering Invoice Template',
    seoDescription: 'Professional catering and event service invoice. Itemize per-guest costs, rentals, and service fees.',
    defaultNotes: 'Event catering services completed. Balance due as per our catering contract.'
  },
  {
    slug: 'roofing-invoice-template',
    name: 'Roofing',
    h1: 'Free Roofing Invoice Template',
    seoDescription: 'Professional roofing service invoice for repairs, inspections, and full replacements.',
    defaultNotes: 'Roofing services completed. Please retain this invoice for your roof warranty documentation.'
  }
];

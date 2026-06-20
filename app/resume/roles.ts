// Data source for programmatic role landing pages (/resume/[slug]).
// Each entry must carry GENUINELY role-specific content (intro, before/after,
// keywords, FAQ) — Google penalizes thin "doorway" pages that only swap a title.
// To scale: add entries here; the page, sitemap and static params pick them up.

export type RoleFaq = { q: string; a: string }

export type Role = {
  slug: string
  title: string // e.g. "Product Manager"
  metaTitle: string
  metaDescription: string
  intro: string
  // What recruiters / ATS actually look for in this role's resume.
  whatMatters: string[]
  // The hero proof: a generic AI cliché vs. a concrete, role-specific rewrite.
  before: string
  after: string
  // Keywords ATS commonly scans for in this role.
  keywords: string[]
  // Recommended template ids (must exist in TEMPLATES).
  templates: string[]
  faqs: RoleFaq[]
}

export const ROLES: Role[] = [
  {
    slug: 'product-manager',
    title: 'Product Manager',
    metaTitle: 'Product Manager Resume — Tailored to the Job & ATS-Ready | Resumetion',
    metaDescription:
      'Build a product manager resume that mirrors the job posting and passes ATS. Paste the role, get keyword-aligned bullets written like a person — preview free.',
    intro:
      'A strong product manager resume shows outcomes, not responsibilities: what you shipped, who you aligned, and what moved as a result. Recruiters skim for product scope and impact in seconds, and ATS filters on the exact terminology in the posting — so the wording has to match the role you are applying to, not a generic PM template.',
    whatMatters: [
      'Outcomes over duties — tie each bullet to a metric (activation, retention, revenue) where you have one.',
      'Product scope — surface area, user base, and stage (0→1, growth, platform) so seniority reads instantly.',
      'Cross-functional leadership — how you aligned eng, design, and stakeholders, named concretely.',
      'Tooling the posting asks for — analytics, experimentation, SQL, discovery methods.',
    ],
    before: 'Results-driven product leader who leveraged cross-functional synergies to drive impactful outcomes.',
    after: 'Led discovery and launch of a self-serve onboarding flow with 3 eng and 1 designer, lifting activation 22% in two quarters.',
    keywords: [
      'Product roadmap', 'A/B testing', 'User research', 'Stakeholder management', 'Go-to-market',
      'OKRs', 'Product analytics', 'SQL', 'Discovery', 'Backlog prioritization', 'Experimentation', 'Retention',
    ],
    templates: ['minimal', 'prime', 'atelier'],
    faqs: [
      { q: 'How long should a product manager resume be?', a: 'One page for most PMs; two only if you have 10+ years and the second page stays as dense as the first. Recruiters skim — every line should earn its place.' },
      { q: 'Should I include metrics if my impact was hard to measure?', a: 'Use the metric you have, even a directional one (faster, fewer steps, higher adoption). Resumetion never invents numbers — it sharpens the wording around the facts you provide.' },
      { q: 'Do I need a different resume for each PM job?', a: 'Yes — tailoring to the posting is the single biggest lever. Paste each job description and the wording realigns to that role’s priorities and keywords.' },
    ],
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    metaTitle: 'Frontend Developer Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription:
      'A frontend developer resume that matches the job posting and parses cleanly through ATS. Paste the role, get keyword-aligned bullets — no buzzwords. Preview free.',
    intro:
      'A frontend developer resume lives or dies on specifics: the frameworks you actually shipped with, the performance and accessibility work you owned, and the products behind the code. ATS scans for the exact stack named in the posting, so listing React when the role says React — and showing where you used it — matters more than a wall of adjectives.',
    whatMatters: [
      'Concrete stack — name the frameworks, languages, and tools you shipped with, not a buzzword cloud.',
      'Impact on the product — performance, accessibility, conversion, or DX you measurably improved.',
      'Scope and ownership — features you led end-to-end, design systems, or apps you rebuilt.',
      'Match to the posting — mirror the exact stack and responsibilities the job lists.',
    ],
    before: 'Passionate engineer with extensive experience building scalable, cutting-edge web applications.',
    after: 'Rebuilt a legacy React/TypeScript dashboard into a component library, cutting initial load 1.8s and unblocking three product teams.',
    keywords: [
      'React', 'TypeScript', 'JavaScript', 'Next.js', 'Accessibility (a11y)', 'Performance optimization',
      'Design systems', 'CSS', 'Testing', 'REST/GraphQL', 'CI/CD', 'Responsive design',
    ],
    templates: ['minimal', 'aurora', 'volt'],
    faqs: [
      { q: 'Should I list every technology I have touched?', a: 'No — list what you can speak to and what the posting asks for. A focused stack reads as senior; an exhaustive dump reads as padding and dilutes ATS keyword relevance.' },
      { q: 'How do I show impact as a frontend developer?', a: 'Tie work to a user- or product-level result: load time, accessibility score, conversion, or teams unblocked. Resumetion rewrites your notes into outcome-led bullets without inventing metrics.' },
      { q: 'Do recruiters care about side projects?', a: 'For junior and mid-level roles, yes — if they show relevant, shipped work. Keep it to projects with a real outcome or users, not tutorials.' },
    ],
  },
  {
    slug: 'registered-nurse',
    title: 'Registered Nurse',
    metaTitle: 'Registered Nurse Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription:
      'A registered nurse resume that matches the job posting and passes hospital ATS. Paste the role, get clean, keyword-aligned bullets — preview free, no signup.',
    intro:
      'A registered nurse resume has to read fast for a nurse manager and parse cleanly for hospital applicant tracking systems. That means clear unit and specialty experience, licenses and certifications up front, and the exact clinical terminology used in the posting — not vague claims of being a caring, dedicated professional.',
    whatMatters: [
      'Licenses and certifications — RN license, BLS/ACLS/PALS, listed where they are easy to scan.',
      'Specialty and setting — unit type, patient population, and acuity so fit is obvious.',
      'Clinical scope — procedures, EHR systems, and patient load handled.',
      'Posting match — mirror the unit, certifications, and systems the job names.',
    ],
    before: 'Compassionate, hard-working nurse with a proven track record of delivering excellent patient care.',
    after: 'Managed a 5-patient med-surg load per shift, charted in Epic, and precepted two new-grad RNs through unit orientation.',
    keywords: [
      'RN license', 'BLS', 'ACLS', 'Epic / EHR', 'Patient assessment', 'Medication administration',
      'Care planning', 'Med-surg', 'Triage', 'Patient education', 'IV therapy', 'HIPAA',
    ],
    templates: ['minimal', 'atelier', 'prime'],
    faqs: [
      { q: 'Where do certifications go on a nurse resume?', a: 'Near the top, in their own clearly-labeled section, so a manager and the ATS catch them immediately. Include the certifying body and keep them current.' },
      { q: 'How do I tailor a nursing resume to a specific unit?', a: 'Mirror the unit, patient population, and systems in the posting. Paste the job description and the wording reorders to surface your most relevant clinical experience first.' },
      { q: 'Should new-grad nurses include clinical rotations?', a: 'Yes — list rotations with the setting and key skills practiced. For new grads, clinicals are real, relevant experience and worth detailing.' },
    ],
  },
]

export const ROLE_SLUGS = ROLES.map(r => r.slug)
export const getRole = (slug: string): Role | undefined => ROLES.find(r => r.slug === slug)

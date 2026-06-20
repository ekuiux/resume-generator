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
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    metaTitle: 'Software Engineer Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'Build a software engineer resume that matches the job posting and clears ATS. Paste the role, get keyword-aligned bullets around your actual work — preview free.',
    intro: 'A software engineer resume needs to show what you built, at what scale, and with which stack — not that you are passionate about technology. Recruiters and ATS both scan for the exact languages and frameworks in the posting, so a resume that mirrors the job description beats a generic one every time.',
    whatMatters: [
      'Stack specificity — name the languages, frameworks, and tools you actually shipped with, matched to what the role lists.',
      'Impact at scale — users, requests per second, latency improvements, or error rates tell more than "improved performance".',
      'Ownership scope — features you led end-to-end vs. contributed to, and systems you designed vs. maintained.',
      'System design signals — architecture decisions, trade-offs, or migrations you drove show seniority faster than a tech list.',
    ],
    before: 'Passionate software engineer with experience building scalable, high-performance applications using modern technologies.',
    after: 'Built a real-time notification service in Go handling 40k events/sec, reducing alert latency from 8s to under 400ms for 2M users.',
    keywords: [
      'System design', 'REST API', 'Microservices', 'CI/CD', 'Unit testing', 'Code review',
      'Agile', 'Docker', 'Kubernetes', 'Cloud (AWS/GCP/Azure)', 'SQL', 'Git',
    ],
    templates: ['minimal', 'volt', 'prime'],
    faqs: [
      { q: 'Should I list every programming language I know?', a: 'List what you can speak to in an interview and what the posting asks for. A focused stack reads as depth; a sprawling list reads as padding.' },
      { q: 'How do I show impact as a software engineer?', a: 'Tie your work to a measurable outcome — latency, throughput, error rate, cost, or users affected. Resumetion rewrites your notes into outcome-led bullets without inventing numbers.' },
      { q: 'One page or two for a software engineer resume?', a: 'One page for under 7–8 years of experience. Two only if every line on the second page is as dense and relevant as the first — trim ruthlessly before adding a page.' },
    ],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    metaTitle: 'Data Analyst Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A data analyst resume that matches the job posting and passes ATS. Paste the role, get keyword-aligned bullets built from your real work — preview free.',
    intro: 'A data analyst resume has to answer one question fast: what decisions did your analysis actually drive? Recruiters skim for the tools you use, the data you worked with, and the business impact — not descriptions of dashboards you built or queries you ran.',
    whatMatters: [
      'Business impact — what decision, cost saving, or revenue lift followed from your analysis.',
      'Tool fluency — SQL, Python, R, Tableau, Power BI, or whatever the posting names, stated concretely.',
      'Data scope — scale of data, domain (finance, marketing, ops), and stakeholders you supported.',
      'Methodology — A/B testing, cohort analysis, forecasting, or segmentation you led, not just ran.',
    ],
    before: 'Detail-oriented data analyst with strong analytical skills and experience working with large datasets to derive actionable insights.',
    after: 'Built a churn-prediction model in Python that identified 18% of at-risk accounts 30 days early, enabling outreach that recovered $340k ARR.',
    keywords: [
      'SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'A/B testing',
      'Data visualization', 'Statistical analysis', 'ETL', 'Looker', 'BigQuery', 'Stakeholder reporting',
    ],
    templates: ['minimal', 'prime', 'nordic'],
    faqs: [
      { q: 'Should I include personal data projects on a data analyst resume?', a: 'Yes, if they show real analysis and a clear finding — not just that you ran a tutorial. A Kaggle project with a concrete takeaway is worth listing; a notebook with no conclusion is not.' },
      { q: 'How do I show SQL skills on a resume?', a: 'Name the database (PostgreSQL, BigQuery, Redshift), the scale (rows, tables, joins), and what the query supported — a dashboard, a report, a model input. "Proficient in SQL" alone tells recruiters nothing.' },
      { q: 'What is the difference between a data analyst and data scientist resume?', a: 'A data analyst resume emphasises business reporting, dashboards, and stakeholder communication. A data scientist resume leans toward modelling, statistics, and ML pipelines. Match the language of the posting exactly.' },
    ],
  },
  {
    slug: 'ux-designer',
    title: 'UX Designer',
    metaTitle: 'UX Designer Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A UX designer resume that mirrors the job posting and passes ATS. Paste the role, get keyword-aligned bullets around your design process — preview free.',
    intro: 'A UX designer resume needs to show your process and the outcomes it produced — not a list of tools you can open. Hiring managers look for evidence that you talk to users, translate findings into decisions, and ship things that measurably improve the experience.',
    whatMatters: [
      'Process visibility — research methods, synthesis, and how findings shaped the final design.',
      'Outcome over output — conversion lift, task-completion rate, NPS, or reduced support tickets, not screens delivered.',
      'Collaboration signals — how you worked with PMs, engineers, and stakeholders to get designs shipped.',
      'Tool match — Figma, Maze, UserTesting, Miro, or whatever the posting lists, shown in context.',
    ],
    before: 'Creative UX designer passionate about crafting intuitive, user-centred experiences that delight users and drive business results.',
    after: 'Redesigned the onboarding flow using 12 user interviews and tree-testing; lifted 7-day activation 31% and cut support tickets by 22%.',
    keywords: [
      'Figma', 'User research', 'Usability testing', 'Wireframing', 'Prototyping', 'Information architecture',
      'Design systems', 'A/B testing', 'Journey mapping', 'Accessibility', 'Cross-functional collaboration', 'Interaction design',
    ],
    templates: ['aurora', 'atelier', 'minimal'],
    faqs: [
      { q: 'Should I link to a portfolio on my UX resume?', a: 'Yes — one link to a portfolio that is curated and password-protected if needed. Make sure every case study in it shows process (research, decisions, trade-offs), not just final screens.' },
      { q: 'How many projects should I include on a UX resume?', a: 'Two to four strong projects with real context beat eight thumbnail mentions. Depth shows thinking; breadth alone shows output.' },
      { q: 'Do UX designers need to know how to code?', a: 'Not required, but knowing HTML/CSS fundamentals and how to inspect a page makes handoff faster and is worth a brief mention if you have it.' },
    ],
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    metaTitle: 'Project Manager Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A project manager resume that matches the job posting and clears ATS. Paste the role, get keyword-aligned bullets around your delivery record — preview free.',
    intro: 'A project manager resume lives or dies on delivery record: what you shipped, on what timeline, with what team, and what the outcome was. Recruiters scan for scope, methodology, and measurable results — not for adjectives about your organisational skills.',
    whatMatters: [
      'Delivery record — projects completed on time and on budget, with size (budget, team, timeline) stated.',
      'Methodology — Agile, Scrum, Waterfall, or hybrid, matched to what the role actually uses.',
      'Stakeholder management — executive sponsors, cross-functional teams, and vendor relationships you navigated.',
      'Risk and change — how you handled scope creep, blockers, or pivots shows real PM experience.',
    ],
    before: 'Dynamic project manager with excellent organisational skills and a proven track record of delivering projects on time and within budget.',
    after: 'Delivered a $1.2M ERP migration for 400 users across 3 offices in 7 months, coordinating 14 stakeholders and resolving a critical vendor delay without slipping the go-live date.',
    keywords: [
      'Agile', 'Scrum', 'PMP', 'Stakeholder management', 'Risk management', 'Jira',
      'Budget management', 'Scope management', 'Change management', 'Cross-functional', 'Roadmap', 'OKRs',
    ],
    templates: ['minimal', 'prime', 'nordic'],
    faqs: [
      { q: 'Is PMP certification required for a project manager resume?', a: 'Not always, but it signals rigour to many hiring managers and ATS. If you have it, list it prominently. If you do not, lean into delivery metrics and methodology instead.' },
      { q: 'How do I quantify project management experience?', a: 'Budget managed, team size, timeline, and outcome. "Led a $500k migration delivered two weeks early" tells a story in one line; "managed a large project" does not.' },
      { q: 'Should I tailor my project manager resume for each role?', a: 'Yes — a PM resume for a tech company should emphasise Agile and tooling; one for a construction firm needs contract and vendor language. Paste the posting and the wording realigns automatically.' },
    ],
  },
  {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    metaTitle: 'Marketing Manager Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A marketing manager resume that mirrors the job posting and passes ATS. Paste the role, get keyword-aligned bullets tied to real campaign results — preview free.',
    intro: 'A marketing manager resume needs to show channel ownership, campaign outcomes, and budget managed — not that you are a creative thinker with a passion for brands. Recruiters scan for the channels and metrics that match the role, and ATS filters on the exact terminology in the posting.',
    whatMatters: [
      'Channel ownership — paid, organic, email, social, or content, named concretely with the scale you operated at.',
      'Campaign outcomes — CAC, ROAS, MQLs, pipeline influenced, or revenue attributed, not just impressions.',
      'Budget managed — even a rough figure contextualises seniority faster than any title.',
      'Tool stack — HubSpot, Salesforce, Google Ads, Meta Ads, or whatever the posting names.',
    ],
    before: 'Results-driven marketing manager with a passion for building brands and driving growth through innovative, data-driven campaigns.',
    after: 'Ran paid search and social for a B2B SaaS product ($180k/month budget), lowering CAC 28% in two quarters while growing MQL volume 40%.',
    keywords: [
      'Demand generation', 'HubSpot', 'Google Ads', 'SEO/SEM', 'Email marketing', 'Content strategy',
      'Marketing attribution', 'A/B testing', 'CRM', 'Brand strategy', 'Pipeline generation', 'Analytics',
    ],
    templates: ['minimal', 'aurora', 'prime'],
    faqs: [
      { q: 'How do I show marketing ROI on a resume?', a: 'Name the channel, the budget or scale, and the outcome metric — ROAS, CAC, conversion rate, or pipeline influenced. Resumetion builds outcome-led bullets from your notes without inventing numbers.' },
      { q: 'Should a marketing manager resume include a summary?', a: 'Only if it says something specific — channel expertise, industry, and a result. A generic "results-driven marketer" summary wastes the first lines a recruiter reads.' },
      { q: 'How do I tailor a marketing resume for B2B vs B2C roles?', a: 'B2B: emphasise pipeline, MQLs, ABM, and sales alignment. B2C: lead with brand, customer acquisition, LTV, and retention metrics. Paste the posting and the language shifts to match.' },
    ],
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    metaTitle: 'Business Analyst Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A business analyst resume that matches the job posting and passes ATS. Paste the role, get keyword-aligned bullets built around your requirements and delivery work — preview free.',
    intro: 'A business analyst resume has to show that you bridge business problems and technical solutions — not that you are good at communication and Excel. Hiring managers look for evidence of requirements elicitation, stakeholder alignment, and what shipped as a result of your analysis.',
    whatMatters: [
      'Requirements work — user stories, process maps, BRDs, or functional specs you wrote and got signed off.',
      'Stakeholder range — business owners, developers, and QA you aligned, at what seniority.',
      'Delivery outcomes — what launched, what changed in a process, or what the system now does because of your work.',
      'Domain and tools — finance, ops, healthcare, or tech domain; JIRA, Confluence, Visio, SQL, or whatever the role names.',
    ],
    before: 'Detail-oriented business analyst with strong communication skills and experience bridging business and technology teams to deliver solutions.',
    after: 'Led requirements gathering for a claims-processing automation with 8 stakeholders across ops and engineering, cutting manual processing time 65% after launch.',
    keywords: [
      'Requirements gathering', 'User stories', 'Process mapping', 'BRD', 'Stakeholder management', 'Agile',
      'JIRA', 'SQL', 'UAT', 'Gap analysis', 'Workflow analysis', 'Confluence',
    ],
    templates: ['minimal', 'prime', 'nordic'],
    faqs: [
      { q: 'Should a business analyst resume include SQL skills?', a: 'Yes, if you use it — and most BAs do. Show the context: what you queried, for which reports or analyses, and at what data scale. A bare "SQL" under skills tells recruiters less than a bullet that mentions it.' },
      { q: 'What is the difference between a BA and a PM resume?', a: 'A BA resume emphasises analysis, requirements, and documentation. A PM resume emphasises roadmap ownership, prioritisation decisions, and business outcomes. If you do both, lead with what the specific posting emphasises.' },
      { q: 'How long should a business analyst resume be?', a: 'One page for under 8 years; two pages only if every bullet on the second page earns its place. Depth on the right projects matters more than volume.' },
    ],
  },
  {
    slug: 'sales-representative',
    title: 'Sales Representative',
    metaTitle: 'Sales Representative Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A sales representative resume that mirrors the job posting and passes ATS. Paste the role, get keyword-aligned bullets built around your quota and pipeline — preview free.',
    intro: 'A sales representative resume needs to answer three questions in seconds: what did you sell, to whom, and did you hit your number? Everything else is secondary. Recruiters and ATS look for the exact product type, deal size, and sales motion in the posting.',
    whatMatters: [
      'Quota attainment — percentage of quota, rank on the team, or revenue number, every year you have it.',
      'Deal size and cycle — ACV and sales cycle length situate your experience fast.',
      'Sales motion — inbound vs. outbound, SMB vs. enterprise, transactional vs. consultative.',
      'Stack and methodology — CRM, sequencing tools, and any named methodology (MEDDIC, Challenger, SPIN) the role asks for.',
    ],
    before: 'High-energy sales professional with a passion for building relationships and exceeding targets in fast-paced, competitive environments.',
    after: 'Closed $1.1M ARR in FY24 (118% of quota), sourcing 70% of pipeline outbound, with an average ACV of $28k and a 60-day sales cycle.',
    keywords: [
      'Quota attainment', 'Pipeline generation', 'Outbound prospecting', 'CRM (Salesforce)', 'Cold outreach', 'Account management',
      'Discovery calls', 'Closing', 'B2B sales', 'SaaS sales', 'Deal forecasting', 'Objection handling',
    ],
    templates: ['minimal', 'prime', 'volt'],
    faqs: [
      { q: 'How do I show sales performance on a resume if I missed quota?', a: 'Show the absolute number alongside context — territory size, product changes, or market headwinds. Rank on the team ("4th of 22 reps") can also contextualise a quota number that looks low in isolation.' },
      { q: 'Should I list every deal I closed on my sales resume?', a: 'No — show a representative range: your largest deal, your typical ACV, and your annual attainment. Logos of notable accounts are useful if they are recognisable in your target industry.' },
      { q: 'Do I need a cover letter for sales roles?', a: 'A short, direct one helps if the role is competitive — treat it like a cold email: hook in line one, one relevant proof point, clear ask. Resumetion focuses on the resume; keep the cover letter equally tight.' },
    ],
  },
  {
    slug: 'graphic-designer',
    title: 'Graphic Designer',
    metaTitle: 'Graphic Designer Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A graphic designer resume that matches the job posting and passes ATS. Paste the role, get keyword-aligned bullets around your design work — preview free.',
    intro: 'A graphic designer resume has to earn a portfolio click — it needs to show your design scope, the brands you worked on, and the output you owned, all before a hiring manager opens a single link. ATS filters on the exact software and deliverable types in the posting.',
    whatMatters: [
      'Output ownership — campaigns, brand identities, packaging, or digital assets you led from brief to final file.',
      'Brand context — in-house, agency, or freelance; industry and scale of the brands you worked with.',
      'Software fluency — Adobe Creative Suite, Figma, Sketch, or whatever the posting names, shown in context of real work.',
      'Cross-functional delivery — briefs from marketing, copy from writers, print specs from vendors — collaboration that shows professional workflow.',
    ],
    before: 'Creative and passionate graphic designer with a strong eye for detail and experience creating visually compelling designs across digital and print.',
    after: 'Led visual identity refresh for a 200-SKU CPG brand — designed packaging, campaign assets, and retail POS across three product lines, increasing shelf recognition in a post-launch survey by 34%.',
    keywords: [
      'Adobe Illustrator', 'Adobe Photoshop', 'InDesign', 'Figma', 'Brand identity', 'Typography',
      'Print production', 'Digital design', 'Art direction', 'Layout', 'Motion graphics', 'Packaging design',
    ],
    templates: ['aurora', 'atelier', 'minimal'],
    faqs: [
      { q: 'Should a graphic designer include a portfolio link on their resume?', a: 'Always — it is more important than the resume itself. One curated URL, not a drive folder or a Behance dump. Make sure it loads fast and the first project shown is your strongest.' },
      { q: 'What format should a graphic designer resume be?', a: 'PDF, always — it preserves your layout and typography. Clean, readable, and professionally typeset. Your resume is itself a design sample, but do not let the layout distract from the content.' },
      { q: 'How do I show freelance work on a graphic design resume?', a: 'List clients by name or industry if they are recognisable, name the deliverable, and include the result if you have one. "Freelance — 12 clients, CPG and tech; brand identity, packaging, and web assets" beats a vague "self-employed designer".' },
    ],
  },
  {
    slug: 'teacher',
    title: 'Teacher',
    metaTitle: 'Teacher Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A teacher resume that matches the job posting and passes school ATS. Paste the role, get keyword-aligned bullets around your classroom experience — preview free.',
    intro: 'A teacher resume has to show your subject, grade level, and what your students actually achieved — not that you are passionate about education. Hiring managers at schools skim for certification, classroom experience, and evidence of student progress in seconds.',
    whatMatters: [
      'Certification and licensure — state licence, subject endorsements, and any specialist credentials listed up front.',
      'Subject and grade level — what you taught, to whom, and in what setting (public, private, Title I, IB).',
      'Student outcomes — test score gains, proficiency rates, or programme results where you have them.',
      'Classroom management and differentiation — how you supported diverse learners, including IEP and ELL experience if relevant.',
    ],
    before: 'Dedicated and passionate educator committed to fostering a love of learning and helping every student reach their full potential.',
    after: 'Taught 7th-grade ELA at a Title I school for three years; raised the percentage of students at or above grade level from 48% to 71% using small-group intervention and data-driven instruction.',
    keywords: [
      'Lesson planning', 'Differentiated instruction', 'Classroom management', 'IEP', 'ELL support', 'Curriculum development',
      'Formative assessment', 'Data-driven instruction', 'Google Classroom', 'Parent communication', 'State certification', 'Co-teaching',
    ],
    templates: ['minimal', 'prime', 'atelier'],
    faqs: [
      { q: 'How do I show student outcomes on a teacher resume?', a: 'Use the data you have: test score changes, proficiency percentages, attendance rates, or programme outcomes. Even directional data ("increased reading fluency scores across 92% of students") is stronger than claiming you improved learning.' },
      { q: 'Should a teacher resume include a teaching philosophy?', a: 'Only if the school specifically asks for one. On a standard resume, that space is better used on concrete experience and outcomes. Save the philosophy for the cover letter or interview.' },
      { q: 'How do I transition from teaching to another field on my resume?', a: 'Reframe teaching skills in transferable terms: curriculum design → instructional design or content development; classroom management → team facilitation; assessment → data analysis and evaluation. Paste the target job description and the wording shifts to match.' },
    ],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    metaTitle: 'DevOps Engineer Resume — ATS-Ready & Tailored | Resumetion',
    metaDescription: 'A DevOps engineer resume that mirrors the job posting and passes ATS. Paste the role, get keyword-aligned bullets around your infra and automation work — preview free.',
    intro: 'A DevOps engineer resume needs to show what you automated, what you made more reliable, and with which tools — not that you are experienced with CI/CD pipelines. Hiring managers scan for the exact stack in the posting and evidence that you improved deployment speed, uptime, or cost.',
    whatMatters: [
      'Infrastructure scope — cloud provider, scale (clusters, services, regions), and ownership level (built vs. maintained).',
      'Automation wins — deployment frequency, lead time, or toil reduced by pipelines and tooling you built.',
      'Reliability record — SLA targets, incident reduction, or MTTR improvements you can point to.',
      'Stack match — Kubernetes, Terraform, Helm, GitHub Actions, Datadog, or whatever the role lists.',
    ],
    before: 'Experienced DevOps engineer with a strong background in CI/CD, cloud infrastructure, and automation tools to support development teams.',
    after: 'Migrated a monolith to 18 Kubernetes microservices on GKE, cutting deploy time from 45 min to 6 min and reducing production incidents 60% in the following quarter.',
    keywords: [
      'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'GitHub Actions', 'AWS / GCP / Azure',
      'Infrastructure as Code', 'Helm', 'Monitoring (Datadog/Prometheus)', 'Linux', 'Site reliability', 'Incident management',
    ],
    templates: ['minimal', 'volt', 'prime'],
    faqs: [
      { q: 'Should a DevOps resume emphasise cloud or on-prem experience?', a: 'Match the posting. Most modern roles want cloud-first experience; if the posting mentions on-prem or hybrid, surface that explicitly. Do not bury relevant infrastructure experience under cloud buzzwords if the role needs both.' },
      { q: 'How do I show DevOps impact on a resume?', a: 'Deploy frequency, lead time for changes, MTTR, and change failure rate are the DORA metrics most DevOps hiring managers recognise. Pick the one or two you improved and put numbers to them.' },
      { q: 'Is a DevOps engineer the same as an SRE on a resume?', a: 'Overlapping but different. SRE leans into reliability engineering, SLOs, and error budgets; DevOps leans into delivery pipeline and automation. Read the posting closely and mirror its language — do not assume the titles are interchangeable.' },
    ],
  },
]

export const ROLE_SLUGS = ROLES.map(r => r.slug)
export const getRole = (slug: string): Role | undefined => ROLES.find(r => r.slug === slug)

import { NextRequest, NextResponse } from 'next/server'

// ─── Rate limit: 6 generations per IP per hour ──────────────────────────────
// In-memory sliding window. Note: serverless instances each keep their own map
// and it resets on cold start, so this caps casual abuse rather than being
// bulletproof. For hard guarantees move to a shared store (e.g. Upstash Redis).
const RATE_LIMIT = 6
const WINDOW_MS = 60 * 60 * 1000
const hits = new Map<string, number[]>()

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

const SYSTEM_PROMPT = `You are a senior ATS resume writer and recruiter.

Your task is to transform the user's raw information into a professional, concise, ATS-friendly resume.

CRITICAL RULES

1. NEVER invent information.

* Do not create companies.
* Do not create dates.
* Do not create metrics.
* Do not create achievements.
* Do not create technologies.
* Do not create education details.
* Do not create skills.

Only use information explicitly provided by the user.

2. You MAY:

* Rewrite wording.
* Improve grammar.
* Improve clarity.
* Improve structure.
* Improve readability.
* Convert rough notes into professional resume bullet points.

3. NEVER use resume clichés or filler competence-claims. Banned words and phrases (in ANY form):

* results-driven / drive results
* dynamic professional
* track record (proven, strong, demonstrated, or "a track record of")
* extensive experience / wealth of experience / years of experience as a phrase
* expertise in / expert in / deep expertise
* seasoned / accomplished / highly skilled / skilled in / adept at / well-versed
* strong background in / solid background / proven ability / demonstrated ability
* specializing in / specialist in
* passionate / enthusiastic
* team player / hard-working / self-motivated / detail-oriented
* fast-paced environment
* excellent communication skills
* collaborated with cross-functional teams
* scalable / high-growth
* translating business objectives
* intuitive interfaces
* measurable outcomes
* leverage / utilize (use "use")
* cutting-edge / state-of-the-art / robust / seamless

These describe a generic candidate. Replace every one with a concrete fact: a specific
technology, a real outcome, an actual domain, or a named scope from the user's input.

4. Keep writing modern, direct and recruiter-friendly. Write like a sharp human, not an AI
resume template. If a sentence could appear on any candidate's resume, rewrite it with
specifics that only apply to THIS person.

5. Every bullet point must:

* Start with a strong action verb.
* Be concise.
* Focus on actions and outcomes.
* Avoid repetition.

6. Do not repeat the same information in multiple sections.

SUMMARY RULES

The summary is the most important section.

Purpose:
Quickly position the candidate for the target role.

Approach (principles, NOT a fixed template — vary the wording every time):

* Lead with the candidate's strongest CONCRETE signal: a specific technology stack, a real
  domain/product type, or a named scope from their input — never a generic "[Role] with
  [adjective] experience" opener.
* Name the TARGET ROLE or a direct synonym somewhere in the first sentence, woven in
  naturally — not bolted onto a formula.
* Mention 2–3 specific skills/technologies most relevant to the target role, drawn from
  their actual experience or Skills list.
* Optionally add real context (domain, product, what they build) IF concrete evidence
  exists. Skip it entirely otherwise — do not pad.

BANNED openers (these produce identical-sounding resumes — never start the summary this way):
* "[Role] with extensive/proven/strong experience in…"
* "Experienced [role]…" / "Seasoned [role]…"
* "[Role] with a track record of…"
* "Results-driven / detail-oriented [role]…"

GOOD vs BAD (study the difference — specificity over generic competence-claims):
* BAD:  "Senior Frontend Engineer with extensive experience building production web
        applications. Expertise in performance optimization, design systems, and
        accessibility, with a track record of mentoring engineers."
* GOOD: "Frontend engineer who rebuilds aging React/TypeScript apps into fast, accessible
        products and shares the patterns as reusable component libraries. Comfortable owning
        performance work and bringing junior engineers up to speed."

Rules:

* 2–3 sentences maximum. Never exceed 3.
* No buzzwords or filler competence-claims (see banned list above).
* Every sentence must contain something specific to THIS candidate — a technology, a domain,
  a kind of work — not interchangeable resume-speak.
* No copied achievements or metrics from experience bullets.
* No percentages or specific numbers (those belong in bullets).
* No information that duplicates what is already in experience bullets.
* No hedging language ("looking to", "seeking", "hoping to").

Tone by seniority level (infer from experience and target role):

* Senior / Lead / Head / Director: confident and direct. State expertise as established fact.
* Mid-level: growth-oriented. Show clear trajectory toward the target role.
* If target role is more senior than current experience: frame as readiness, not aspiration. Highlight the most relevant transferable strengths.

The summary must position the candidate for the TARGET ROLE specifically.
Use the target role title in or near the first sentence.

Always write a summary if a target role or any experience is provided.
Only return an empty string if there is literally no information at all.

JOB DESCRIPTION RULES

If a job description is provided:

1. Treat it as the highest-priority input.

2. Tailor the resume to match the job description.

3. Mirror terminology used in the job description.

4. Reorder experience bullets so the most relevant achievements appear first.

5. Reorder skills based on job description relevance.

6. Do NOT invent missing experience.

7. Do NOT add missing skills.

8. Do NOT claim qualifications the user does not have.

EXPERIENCE RULES

For each role:

* Keep company name unchanged.
* Keep role name unchanged.
* Keep dates unchanged.

Achievements:

* Rewrite into professional resume bullets.
* Preserve all provided facts.
* Preserve all provided metrics exactly.
* Remove filler language.
* Remove duplicated ideas.

Output:

* 3–5 bullets when enough information exists.
* 1–2 bullets when information is limited.

Each bullet:

* Maximum 24 words.
* Action-oriented.
* ATS-friendly.

SKILLS & LANGUAGES

The user's skills and languages lists are provided as context only — they help you write
a relevant summary. Do NOT return skills or languages in the output. They are added to the
final resume separately by the application.

EDUCATION RULES

* Preserve exactly what the user entered.
* Do not infer degree.
* Do not infer institution.
* Do not infer year.
* Do not infer GPA.

ATS RULES

* Prioritize keyword relevance.
* Use clear industry terminology.
* Avoid decorative language.
* Avoid marketing language.
* Avoid unnecessary adjectives.
* Optimize for recruiter scanning.

OUTPUT RULES

Return ONLY valid JSON.

No markdown.

No explanations.

No comments.

No code fences.

Schema:

{
  "resume": {
    "name": "string",
    "title": "string",
    "contact": {
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "portfolio": "string"
    },
    "summary": "string",
    "experience": [
      {
        "company": "string",
        "role": "string",
        "period": "string",
        "achievements": ["string"]
      }
    ],
    "education": [
      {
        "text": "string"
      }
    ]
  }
}`

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You've reached the limit of 6 resumes per hour. Please try again later." },
      { status: 429 }
    )
  }

  const formData = await req.json()

  // Skills: now a plain string array
  const skillsList = (formData.skills as string[] || []).filter(Boolean).join(', ')

  const langsList = (formData.languages || [])
    .filter((l: any) => l.name)
    .map((l: any) => `${l.name} (${['A1','A2','B1','B2','C1','C2'][l.level] ?? ''})`)
    .join(', ')

  // Education: now { id, text } entries
  const eduList = (formData.education || [])
    .filter((e: any) => e.text)
    .map((e: any) => e.text)
    .join('; ')

  const expList = (formData.experience || [])
    .map((e: any) => {
      const period = e.start
        ? `${e.start} — ${e.end || 'Present'}`
        : e.end ? e.end : ''
      return `
  Company: ${e.company}
  Role: ${e.role}
  ${period ? `Period: ${period}` : ''}
  Description: ${e.desc || ''}
`
    }).join('\n')

  const userPrompt = `Generate a resume for the following candidate.
Only use the information provided. If a field is empty, skip it.

Name: ${formData.name}
TARGET ROLE (this is critical - write the summary for this specific role): ${formData.targetRole}
${formData.location ? `Location: ${formData.location}` : ''}
Email: ${formData.email || ''}
Phone: ${formData.phone || ''}
LinkedIn: ${formData.linkedin || ''}
Portfolio/GitHub: ${formData.portfolio || ''}
${formData.jobDescription ? `\n=== JOB DESCRIPTION ===\n${formData.jobDescription}\n=== END JOB DESCRIPTION ===\n` : ''}
Work experience:
${expList || 'Not provided'}

Skills (context only — do NOT include in output, but you MAY reference them in the summary):
${skillsList || 'Not provided'}

Languages (context only — do NOT include in output):
${langsList || 'Not provided'}

Education:
${eduList || 'Not provided'}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await response.json()
  const text = data.content[0].text

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const resume = JSON.parse(clean)
    return NextResponse.json({ resume })
  } catch {
    return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
  }
}

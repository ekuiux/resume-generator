import { NextRequest, NextResponse } from 'next/server'

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

3. NEVER use resume clichés:

* results-driven
* dynamic professional
* proven track record
* passionate
* team player
* hard-working
* self-motivated
* fast-paced environment
* excellent communication skills
* collaborated with cross-functional teams

4. Keep writing modern, direct and recruiter-friendly.

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

Rules:

* 2–3 sentences maximum.
* No buzzwords.
* No copied achievements.
* No copied metrics.
* No percentages.
* No detailed accomplishments.
* No information already present in experience bullets.

The summary should answer:

* Who is this person?
* What is their core expertise?
* What type of work do they do?

If there is not enough information:
Return summary as an empty string.

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

SKILLS RULES

* Use ONLY skills provided by the user.
* Never generate additional skills.
* Reorder skills based on relevance to target role and job description.

Split into:

technical
soft

If classification is unclear:
Place the skill in technical.

EDUCATION RULES

* Preserve exactly what the user entered.
* Do not infer degree.
* Do not infer institution.
* Do not infer year.
* Do not infer GPA.

LANGUAGE RULES

* Preserve exactly as provided.

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
    "skills": {
      "technical": ["string"],
      "soft": ["string"]
    },
    "languages": ["string"],
    "education": [
      {
        "text": "string"
      }
    ]
  }
}`

export async function POST(req: NextRequest) {
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
    .map((e: any) => `
  Company: ${e.company}
  Role: ${e.role}
  Period: ${e.start || ''} — ${e.end || 'Present'}
  Description: ${e.desc || ''}
`).join('\n')

  const userPrompt = `Generate a resume for the following candidate.
Only use the information provided. If a field is empty, skip it.

Name: ${formData.name}
Target role: ${formData.targetRole}
${formData.location ? `Location: ${formData.location}` : ''}
Email: ${formData.email || ''}
Phone: ${formData.phone || ''}
LinkedIn: ${formData.linkedin || ''}
Portfolio/GitHub: ${formData.portfolio || ''}
${formData.jobDescription ? `\n=== JOB DESCRIPTION ===\n${formData.jobDescription}\n=== END JOB DESCRIPTION ===\n` : ''}
Work experience:
${expList || 'Not provided'}

Skills:
${skillsList || 'Not provided'}

Languages:
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

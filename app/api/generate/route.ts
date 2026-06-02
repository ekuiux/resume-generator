import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a resume writer. Your job is to polish and restructure
the information the user provides — nothing more.

STRICT RULES:
- NEVER invent facts, companies, metrics, dates, or achievements not mentioned by the user
- NEVER use generic filler phrases like "motivated professional", "dynamic environment",
  "proven track record", "collaborated with cross-functional teams"
- If a field is empty or missing — leave that section empty or omit it entirely
- If experience description is vague — rewrite it clearly but do not add invented details
- Summary must be based ONLY on what the user provided. If no real info — return empty string ""
- Skills must come ONLY from what the user listed. Do not add skills they didn't mention
- Education must reflect only what the user entered. If empty — return empty array []

WHAT YOU CAN DO:
- Rewrite sentences with stronger action verbs based on the user's own words
- Fix grammar and improve clarity
- Structure bullet points properly
- If a job description is provided, prioritize its keywords in the resume
- Tailor the summary and skill ordering to match the target role and job description

Return ONLY valid JSON, no markdown, no explanations.
Schema:
{
  "ru": {
    "name": "string",
    "title": "string",
    "summary": "string — empty string if insufficient info",
    "experience": [{"company": "string", "role": "string", "period": "string", "achievements": ["string"]}],
    "skills": {"technical": ["string"], "soft": ["string"]},
    "education": [{"institution": "string", "degree": "string", "year": "string"}]
  }
}

Return ONLY JSON, nothing else.`

export async function POST(req: NextRequest) {
  const formData = await req.json()

  const location = formData.location || 'Not specified'

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

  const userPrompt = `Generate a professional English-language resume for:
IMPORTANT: Only use information explicitly provided below. If a field is empty, skip it.
Name: ${formData.name}
Target role: ${formData.targetRole}
Location: ${location}
Email: ${formData.email || ''}
Phone: ${formData.phone || ''}
LinkedIn: ${formData.linkedin || ''}
Portfolio/GitHub: ${formData.portfolio || ''}
${formData.jobDescription ? `\nJob description (tailor resume to match this):\n${formData.jobDescription}\n` : ''}
Work experience:
${expList || 'Not provided'}

Skills:
${skillsList || 'Not provided'}

Languages:
${langsList || 'Not provided'}

Education:
${eduList || 'Not provided'}

Return ONLY JSON.`

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

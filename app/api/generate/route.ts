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
- Infer seniority tone from the level field (Senior = confident claims, Junior = learning-focused)

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

  const ind = formData.industry || 'Not specified'
  const lvl = ['Intern','Junior','Mid','Senior','Lead'][formData.level] ?? 'Not specified'
  const location = [formData.city, formData.country].filter(Boolean).join(', ') || 'Not specified'

  const skillsList = (formData.skills || [])
    .filter((s: any) => s.name)
    .map((s: any) => {
      const lvlName = ['Beginner','Familiar','Proficient','Advanced','Expert'][s.level] ?? ''
      return `${s.name} (${lvlName})`
    }).join(', ')

  const langsList = (formData.languages || [])
    .filter((l: any) => l.name)
    .map((l: any) => `${l.name} (${['A1','A2','B1','B2','C1','C2'][l.level] ?? ''})`)
    .join(', ')

  const eduList = (formData.education || [])
    .filter((e: any) => e.degree || e.institution)
    .map((e: any) => `${e.degree || ''} at ${e.institution || ''}, ${[e.yearFrom, e.yearTo].filter(Boolean).join('–')}`)
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
Industry: ${ind}
Seniority: ${lvl}
Location: ${location}
Email: ${formData.email || ''}
Phone: ${formData.phone || ''}
LinkedIn: ${formData.linkedin || ''}
GitHub: ${formData.github || ''}

Work experience:
${expList || 'Not provided'}

Skills (use proficiency levels to calibrate tone — Expert/Advanced = confident claims, Beginner/Familiar = "familiar with"):
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
  console.log('API response:', JSON.stringify(data)) // добавили
  const text = data.content[0].text
  
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    console.log('Claude response:', text) // добавили лог
    const resume = JSON.parse(clean)
    return NextResponse.json({ resume })
  } catch {
    console.log('Raw text:', text) // и тут
    return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
  }
}
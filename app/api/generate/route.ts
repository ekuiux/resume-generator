import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an expert resume writer. Generate a professional resume based on the user's input.

Return ONLY valid JSON, no markdown, no explanations.
Schema:
{
  "ru": {
    "name": "string",
    "title": "string", 
    "summary": "string (3-4 sentences, achievement-focused)",
    "experience": [{"company": "string", "role": "string", "period": "string", "achievements": ["string"]}],
    "skills": {"technical": ["string"], "soft": ["string"]},
    "education": [{"institution": "string", "degree": "string", "year": "string"}]
  },
  "en": { }
}

Rules:
- Every achievement must show what you DID and what was the RESULT
- Use action verbs: Led, Built, Increased, Reduced, Launched
- Add realistic metrics if user didn't provide them
- Return ONLY JSON, nothing else`

export async function POST(req: NextRequest) {
  const formData = await req.json()

  const userPrompt = `Generate a resume for:
Name: ${formData.name}
Target role: ${formData.targetRole}
Industry: ${formData.industry}
Level: ${formData.level}
Location: ${formData.location}
Email: ${formData.email}
Phone: ${formData.phone}

Experience:
${formData.experience.map((e: any) => `
  Company: ${e.company}
  Role: ${e.role}
  Period: ${e.startDate} — ${e.endDate}
  Description: ${e.description}
`).join('\n')}

Skills: ${formData.technicalSkills}
Education: ${formData.education}
Languages: ${formData.languages?.join(', ')}

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
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Your Resume — Resumetion',
  description: 'Fill in your details, paste the job posting, and get a tailored, ATS-ready resume in minutes.',
}

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

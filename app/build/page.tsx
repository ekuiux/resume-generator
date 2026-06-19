'use client'

import dynamic from 'next/dynamic'

const ResumeBuilder = dynamic(() => import('../components/ResumeBuilder'), { ssr: false })

export default function BuildPage() {
  return <ResumeBuilder />
}

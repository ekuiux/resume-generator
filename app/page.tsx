'use client'

import dynamic from 'next/dynamic'

const ResumeForm = dynamic(() => import('./components/ResumeForm'), { ssr: false })

export default function Home() {
  return <ResumeForm />
}
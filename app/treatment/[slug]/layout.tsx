import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Treatment Details'
}

export default function TreatmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

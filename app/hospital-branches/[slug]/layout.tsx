import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'index, follow',
}

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

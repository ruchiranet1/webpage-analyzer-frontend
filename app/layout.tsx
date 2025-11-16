import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web Page Analyzer',
  description: 'Analyze web pages for HTML structure, headings, links, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
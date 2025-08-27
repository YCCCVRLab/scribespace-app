import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScribeSpace - All-in-One Document Creator',
  description: 'Create, edit, and publish documents with PDF integration, real-time collaboration, and multi-format export',
  keywords: 'document editor, PDF, ebook creator, collaboration, note taking',
  authors: [{ name: 'YCCC VR Lab' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root" className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
        <div id="modal-root"></div>
        <div id="tooltip-root"></div>
      </body>
    </html>
  )
}
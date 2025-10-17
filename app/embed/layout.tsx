import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './embed.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CompareLeads - Embed',
  description: 'Outil de comparaison des leads - Version Embed',
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} embed-body`}>
        <div className="embed-container">
          {children}
        </div>
      </body>
    </html>
  )
}

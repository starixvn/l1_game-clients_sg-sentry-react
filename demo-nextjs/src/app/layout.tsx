import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SentryProvider } from '@/components/providers/SentryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SG-Sentry Demo - Next.js',
    description: 'Next.js TypeScript demo for SG-Sentry library with component-based configuration',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SentryProvider>
                    {children}
                </SentryProvider>
            </body>
        </html>
    )
} 
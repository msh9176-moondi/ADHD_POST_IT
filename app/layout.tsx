import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '10분 포스트잇',
  description: '머릿속 혼란을 포스트잇 한 장의 10분 행동으로 바꾸는 ADHD 계획작성 도구',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '10분 포스트잇',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: '10분 포스트잇',
    description: '머릿속 혼란을 포스트잇 한 장의 10분 행동으로 바꾸는 ADHD 계획작성 도구',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fbbf24',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-amber-50 antialiased">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(()=>{}) }`
        }} />
      </body>
    </html>
  )
}

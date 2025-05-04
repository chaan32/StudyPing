import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/components/auth-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <title>StudyPing - 스터디 모집 플랫폼</title>
        <meta name="description" content="함께 성장하는 스터디 모임을 찾아보세요" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };

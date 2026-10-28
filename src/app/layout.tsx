import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { StoreProvider } from "@/providers/StoreProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "IMS", template: "%s · IMS" },
  description: "Product and inventory management portal.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}

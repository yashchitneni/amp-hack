import './globals.css'

export const metadata = {
  title: 'Office Object Hunt',
  description: 'AR Scavenger Hunt Game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

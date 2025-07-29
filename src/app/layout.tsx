import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Object Hunt",
  description: "AR scavenger hunt game - find office objects using your camera!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

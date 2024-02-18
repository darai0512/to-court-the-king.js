import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "To Court The King",
  description: "Board game of 'To Court The King'",
  icons: {
    icon: '/images/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer>
          powered by <a href='https://github.com/darai0512/to-court-the-king.js' target='_blank'>daraiii</a>
        </footer>
      </body>
    </html>
  );
}

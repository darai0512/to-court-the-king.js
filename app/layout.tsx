import type { Metadata } from "next";
import Link from 'next/link'
import Image from "next/image"
import { Inter } from "next/font/google";
import "./globals.css";
import {LanguageIcon} from "@heroicons/react/16/solid";
import { Dropdown, DropdownItem, Tooltip, CustomFlowbiteTheme } from 'flowbite-react'
import {getLocale} from './server'
import i18n, {title} from './const'

const inter = Inter({ subsets: ["latin"] });

const description = "Online game of 'To Court The King'"
const url = "https://to-court-the-king-js.vercel.app/"
export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    title,
    description,
    images: `${url}images/bg.webp`,
    url,
    siteName: title,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
    site: '@darai_0512',
    creator: '@darai_0512',
  },
}

const dropdownTheme: CustomFlowbiteTheme['dropdown'] = {
  floating: {
    style: {
      auto: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
      dark: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
      light: "border border-gray-200 bg-white/50 text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white",
    },
  }
}
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Object,
}>) {
  const lang = await getLocale(null) // not include searchParams
  return (
    <html lang={lang}>
      <body className={inter.className + ' min-h-screen min-w-[400px]'}>
        <header className="text-white/50 text-sm font-semibold leading-6 [text-shadow:_1px_1px_0_black]">
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <Image className="h-8 w-auto"
                     src="/images/logo.png"
                     alt="logo"
                     width={32}
                     height={32}
                     priority
              />
            </div>
            <div className="flex gap-x-4 sm:gap-x-8">
              <Link href="#cards" className="flex items-center gap-x-1">
                Cards
              </Link>
              <a href={`/api/rule`} target="_blank">
                Rule
              </a>
              <a href="https://github.com/darai0512/to-court-the-king.js/issues/new/choose" target="_blank">
                Issue
              </a>
              <a href="https://status.peerjs.com/" target="_blank">
                <Tooltip content={i18n[lang].status} placement="bottom">
                  Status
                </Tooltip>
              </a>
              <a href="https://www.amazon.co.jp/dp/B00VYK67JS/ref=nosim?tag=papuwa-22" target='_blank'>
                Buy
              </a>
            </div>
            <div className="lg:flex lg:flex-1 lg:justify-end">
              <div className="text-gray-400 [text-shadow:initial]">
                <Dropdown dismissOnClick={false}
                          label={<LanguageIcon className="h-5 w-5" aria-hidden="true" />}
                          theme={dropdownTheme}
                          inline>
                  <DropdownItem as={Link} href="/?lang=ja">日本語</DropdownItem>
                  <DropdownItem as={Link} href="/?lang=en">English</DropdownItem>
                </Dropdown>
              </div>
            </div>
          </nav>
        </header>
        <main className="flex flex-col items-center px-4 sm:px-10">
          {children}
        </main>
        <footer className="sticky top-[100vh] w-full text-center p-1 md:py-2">
          <hr className="my-1 border-gray-200 lg:my-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 by <a href="https://github.com/darai0512" className="hover:underline" target='_blank'>daraiii</a>
          </span>
        </footer>
        <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js" async></script>
      </body>
    </html>
  );
}
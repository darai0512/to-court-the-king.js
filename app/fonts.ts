import localFont from "next/font/local";
import { Inter } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

/*
@font-face {
  font-family: "hibiwaremoji";
  src: url("/images/hibiwaremoji.ttf") format("truetype");
}
@todo
<Head>
<link
        rel="preload"
        href="/images/hibiwaremoji.ttf"
        as="font"
        crossOrigin=""
        type="font/ttf"
      />
</Head>
 */
export const hibiwaremoji = localFont({ src: './hibiwaremoji.ttf' })
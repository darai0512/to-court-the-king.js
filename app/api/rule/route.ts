import {getLocale} from "~/app/server"
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const lang = await getLocale(req.nextUrl.searchParams.get('lang'))

  redirect( `/images/${lang}.pdf`)
}

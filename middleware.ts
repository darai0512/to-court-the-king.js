import { NextResponse, NextRequest } from 'next/server'
import {getLocale} from "~/app/server"
export async function middleware(request: NextRequest) {
  const lang = await getLocale(request.nextUrl.searchParams.get('lang'))
  const response = NextResponse.next()
  response.cookies.set('NEXT_LOCALE', lang)

  return response
}

export const config = {
  matcher: '/',
}
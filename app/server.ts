'use server'
import Field from '~/src/field'
import {Step} from '~/src/const'
import i18n, {defaultLng, I18nStr} from './const'
import { headers, cookies } from 'next/headers';

const field = new Field()
const lngs = Object.keys(i18n)

export async function next(data: any, params: any) {
  try {
    let newData = field.next(data, params)
    if (newData.step === Step.roll) newData = field.next(data, {})
    return {success: true, data: newData}
  } catch(e: any) {
    console.error(e)
    return {success: false, error: e.code}
  }
}

export async function getLocale(lang: string|null): Promise<I18nStr> {
  if (lngs.includes(lang as any)) return lang as I18nStr
  const cLang = cookies().get('NEXT_LOCALE')?.value
  if (lngs.includes(cLang as any)) return cLang as I18nStr
  const hLang = headers().get('accept-language') // ex, ja,en-US;q=0.9,en;q=0.8
  if (!hLang) return defaultLng
  for (const v of hLang.split(',')) {
    const [lRegion, _q] = v.split(';')
    const [l, _r] = lRegion.split('-')
    if (lngs.includes(l)) return l as I18nStr
  }
  return defaultLng
}

'use client'

import {buttonClassName} from "~/app/const";
import { useSearchParams } from "next/navigation"
import i18n, {defaultLng, I18nStr} from './const'

const lngs = Object.keys(i18n) as I18nStr[]

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useSearchParams()
  const lang = lngs.includes(params.get('lang') as any) ? params.get('lang') as I18nStr : defaultLng
  return (
    <>
      <button className={"my-2 " + buttonClassName} onClick={reset}>
        Restart
      </button>
      <h1>{i18n[lang]['error.title']}</h1>
      <div>{i18n[lang]['error.report']}</div>
      <a href="https://github.com/darai0512/to-court-the-king.js/issues/new?template=1-bug-report.yml"
         target="_blank"
      >
        <button className={"my-2 " + buttonClassName}>
          Report Bugs
        </button>
      </a>
      <div>Error message:</div>
      <div>{(typeof error === 'string' ? error : error.message) || 'none'}</div>
    </>
  )
}

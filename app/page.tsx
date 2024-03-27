import {getLocale} from './server'
import i18n from './const'
import Main from './main'
import Provider from './provider'

export default async function Home({searchParams}: {searchParams: Record<string, string>}) {
  const intl = await getLocale(searchParams.lang)

  return (
    <Provider messages={i18n[intl]} locale={intl}>
      <Main />
    </Provider>
  )
}
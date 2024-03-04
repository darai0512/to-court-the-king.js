'use client';

import { IntlProvider } from 'react-intl';

export default async function Provider({messages, locale, children}: {messages: Record<string, string>, locale: string, children: any}) {
  return (
    <IntlProvider messages={messages} locale={locale}>
      {children}
    </IntlProvider>
  );
}

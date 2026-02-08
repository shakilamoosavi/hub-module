import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale ?? 'en-US';
  return {
    locale: currentLocale,
    messages: (await import(`./locales/${currentLocale}/common.json`)).default
  };
});

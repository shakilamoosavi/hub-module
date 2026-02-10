import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale ?? 'fa-IR';
  return {
    locale: currentLocale,
    messages: (await import(`./locales/${currentLocale}/common.json`)).default
  };
});

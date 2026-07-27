import { redirect } from 'next/navigation';
import { hasLocale, localizeHref } from '@/lib/i18n';

export default async function LegacyToolsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(hasLocale(lang) ? localizeHref(lang, '/projects') : '/projects');
}

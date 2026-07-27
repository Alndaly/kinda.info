import { permanentRedirect } from 'next/navigation';
import { hasLocale, localizeHref } from '@/lib/i18n';

export default async function LegacyPostsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  permanentRedirect(hasLocale(lang) ? localizeHref(lang, '/notes') : '/notes');
}

import { permanentRedirect } from 'next/navigation';
import { hasLocale, localizeHref } from '@/lib/i18n';
import { getCanonicalPostSlug } from '@/lib/legacy-routes';

export default async function LegacyPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const href = `/notes/${getCanonicalPostSlug(slug)}`;
  permanentRedirect(hasLocale(lang) ? localizeHref(lang, href) : href);
}

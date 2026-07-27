import { redirect } from 'next/navigation';
import { hasLocale, localizeHref } from '@/lib/i18n';

export default async function LegacyPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const href = `/notes/${slug}`;
  redirect(hasLocale(lang) ? localizeHref(lang, href) : href);
}

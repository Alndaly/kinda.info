import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { allEntries, getEntry } from '@/lib/content';
import { getDictionary, getLocaleAlternates, hasLocale, localizeHref } from '@/lib/i18n';

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return Array.from(
    new Set(allEntries.filter((entry) => entry.type === 'project').map((entry) => entry.slug)),
  ).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = getEntry('project', slug, lang);
  if (!project) return {};
  const baseHref = `/projects/${slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: getLocaleAlternates(lang, baseHref),
    openGraph: {
      title: project.title,
      description: project.summary,
      url: project.href,
      images: project.cover ? [project.cover] : ['/og.png'],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = getDictionary(lang).projects;
  const project = getEntry('project', slug, lang);
  if (!project) notFound();

  return (
    <article>
      <header className="project-detail-header site-container">
        <Link href={localizeHref(lang, '/projects')} className="back-link">
          <ArrowLeft /> {dictionary.back}
        </Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <div className="mb-6 flex gap-2">
              <Badge>{project.status ?? 'active'}</Badge>
              {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            {project.link && (
              <Button asChild className="mt-8 rounded-full">
                <Link href={project.link} target="_blank">
                  {dictionary.visit} <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          {project.cover && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
              <Image src={project.cover} alt="" fill priority sizes="50vw" className="object-cover" />
            </div>
          )}
        </div>
      </header>
      <div className="mdx-prose">
        <TiptapContent content={project.content} fallbackHtml={project.html} />
      </div>
    </article>
  );
}

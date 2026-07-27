import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiptapContent } from '@/components/tiptap/tiptap-content';
import { getEntry, projects } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getEntry('project', (await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: project.href },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: project.href,
      images: project.cover ? [project.cover] : ['/og.png'],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getEntry('project', (await params).slug);
  if (!project) notFound();

  return (
    <article>
      <header className="project-detail-header site-container">
        <Link href="/projects" className="back-link"><ArrowLeft /> 回到作品</Link>
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
                  查看项目 <ArrowUpRight className="ml-2 h-4 w-4" />
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

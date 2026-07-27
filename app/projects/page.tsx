import type { Metadata } from 'next';
import { ProjectCard } from '@/components/project-card';
import { projects } from '@/lib/content';

export const metadata: Metadata = {
  title: '作品',
  description: '在真实世界里试着解决问题的一些产品与开源项目。',
};

export default function ProjectsPage() {
  return (
    <div className="site-container page-top">
      <header className="archive-header archive-header-split">
        <div>
          <span className="section-index">Index / 03</span>
          <h1>作品</h1>
        </div>
        <p>代码只是材料，产品才是我和世界对话的方式。这里收录正在生长的产品、开源工具，也保留那些曾经认真做过的实验。</p>
      </header>
      <div className="grid gap-x-10 gap-y-20 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} entry={project} index={index} />
        ))}
      </div>
    </div>
  );
}

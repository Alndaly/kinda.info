import { projects } from "../../constants/projects";
import Comments from "@/components/comments";

const ProjectsPage = () => {
	return (
		<div className='mx-auto p-5'>
			<div className='grid drid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5'>
				{projects.map((project, index) => {
					return (
						<a
							target='_blank'
							href={project.url}
							className='box-border group bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg border border-zinc-50 dark:border-zinc-800 p-5 flex flex-col cursor-pointer no-underline gap-2'
							key={index}>
							<div className='aspect-video rounded overflow-hidden'>
								<div
									className='w-full h-full no-repeat bg-center bg-cover group-hover:scale-110 transition-transform duration-300 ease-in-out'
									style={{ backgroundImage: `url(${project.image})` }}></div>
							</div>
							<div>{project.title}</div>
							<div className='text-sm leading-6 text-slate-500 dark:text-slate-400'>
								{project.description}
							</div>
						</a>
					);
				})}
			</div>
			<Comments />
		</div>
	);
};

export default ProjectsPage;

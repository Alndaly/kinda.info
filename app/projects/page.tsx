import { projects } from "../../constants/projects";

const ProjectsPage = () => {
	return (
		<div className='px-8 py-8 mx-auto'>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5'>
				{projects.map((project, index) => {
					return (
						<a
							target='_blank'
							href={project.url}
							className='box-border group rounded ring-1 ring-inset dark:ring-white/10 dark:bg-white/5 ring-black/10 bg-black/5 p-5 flex flex-col cursor-pointer no-underline gap-2'
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
		</div>
	);
};

export default ProjectsPage;

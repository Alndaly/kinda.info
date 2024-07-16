export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='relative flex justify-center items-center h-[100vh] bg-[url(https://oss.kinda.info/image/202407162245653.jpeg)] bg-cover'>
			{children}
		</div>
	);
}

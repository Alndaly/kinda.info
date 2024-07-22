import Footer from '@/components/footer';

export default function PostLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<section className='mt-[64px] '>{children}</section>
			<Footer />
		</>
	);
}

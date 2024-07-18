import Footer from '@/components/footer';

export default function PostLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			{children}
			<Footer />
		</section>
	);
}

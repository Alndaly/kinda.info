import Footer from '@/components/footer';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='mt-[64px]'>
			{children}
			<Footer />
		</div>
	);
}

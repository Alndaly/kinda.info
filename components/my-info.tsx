'use client';

const MyInfo = () => {
	return (
		<div className='w-full p-5 flex justify-center items-center flex-col gap-3'>
			<div
				className='rounded-full bg-center no-repeat bg-cover w-24 h-24'
				style={{
					backgroundImage: `url(https://oss.kinda.info/image/202402122029799.jpeg)`,
				}}></div>
			<div>阡陌</div>
		</div>
	);
};

export default MyInfo;

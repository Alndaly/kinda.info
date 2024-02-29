import { allSentences } from 'contentlayer/generated';
import SentenceCard from '../components/sentence-card';

const SentencePage = () => {
	const sentences = allSentences.sort((a, b) => b.updateTime - a.updateTime);
	return (
		<div className='mx-auto prose dark:prose-invert lg:prose-lg xl:prose-xl'>
			<div className='grid drid-cols-1 gap-5 p-5'>
				{sentences.map((sentence, idx) => (
					<SentenceCard key={idx} {...sentence} />
				))}
			</div>
		</div>
	);
};

export default SentencePage;

import { Sentence } from 'contentlayer/generated';
import { Mdx } from '@/app/components/mdx-components';
import moment from 'moment-timezone';
import { siteConfig } from '@/site.config';

const SentenceCard = async (sentence: Sentence) => {
	return (
		<div
			className='rounded-xl p-4 shadow-sm border border-zinc-50 dark:border-zinc-800'>
			<div className='mb-4'>
				<div className='text-secondary-color text-sm'>
				{moment(sentence.updateTime).tz(siteConfig.timeZone).format('LLLL')}
				</div>
			</div>
			<Mdx code={sentence.body.code}></Mdx>
			<div></div>
		</div>
	);
};

export default SentenceCard;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayIcon, PauseIcon } from 'lucide-react';

interface Track {
	title: string;
	artist: string;
	src: string;
}

const AudioPlayer: React.FC = () => {
	const [tracks, setTracks] = useState<Track[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handlePlayPause = () => {
		if (isPlaying) {
			audioRef.current?.pause();
			setIsPlaying(false);
		} else {
			audioRef.current?.play();
			setIsPlaying(true);
		}
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
			setProgress(
				(audioRef.current.currentTime / audioRef.current.duration) * 100
			);
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = tracks[currentTrackIndex]?.src || '';
			audioRef.current.load();
			if (isPlaying) {
				audioRef.current.play();
			}
		}
	}, [currentTrackIndex, tracks]);

	// 初始化 tracks 并自动播放
	useEffect(() => {
		const newTracks = [
			{
				title: 'Track 1',
				artist: 'Artist 1',
				src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
			},
		];
		setTracks(newTracks);

		// 自动播放逻辑
		if (audioRef.current) {
			audioRef.current.src = newTracks[0].src;
			audioRef.current.load();
			audioRef.current
				.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch((error) => {
					console.error('Auto play failed:', error);
				});
		}
	}, []);

	return (
		<div className='w-full rounded-full bg-black flex justify-center items-center px-5 py-4 gap-2'>
			<div className='flex items-center gap-4'>
				<Button variant='link' size='icon' onClick={handlePlayPause}>
					{isPlaying ? (
						<PauseIcon className='w-6 h-6' />
					) : (
						<PlayIcon className='w-6 h-6' />
					)}
				</Button>
			</div>
			<div className='w-full'>
				<Progress value={progress} />
				<div className='flex justify-between text-sm text-muted-foreground'>
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>
			<audio
				ref={audioRef}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
			/>
		</div>
	);
};

export default AudioPlayer;

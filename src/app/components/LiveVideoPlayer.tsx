"use client";

import { YouTubeVideoResult } from "@/types/videoTypes";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { useYoutubePlayer } from "@/app/hooks/useYouTubePlayer";

interface LiveVideoPlayerProps {
    selectedVideo: YouTubeVideoResult | null;
}

/**
 * LiveVideoPlayer - A simplified YouTube video player for live videos.
 *
 * @param {YouTubeVideoResult | null} selectedVideo - The video object to be played, or null if no video is selected.
 *
 * @returns {JSX.Element} - Returns a video player with play / pause buttons.
 */
export default function LiveVideoPlayer({
    selectedVideo,
}: LiveVideoPlayerProps): JSX.Element {
    const [videoId, setVideoId] = useState<string | null>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // In LiveVideoPlayer
    const onReady = useCallback(() => {
        if (selectedVideo?.id.videoId) {
            loadVideo(selectedVideo.id.videoId);
        }
        setPlayerReady(true);
    }, [selectedVideo?.id.videoId]);

    const onStateChange = useCallback((event: YT.OnStateChangeEvent) => {
        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    }, []);

    const { playerContainerRef, playerInstance, play, pause, cueVideo } =
        useYoutubePlayer({
            onReady,
            onStateChange,
            onCleanup: () => {},
        });

    const loadVideo = (videoId: string) => {
        cueVideo(videoId);
        setVideoId(videoId);
    };

    useEffect(() => {
        if (selectedVideo && playerReady && playerInstance) {
            const newVideoId = selectedVideo.id.videoId;
            if (newVideoId && newVideoId !== videoId) {
                loadVideo(newVideoId);
            }
        }
    }, [selectedVideo, playerReady, playerInstance, videoId]);

    const togglePlayPause = () => {
        if (!playerInstance) return;

        if (playerInstance.getPlayerState() === window.YT.PlayerState.PLAYING) {
            pause();
        } else {
            play();
        }
    };

    if (!selectedVideo) {
        return (
            <div className="flex items-center justify-center h-full text-lg text-gray-500">
                No video selected
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="aspect-video relative">
                <div ref={playerContainerRef} className="w-full h-full"></div>
            </div>

            <div className="bg-gray-100 p-3 rounded-b-lg border-t border-gray-200">
                {/* Video title */}
                <div className="min-w-0 p-2 font-bold text-lg">
                    LIVE:{" "}
                    {selectedVideo.snippet.title.replace(/&#39;/g, "'") ?? ""}
                </div>
                {/* Play or Pause */}
                <div className="flex items-center mb-3">
                    <button
                        onClick={togglePlayPause}
                        className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-1 border rounded m-2 cursor-pointer"
                        aria-label={
                            isPlaying ? "Pause live stream" : "Play live stream"
                        }
                    >
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                </div>
            </div>
        </div>
    );
}

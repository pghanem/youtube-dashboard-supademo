"use client";

import { YouTubeVideoResult } from "@/types/videoTypes";
import React, { JSX, useEffect, useRef, useState } from "react";
import { useYoutubePlayer } from "@/app/hooks/useYouTubePlayer";
import VideoInfo from "@/app/components/VideoInfo";
import VideoControls from "@/app/components/VideoControls";
import TrimSlider from "@/app/components/TrimSlider";
import { formatTime } from "@/app/utils/formatTime";

interface StandardVideoPlayerProps {
    selectedVideo: YouTubeVideoResult | null;
}

/**
 * StandardVideoPlayer - A YouTube video player component with custom controls and trim functionality.
 *
 * @param {YouTubeVideoResult | null} selectedVideo - The video object to be played, or null if no video is selected.
 *
 * @returns {JSX.Element} - Returns a video player with custom controls, including play/pause buttons and trim settings.
 */
export default function StandardVideoPlayer({
    selectedVideo,
}: StandardVideoPlayerProps): JSX.Element {
    // Core state
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(100);
    const [isDraggingState, setIsDraggingState] = useState<
        "left" | "right" | null
    >(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Refs to avoid closure issues
    const trimStartRef = useRef(0);
    const trimEndRef = useRef(100);
    const isDraggingRef = useRef<"left" | "right" | null>(null);

    // Handle player state changes
    const handlePlayerStateChange = (event: YT.OnStateChangeEvent) => {
        if (!playerInstance) return;

        if (event.data === window.YT.PlayerState.CUED) {
            const duration = playerInstance.getDuration() || 0;
            const startTimeSeconds = (trimStartRef.current / 100) * duration;
            setVideoDuration(duration);
            setCurrentTime(startTimeSeconds);
            setIsVideoLoading(false);
        }

        if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            setCurrentTime(playerInstance.getCurrentTime() || 0);
            stopTimeUpdate();
        }

        if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            setCurrentTime(playerInstance.getDuration() || 0);
            stopTimeUpdate();
        }

        const isNowPlaying = event.data === window.YT.PlayerState.PLAYING;
        setIsPlaying(isNowPlaying);

        if (isNowPlaying) {
            startTimeUpdate();
        } else {
            stopTimeUpdate();
        }
    };

    const {
        playerContainerRef,
        playerInstance,
        play,
        pause,
        seekTo,
        cueVideo,
    } = useYoutubePlayer({
        onReady: () => {
            if (selectedVideo?.id.videoId) loadVideo(selectedVideo.id.videoId);
            setPlayerReady(true);
        },
        onStateChange: handlePlayerStateChange,
        onCleanup: () => stopTimeUpdate(),
    });

    // Custom setter for isDragging that updates both state and ref
    const setIsDragging = (value: "left" | "right" | null) => {
        isDraggingRef.current = value;
        setIsDraggingState(value);
    };

    // Keep refs in sync with state
    useEffect(() => {
        trimStartRef.current = trimStart;
    }, [trimStart]);

    useEffect(() => {
        trimEndRef.current = trimEnd;
    }, [trimEnd]);

    const loadVideo = (videoId: string) => {
        setIsVideoLoading(true);

        try {
            const { start = 0, end = 100 } = JSON.parse(
                localStorage.getItem(`yt-trim-${videoId}`) || "{}",
            );

            setTrimStart(start);
            setTrimEnd(end);
        } catch (e) {
            console.log(e);
            setTrimStart(0);
            setTrimEnd(100);
        }

        cueVideo(videoId);
        setVideoId(videoId);
    };

    // Handle selected video changes
    useEffect(() => {
        // Only run when we have everything we need
        if (selectedVideo?.id.videoId && playerReady && playerInstance) {
            const newVideoId = selectedVideo.id.videoId;
            if (newVideoId !== videoId) {
                loadVideo(newVideoId);
            }
        }
    }, [selectedVideo, playerReady, playerInstance, videoId]);

    // Clean time update functions
    const startTimeUpdate = () => {
        stopTimeUpdate();

        intervalRef.current = window.setInterval(() => {
            if (!playerInstance) return;

            const time = playerInstance.getCurrentTime();
            setCurrentTime(time);

            // Skip boundary checks while dragging using the ref
            if (isDraggingRef.current) return;

            const duration = playerInstance.getDuration();
            const trimStartTime = (trimStartRef.current / 100) * duration;
            const trimEndTime = (trimEndRef.current / 100) * duration;

            // Handle trim boundaries
            if (time >= trimEndTime) {
                seekTo(trimStartTime);
                setCurrentTime(trimStartTime);
            } else if (time < trimStartTime) {
                seekTo(trimStartTime);
            }
        }, 200);
    };

    const stopTimeUpdate = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Handle play/pause toggling
    const togglePlayPause = () => {
        if (!playerInstance) return;

        if (isPlaying) {
            pause();
        } else {
            const duration = playerInstance.getDuration();
            const trimStartTime = (trimStartRef.current / 100) * duration;
            const trimEndTime = (trimEndRef.current / 100) * duration;
            const currentPos = playerInstance.getCurrentTime();

            // If we're at the end, at or past the end trim, seek back to start
            if (
                playerInstance.getPlayerState() ===
                    window.YT.PlayerState.ENDED ||
                currentPos >= trimEndTime ||
                currentPos < trimStartTime
            ) {
                seekTo(trimStartTime);
            }

            play();
        }
    };

    const handleDragEnd = () => {
        if (isDraggingState && videoId) {
            localStorage.setItem(
                `yt-trim-${videoId}`,
                JSON.stringify({ start: trimStart, end: trimEnd }),
            );

            if (playerInstance) {
                const duration = playerInstance.getDuration();
                const trimStartTime = (trimStart / 100) * duration;
                const trimEndTime = (trimEnd / 100) * duration;
                const currentPosition = playerInstance.getCurrentTime();

                // After releasing, check if we need repositioning
                if (currentPosition < trimStartTime) {
                    seekTo(trimStartTime);
                    setCurrentTime(trimStartTime);
                } else if (currentPosition > trimEndTime && isPlaying) {
                    seekTo(trimStartTime);
                    setCurrentTime(trimStartTime);
                }
            }
        }
        setIsDragging(null);
    };

    const handleSliderChange = (
        type: "left" | "right",
        newPosition: number,
    ) => {
        if (type === "left") {
            setTrimStart(Math.min(newPosition, trimEnd - 5));
        } else {
            setTrimEnd(Math.max(newPosition, trimStart + 5));
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
                <VideoInfo title={selectedVideo.snippet.title} />

                <VideoControls
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    videoDuration={videoDuration}
                    onPlayPause={togglePlayPause}
                />

                <TrimSlider
                    currentTime={currentTime}
                    videoDuration={videoDuration}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    isVideoLoading={isVideoLoading}
                    onDragStart={(handle) => setIsDragging(handle)}
                    onDragEnd={handleDragEnd}
                    onSliderChange={handleSliderChange}
                />

                <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>
                        Start: {formatTime((trimStart / 100) * videoDuration)}
                    </span>
                    <span>
                        End: {formatTime((trimEnd / 100) * videoDuration)}
                    </span>
                </div>
            </div>
        </div>
    );
}

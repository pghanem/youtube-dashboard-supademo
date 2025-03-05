import React, { JSX } from "react";
import { formatTime } from "../utils/formatTime";

interface VideoControlsProps {
    isPlaying: boolean;
    currentTime: number;
    videoDuration: number;
    onPlayPause: () => void;
}

/**
 * VideoControls - Renders video playback controls including play/pause button and time display.
 *
 * @component
 * @param {Object} props - The component props
 * @param {boolean} props.isPlaying - Whether the video is currently playing
 * @param {number} props.currentTime - Current playback time in seconds
 * @param {number} props.videoDuration - Total duration of the video in seconds
 * @param {Function} props.onPlayPause - Callback for play/pause button click
 * @returns {JSX.Element} Playback controls UI
 */
export default function VideoControls({
    isPlaying,
    currentTime,
    videoDuration,
    onPlayPause,
}: VideoControlsProps): JSX.Element {
    return (
        <div className="flex items-center mb-3">
            <button
                onClick={onPlayPause}
                className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-1 border rounded m-2 cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
            >
                {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="text-gray-800">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
            </div>
        </div>
    );
}

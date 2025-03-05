"use client";

import { YouTubeVideoResult } from "@/types/videoTypes";
import React, { JSX } from "react";
import LiveVideoPlayer from "@/app/components/LiveVideoPlayer";
import StandardVideoPlayer from "@/app/components/StandardVideoPlayer";

interface VideoPlayerProps {
    selectedVideo: YouTubeVideoResult | null;
}

/**
 * VideoPlayer - A component that renders the appropriate video player based on video type.
 *cd
 * @param {YouTubeVideoResult | null} selectedVideo - The video object to be played, or null if no video is selected.
 *
 * @returns {JSX.Element} - Returns either a LiveVideoPlayer or StandardVideoPlayer based on the video type.
 */
export default function VideoPlayer({
    selectedVideo,
}: VideoPlayerProps): JSX.Element {
    const isLive = selectedVideo?.snippet.liveBroadcastContent === "live";

    return isLive ? (
        <LiveVideoPlayer key="live" selectedVideo={selectedVideo} />
    ) : (
        <StandardVideoPlayer key="standard" selectedVideo={selectedVideo} />
    );
}

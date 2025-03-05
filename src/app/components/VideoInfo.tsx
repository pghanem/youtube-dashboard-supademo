import React, { JSX } from "react";

interface VideoInfoProps {
    title: string;
}

/**
 * VideoInfo - Displays the title of the video with HTML entity decoding.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.title - The title of the video, potentially containing HTML entities
 * @returns {JSX.Element} The formatted video title
 */
export default function VideoInfo({ title }: VideoInfoProps): JSX.Element {
    return (
        <div className="min-w-0 p-2 font-bold text-lg">
            {title.replace(/&#39;/g, "'") ?? ""}
        </div>
    );
}

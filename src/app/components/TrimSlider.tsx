import React, { JSX, useEffect, useRef } from "react";

interface TrimSliderProps {
    currentTime: number;
    videoDuration: number;
    trimStart: number;
    trimEnd: number;
    isVideoLoading: boolean;
    onDragStart: (handle: "left" | "right") => void;
    onDragEnd: () => void;
    onSliderChange: (type: "left" | "right", newPosition: number) => void;
}

/**
 * TrimSlider - A component that provides video trimming functionality with draggable handles.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.currentTime - Current playback position in seconds.
 * @param {number} props.videoDuration - Total duration of the video in seconds.
 * @param {number} props.trimStart - The start trim position as a percentage (0-100).
 * @param {number} props.trimEnd - The end trim position as a percentage (0-100).
 * @param {boolean} props.isVideoLoading - Whether the video is currently loading.
 * @param {Function} props.onDragStart - Callback when drag starts with the handle type.
 * @param {Function} props.onDragEnd - Callback when drag operation ends.
 * @param {Function} props.onSliderChange - Callback when slider position changes.
 * @returns {JSX.Element} A slider component with trim handles.
 */
export default function TrimSlider({
    currentTime,
    videoDuration,
    trimStart,
    trimEnd,
    isVideoLoading,
    onDragStart,
    onDragEnd,
    onSliderChange,
}: TrimSliderProps): JSX.Element {
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (
        handle: "left" | "right",
        e: React.MouseEvent | React.TouchEvent,
    ) => {
        e.preventDefault();
        onDragStart(handle);
    };

    useEffect(() => {
        if (!onDragStart || !onDragEnd) return;

        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!sliderRef.current) return;

            const sliderRect = sliderRef.current.getBoundingClientRect();
            const sliderWidth = sliderRect.width;
            let clientX;

            if ("touches" in e) {
                clientX = e.touches[0].clientX;
            } else {
                clientX = e.clientX;
            }

            const newPosition = Math.max(
                0,
                Math.min(
                    100,
                    ((clientX - sliderRect.left) / sliderWidth) * 100,
                ),
            );

            const dragType = document.body.dataset.dragging as
                | "left"
                | "right"
                | undefined;
            if (dragType) {
                onSliderChange(dragType, newPosition);
            }
        };

        const handleMouseUp = () => {
            onDragEnd();
            document.body.dataset.dragging = "";
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleMouseMove, {
            passive: false,
        });
        document.addEventListener("touchend", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleMouseMove);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [onDragStart, onDragEnd, onSliderChange]);

    return (
        <div className="relative h-10">
            {/* Video slider track */}
            <div
                ref={sliderRef}
                className="absolute top-4 left-0 right-0 h-1 bg-gray-300 rounded"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={(currentTime / videoDuration) * 100}
            >
                {/* Trimmed region */}
                <div
                    className="absolute h-full bg-gray-500 rounded"
                    style={{
                        left: `${trimStart}%`,
                        width: `${trimEnd - trimStart}%`,
                    }}
                ></div>

                {/* Indicator for current video position */}
                {!isVideoLoading && (
                    <div
                        className="absolute w-1 h-5 rounded bg-red-500 transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{
                            left: `${(currentTime / videoDuration) * 100}%`,
                            top: "50%",
                        }}
                    ></div>
                )}
            </div>

            {/* Left draggable handle */}
            <div
                className="absolute top-2 w-3 lg:w-2 h-6 bg-gray-600 rounded cursor-ew-resize transform -translate-y-1/8 -translate-x-3 lg:-translate-x-2"
                style={{ left: `${trimStart}%` }}
                onMouseDown={(e) => {
                    document.body.dataset.dragging = "left";
                    handleDragStart("left", e);
                }}
                onTouchStart={(e) => {
                    document.body.dataset.dragging = "left";
                    handleDragStart("left", e);
                }}
                role="slider"
                aria-label="Set video start trim position"
                aria-valuemin={0}
                aria-valuemax={trimEnd}
                aria-valuenow={trimStart}
            ></div>

            {/* Right draggable handle */}
            <div
                className="absolute top-2 w-3 lg:w-2 h-6 bg-gray-600 rounded cursor-ew-resize -translate-y-1/8"
                style={{
                    left: `${trimEnd}%`,
                }}
                onMouseDown={(e) => {
                    document.body.dataset.dragging = "right";
                    handleDragStart("right", e);
                }}
                onTouchStart={(e) => {
                    document.body.dataset.dragging = "right";
                    handleDragStart("right", e);
                }}
                role="slider"
                aria-label="Set video end trim position"
                aria-valuemin={trimStart}
                aria-valuemax={100}
                aria-valuenow={trimEnd}
            ></div>
        </div>
    );
}

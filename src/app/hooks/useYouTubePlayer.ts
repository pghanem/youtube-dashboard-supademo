import { useCallback, useEffect, useRef, useState } from "react";

interface UseYoutubePlayerOptions {
    onReady: () => void;
    onStateChange: (event: YT.OnStateChangeEvent) => void;
    onCleanup?: () => void;
}

/**
 * A hook to initialize and control a YouTube player instance.
 *
 * @param options Configuration options for the YouTube player.
 * @param options.onReady Callback function called when the player is ready.
 * @param options.onStateChange Callback function called when the player state changes.
 * @param options.onCleanup Optional callback function called when the component unmounts.
 * @returns An object containing the player container ref and control methods.
 */
export function useYoutubePlayer(options: UseYoutubePlayerOptions) {
    const { onCleanup } = options;

    const playerInstance = useRef<YT.Player | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [isApiReady, setIsApiReady] = useState(!!window.YT);
    const callbacksRef = useRef(options);

    // Update callbacks ref when they change
    useEffect(() => {
        callbacksRef.current = options;
    }, [options]);

    // Stable function versions using the ref
    const stableOnReady = useCallback(() => {
        callbacksRef.current.onReady();
    }, []);

    const stableOnStateChange = useCallback((event: YT.OnStateChangeEvent) => {
        callbacksRef.current.onStateChange(event);
    }, []);

    // Initialize YouTube API if needed
    useEffect(() => {
        if (window.YT) {
            setIsApiReady(true);
            return;
        }

        // Only add script tag if not already present
        if (
            !document.querySelector(
                'script[src="https://www.youtube.com/iframe_api"]',
            )
        ) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setIsApiReady(true);
            };
        }
    }, []);

    // Initialize the player when API is ready and container exists
    useEffect(() => {
        if (
            !isApiReady ||
            !playerContainerRef.current ||
            playerInstance.current
        )
            return;

        playerInstance.current = new window.YT.Player(
            playerContainerRef.current,
            {
                videoId: "",
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                },
                events: {
                    onReady: stableOnReady,
                    onStateChange: stableOnStateChange,
                },
            },
        );

        return () => {
            if (onCleanup) onCleanup();
            if (playerInstance.current) {
                playerInstance.current.destroy();
                playerInstance.current = null;
            }
        };
    }, [isApiReady, stableOnReady, stableOnStateChange]);

    const play = useCallback(() => playerInstance.current?.playVideo(), []);
    const pause = useCallback(() => playerInstance.current?.pauseVideo(), []);
    const seekTo = useCallback(
        (seconds: number) => playerInstance.current?.seekTo(seconds, true),
        [],
    );
    const loadVideo = useCallback((id: string) => {
        if (playerInstance.current && id) {
            playerInstance.current.loadVideoById(id);
        }
    }, []);
    const cueVideo = useCallback((id: string) => {
        if (playerInstance.current && id) {
            playerInstance.current.cueVideoById(id);
        }
    }, []);

    return {
        playerContainerRef,
        playerInstance: playerInstance.current,
        play,
        pause,
        seekTo,
        loadVideo,
        cueVideo,
    };
}

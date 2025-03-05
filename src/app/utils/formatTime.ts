/**
 * Formats seconds into MM:SS time format.
 * @param seconds - Number of seconds to format.
 * @returns Formatted time string in MM:SS format.
 */
export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

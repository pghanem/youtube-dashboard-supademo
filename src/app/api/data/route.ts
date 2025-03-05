import { NextRequest, NextResponse } from "next/server";
import { getVideosData, PaginatedYouTubeVideosResponse } from "./utils";

/**
 * GET - Fetches a paginated list of videos based on the `page` and `limit` query parameters.
 *
 * @param {NextRequest} request - The request object containing pagination parameters.
 * @returns {NextResponse} - JSON response with video data or an error message.
 *
 * Defaults to `page=1` and `limit=10` if not provided. Returns a 500 error and empty results if data fetch fails.
 */
export async function GET(
    request: NextRequest,
): Promise<NextResponse<PaginatedYouTubeVideosResponse>> {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const data = await getVideosData(page, limit);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            {
                items: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
                error: "Failed to load data",
            },
            {
                status: 500,
            },
        );
    }
}

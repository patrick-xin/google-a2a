import { NextRequest, NextResponse } from "next/server";

import {
  processNewsArticles,
  refreshNewsFeed,
  getFirecrawlData,
  getTavilyData,
} from "@/lib/news-processing";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting scheduled news fetch job...");
    const startTime = Date.now();

    // Fetch data from both sources in parallel
    const [firecrawlData, tavilyData] = await Promise.allSettled([
      getFirecrawlData(),
      getTavilyData(),
    ]);

    // Handle potential API failures gracefully
    const firecrawlArticles =
      firecrawlData.status === "fulfilled" ? firecrawlData.value : [];
    const tavilyArticles =
      tavilyData.status === "fulfilled" ? tavilyData.value : [];

    if (firecrawlData.status === "rejected") {
      console.error("Firecrawl API failed:", firecrawlData.reason);
    }
    if (tavilyData.status === "rejected") {
      console.error("Tavily API failed:", tavilyData.reason);
    }

    // Process articles even if one API failed
    if (firecrawlArticles.length === 0 && tavilyArticles.length === 0) {
      throw new Error("Both APIs failed to return data");
    }

    // Process the articles
    const processingResult = await processNewsArticles(
      firecrawlArticles,
      tavilyArticles
    );
    console.log("Articles processed and saved to database");

    // Refresh the materialized view (critical for news feed to work)
    await refreshNewsFeed();

    const duration = Date.now() - startTime;
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      fetched: {
        firecrawl: firecrawlArticles.length,
        tavily: tavilyArticles.length,
        total: firecrawlArticles.length + tavilyArticles.length,
      },
      processed: {
        total_processed: processingResult.processed,
        duplicates_removed: processingResult.duplicates_removed,
        saved_to_db: processingResult.saved,
      },
      materialized_view_refreshed: true,
      errors: {
        firecrawl: firecrawlData.status === "rejected",
        tavily: tavilyData.status === "rejected",
      },
    };

    console.log("Cron job completed successfully:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Optional: Allow manual triggering in development
export async function POST(request: NextRequest) {
  // Only allow in development or with proper authentication
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Reuse the GET logic for manual triggers
  return GET(request);
}

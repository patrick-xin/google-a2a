News Aggregation App - Architecture Summary
Feature Overview
A public-facing news aggregation page that:

Fetches articles daily from Firecrawl API (search for "google a2a protocol")
Stores results in Supabase for performance and cost optimization
Handles inconsistent metadata across different news sources
Provides fast, paginated access for public users
Manages deduplication intelligently

Architecture Design

1. Separation of Concerns
Instead of fetching from external APIs on each page load, we separated into three layers:
```
Data Collection Layer → Storage Layer → Presentation Layer
(Scheduled Jobs)       (Supabase)      (Next.js App)
```

Scheduled Jobs: Daily cron jobs fetch from Firecrawl API
API Routes: Query Supabase, handle pagination, caching
News Page: Only fetches from internal APIs, not external services

2. Database Design
Core Table: news_articles

Deduplication: Uses SHA256 fingerprint (URL + title + domain)
Flexible Metadata: Stores both raw_data and extracted_data as JSONB
Quality Scoring: 0-1 scale based on data completeness
Engagement Tracking: Click counts, engagement scores
Smart Indexing: Multiple indexes for different query patterns

Key Features:

Generated columns for domain extraction and full-text search_vector
Handles missing published dates gracefully
Tracks both first_seen and last_seen for duplicate management

Performance Optimizations:

Materialized view (news_feed_ranked) for fast public queries
Composite relevance scoring (quality + engagement + recency)
Efficient pagination with get_news_feed() function
Strategic indexes for common query patterns

3. Handling Variable Metadata
Since articles don't always have consistent fields:

Store everything in raw_data JSONB
Extract what we can into extracted_data
Calculate quality_score based on data completeness
Use first_seen as fallback for missing publish dates
Provide sorting options (relevance, recency, quality)

4. Performance Strategy
Multi-Layer Caching:
```
CDN (5 min) → Redis (1 hour) → Database
```

Query Optimization:

Materialized view refreshed every 5 minutes
Indexes on all filter/sort columns
Pagination using cursor-based approach
Quality threshold filtering (> 0.3 by default)

Scalability Features:

Request coalescing for concurrent requests
Static generation with ISR for extremely high traffic
Efficient deduplication prevents data bloat
Engagement metrics improve relevance over time

5. User Experience
Public Page Features:

Fast loading with cached data
Multiple sort options (relevance, recent, quality)
Domain filtering
Quality indicators
Transparency about date accuracy

API Endpoints:
```GET /api/news?page=1&limit=20&sort=relevance&domain=example.com```

Key Benefits

Cost Effective: Minimizes external API calls
Performance: Sub-second response times for public users
Reliability: Works even if Firecrawl is down
Scalability: Handles high traffic with caching layers
Data Quality: Smart deduplication and quality scoring
Flexibility: Handles any metadata structure from various sources

Implementation Priority

Deploy database schema
Create API routes with caching
Update page to use internal API
Implement scheduled job for daily updates
Add monitoring and analytics
Optimize based on usage patterns

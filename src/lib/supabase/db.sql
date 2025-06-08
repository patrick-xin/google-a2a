-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create custom function to extract domain from URL
CREATE OR REPLACE FUNCTION extract_domain(url TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Handle null or empty URLs
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;
    
    -- Extract domain using regex
    -- This handles URLs with or without protocol
    RETURN LOWER(
        regexp_replace(
            regexp_replace(url, '^https?://(www\.)?', ''),  -- Remove protocol and www
            '/.*$', ''  -- Remove path
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Return null if extraction fails
        RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate recency score
CREATE OR REPLACE FUNCTION recency_score(timestamp_val TIMESTAMPTZ)
RETURNS DECIMAL AS $$
BEGIN
    -- Score from 0 to 1 based on age
    -- Articles from today get score 1, older articles decay
    RETURN GREATEST(
        0,
        1 - (EXTRACT(EPOCH FROM (NOW() - timestamp_val)) / (7 * 24 * 60 * 60))  -- Decay over 7 days
    );
END;
$$ LANGUAGE plpgsql STABLE; -- Changed to STABLE since it uses NOW()

-- Create function to generate fingerprint for deduplication
CREATE OR REPLACE FUNCTION generate_fingerprint(
    p_url TEXT,
    p_title TEXT,
    p_domain TEXT
)
RETURNS TEXT AS $$
DECLARE
    clean_url TEXT;
    clean_title TEXT;
    combined TEXT;
BEGIN
    -- Clean URL: remove query params and fragments
    clean_url := LOWER(regexp_replace(p_url, '[?#].*$', ''));
    
    -- Clean title: lowercase and trim
    clean_title := LOWER(TRIM(COALESCE(p_title, '')));
    
    -- Combine signals
    combined := COALESCE(clean_url, '') || '|' || 
                COALESCE(clean_title, '') || '|' || 
                COALESCE(p_domain, '');
    
    -- Generate SHA256 hash
    RETURN encode(digest(combined, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Main news articles table
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Deduplication
    fingerprint TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    
    -- Core content
    title TEXT NOT NULL,
    description TEXT,
    
    -- Flexible metadata storage
    raw_data JSONB NOT NULL DEFAULT '{}',
    extracted_data JSONB NOT NULL DEFAULT '{}',
    
    -- Quality and ranking metrics
    quality_score DECIMAL(3,2) DEFAULT 0.00 CHECK (quality_score >= 0 AND quality_score <= 1),
    click_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0.00 CHECK (engagement_score >= 0 AND engagement_score <= 1),
    source_reliability DECIMAL(3,2) DEFAULT 0.50 CHECK (source_reliability >= 0 AND source_reliability <= 1),
    
    -- Search metadata
    search_query TEXT,
    position_in_results INTEGER,
    
    -- Timestamps
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    extraction_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Computed/Generated columns
    domain TEXT GENERATED ALWAYS AS (extract_domain(url)) STORED,
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B')
    ) STORED,
    
    -- System timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_fingerprint ON news_articles(fingerprint);
CREATE INDEX idx_url ON news_articles(url);
CREATE INDEX idx_domain ON news_articles(domain);
CREATE INDEX idx_quality_score ON news_articles(quality_score DESC);
CREATE INDEX idx_first_seen ON news_articles(first_seen DESC);
CREATE INDEX idx_last_seen ON news_articles(last_seen DESC);
CREATE INDEX idx_engagement ON news_articles(engagement_score DESC);
CREATE INDEX idx_search_vector ON news_articles USING gin(search_vector);
CREATE INDEX idx_extracted_data ON news_articles USING gin(extracted_data);
CREATE INDEX idx_raw_data ON news_articles USING gin(raw_data);

-- Composite indexes for common queries
CREATE INDEX idx_quality_first_seen ON news_articles(quality_score DESC, first_seen DESC);
CREATE INDEX idx_domain_first_seen ON news_articles(domain, first_seen DESC);

-- Partial indexes for performance (without NOW() function)
CREATE INDEX idx_high_quality ON news_articles(first_seen DESC) 
    WHERE quality_score > 0.7;

-- For recent articles, we'll use a different approach
-- Create an index on first_seen and filter in queries
CREATE INDEX idx_first_seen_btree ON news_articles(first_seen DESC);

-- Table for tracking duplicate groups
CREATE TABLE duplicate_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_article_id UUID REFERENCES news_articles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking article relationships
CREATE TABLE article_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES news_articles(id),
    duplicate_group_id UUID REFERENCES duplicate_groups(id),
    similarity_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table for tracking user interactions
CREATE TABLE article_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES news_articles(id),
    event_type TEXT NOT NULL, -- 'view', 'click', 'share', etc.
    user_fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_article ON article_analytics(article_id);
CREATE INDEX idx_analytics_event ON article_analytics(event_type);
CREATE INDEX idx_analytics_created ON article_analytics(created_at DESC);

-- Materialized view for fast public page queries
CREATE MATERIALIZED VIEW news_feed_ranked AS
SELECT 
    a.id,
    a.url,
    a.title,
    a.description,
    a.domain,
    a.extracted_data,
    a.quality_score,
    a.engagement_score,
    a.first_seen,
    a.last_seen,
    -- Calculate composite relevance score
    (
        a.quality_score * 0.30 +
        a.engagement_score * 0.20 +
        GREATEST(0, 1 - (EXTRACT(EPOCH FROM (NOW() - a.first_seen)) / (7 * 24 * 60 * 60))) * 0.30 +
        a.source_reliability * 0.20
    ) AS relevance_score,
    -- Additional computed fields
    CASE 
        WHEN a.first_seen > NOW() - INTERVAL '1 hour' THEN 'breaking'
        WHEN a.first_seen > NOW() - INTERVAL '24 hours' THEN 'recent'
        WHEN a.first_seen > NOW() - INTERVAL '7 days' THEN 'this_week'
        ELSE 'older'
    END AS freshness_category,
    -- Extract common metadata fields if they exist
    a.extracted_data->>'published_date' AS published_date,
    a.extracted_data->>'author' AS author,
    a.extracted_data->>'image_url' AS image_url,
    a.extracted_data->'tags' AS tags
FROM news_articles a
WHERE a.quality_score > 0.3  -- Filter out low quality
WITH DATA;

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_mv_id ON news_feed_ranked(id);
CREATE INDEX idx_mv_relevance ON news_feed_ranked(relevance_score DESC);
CREATE INDEX idx_mv_freshness ON news_feed_ranked(freshness_category, relevance_score DESC);
CREATE INDEX idx_mv_domain_relevance ON news_feed_ranked(domain, relevance_score DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_news_feed()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY news_feed_ranked;
END;
$$ LANGUAGE plpgsql;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update engagement score based on analytics
CREATE OR REPLACE FUNCTION update_engagement_score(p_article_id UUID)
RETURNS void AS $$
DECLARE
    v_click_count INTEGER;
    v_view_count INTEGER;
    v_share_count INTEGER;
    v_engagement_score DECIMAL(3,2);
BEGIN
    -- Get interaction counts
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'click'),
        COUNT(*) FILTER (WHERE event_type = 'view'),
        COUNT(*) FILTER (WHERE event_type = 'share')
    INTO v_click_count, v_view_count, v_share_count
    FROM article_analytics
    WHERE article_id = p_article_id
        AND created_at > NOW() - INTERVAL '7 days';  -- Only recent interactions
    
    -- Calculate engagement score (adjust weights as needed)
    v_engagement_score := LEAST(1.0, (
        (v_click_count * 1.0) +
        (v_view_count * 0.1) +
        (v_share_count * 2.0)
    ) / 100.0);
    
    -- Update article
    UPDATE news_articles
    SET 
        click_count = v_click_count,
        engagement_score = v_engagement_score
    WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle article upsert with deduplication
CREATE OR REPLACE FUNCTION upsert_article(
    p_url TEXT,
    p_title TEXT,
    p_description TEXT,
    p_raw_data JSONB,
    p_extracted_data JSONB,
    p_quality_score DECIMAL,
    p_search_query TEXT,
    p_position INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_domain TEXT;
    v_fingerprint TEXT;
    v_article_id UUID;
BEGIN
    -- Extract domain
    v_domain := extract_domain(p_url);
    
    -- Generate fingerprint
    v_fingerprint := generate_fingerprint(p_url, p_title, v_domain);
    
    -- Upsert article
    INSERT INTO news_articles (
        fingerprint,
        url,
        title,
        description,
        raw_data,
        extracted_data,
        quality_score,
        search_query,
        position_in_results
    ) VALUES (
        v_fingerprint,
        p_url,
        p_title,
        p_description,
        p_raw_data,
        p_extracted_data,
        p_quality_score,
        p_search_query,
        p_position
    )
    ON CONFLICT (fingerprint) DO UPDATE
    SET
        last_seen = NOW(),
        position_in_results = EXCLUDED.position_in_results,
        -- Update quality score if it improved
        quality_score = GREATEST(news_articles.quality_score, EXCLUDED.quality_score),
        -- Merge extracted data
        extracted_data = news_articles.extracted_data || EXCLUDED.extracted_data
    RETURNING id INTO v_article_id;
    
    RETURN v_article_id;
END;
$$ LANGUAGE plpgsql;

-- Create database function for efficient pagination
CREATE OR REPLACE FUNCTION get_news_feed(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_min_quality DECIMAL DEFAULT 0.3,
    p_domain TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE (
    id UUID,
    url TEXT,
    title TEXT,
    description TEXT,
    domain TEXT,
    extracted_data JSONB,
    quality_score DECIMAL,
    relevance_score DECIMAL,
    first_seen TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_articles AS (
        SELECT *
        FROM news_feed_ranked nfr
        WHERE nfr.quality_score >= p_min_quality
            AND (p_domain IS NULL OR nfr.domain = p_domain)
    ),
    counted_articles AS (
        SELECT *, COUNT(*) OVER() AS total_count
        FROM filtered_articles
    )
    SELECT 
        ca.id,
        ca.url,
        ca.title,
        ca.description,
        ca.domain,
        ca.extracted_data,
        ca.quality_score,
        ca.relevance_score,
        ca.first_seen,
        ca.total_count
    FROM counted_articles ca
    ORDER BY 
        CASE p_sort_by
            WHEN 'relevance' THEN ca.relevance_score
            WHEN 'quality' THEN ca.quality_score
            WHEN 'recent' THEN EXTRACT(EPOCH FROM ca.first_seen)
            ELSE ca.relevance_score
        END DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get recent articles (replaces the partial index)
CREATE OR REPLACE FUNCTION get_recent_articles(
    p_days INTEGER DEFAULT 7,
    p_limit INTEGER DEFAULT 100
)
RETURNS SETOF news_articles AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM news_articles
    WHERE first_seen > NOW() - (p_days || ' days')::INTERVAL
    ORDER BY first_seen DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create index to support the above function
CREATE INDEX idx_recent_lookup ON news_articles(first_seen DESC);

-- Create scheduled job for refreshing materialized view (using pg_cron if available)
-- Note: pg_cron needs to be enabled separately
-- SELECT cron.schedule('refresh-news-feed', '*/5 * * * *', 'SELECT refresh_news_feed();');

-- Grant appropriate permissions (adjust based on your users)
-- GRANT SELECT ON news_feed_ranked TO web_user;
-- GRANT SELECT, INSERT, UPDATE ON news_articles TO app_user;
-- GRANT EXECUTE ON FUNCTION get_news_feed TO web_user;
-- GRANT EXECUTE ON FUNCTION upsert_article TO app_user;
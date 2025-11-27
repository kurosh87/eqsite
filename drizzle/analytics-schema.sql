-- Revenue Analytics Schema for aerobase.app

-- Daily revenue aggregation table
CREATE TABLE IF NOT EXISTS daily_revenue_rollup (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,

    -- Affiliate metrics
    affiliate_clicks INTEGER DEFAULT 0,
    affiliate_conversions INTEGER DEFAULT 0,
    affiliate_revenue DECIMAL(10,2) DEFAULT 0,
    affiliate_ctr DECIMAL(5,2) DEFAULT 0,
    affiliate_conversion_rate DECIMAL(5,2) DEFAULT 0,

    -- Subscription metrics
    new_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,
    mrr DECIMAL(10,2) DEFAULT 0,
    arr DECIMAL(10,2) DEFAULT 0,
    active_subscribers INTEGER DEFAULT 0,
    trial_conversions INTEGER DEFAULT 0,

    -- Advertising metrics
    ad_impressions INTEGER DEFAULT 0,
    ad_clicks INTEGER DEFAULT 0,
    ad_revenue DECIMAL(10,2) DEFAULT 0,
    rpm DECIMAL(10,2) DEFAULT 0,
    cpm DECIMAL(10,2) DEFAULT 0,

    -- Overall metrics
    total_revenue DECIMAL(10,2) DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    route_id INTEGER,
    partner TEXT NOT NULL, -- 'booking', 'expedia', 'kayak'
    click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conversion_timestamp TIMESTAMP,
    converted BOOLEAN DEFAULT FALSE,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    device_type TEXT,
    country TEXT,
    referrer TEXT,
    session_id TEXT
);

-- Subscription events
CREATE TABLE IF NOT EXISTS subscription_events (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'trial_start', 'trial_convert', 'subscribe', 'upgrade', 'downgrade', 'churn'
    tier TEXT NOT NULL, -- 'free', 'explorer', 'traveler', 'globetrotter'
    previous_tier TEXT,
    mrr_change DECIMAL(10,2) DEFAULT 0,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Advertising impressions
CREATE TABLE IF NOT EXISTS ad_impressions (
    id SERIAL PRIMARY KEY,
    placement TEXT NOT NULL, -- 'search_results', 'route_details', 'sidebar'
    impressions INTEGER DEFAULT 1,
    clicks INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    device_type TEXT,
    page_url TEXT,
    user_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User cohorts
CREATE TABLE IF NOT EXISTS user_cohorts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    signup_date DATE NOT NULL,
    cohort_month TEXT NOT NULL, -- 'YYYY-MM'
    first_subscription_date DATE,
    first_affiliate_click_date DATE,
    total_lifetime_value DECIMAL(10,2) DEFAULT 0,
    acquisition_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_rollup_date ON daily_revenue_rollup(date DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_timestamp ON affiliate_clicks(click_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner ON affiliate_clicks(partner);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_timestamp ON subscription_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_placement ON ad_impressions(placement);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_timestamp ON ad_impressions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cohorts_month ON user_cohorts(cohort_month);
CREATE INDEX IF NOT EXISTS idx_cohorts_signup ON user_cohorts(signup_date);

-- Function to update daily rollup
CREATE OR REPLACE FUNCTION update_daily_rollup()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called by triggers on affiliate_clicks, subscription_events, ad_impressions
    -- to keep daily_revenue_rollup up to date
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

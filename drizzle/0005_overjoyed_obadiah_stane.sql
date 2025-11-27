-- Add missing tables and columns required by database.ts

-- Create pgvector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Geographic tags table for regional classification
CREATE TABLE IF NOT EXISTS "geographic_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phenotype_id" uuid NOT NULL,
	"region" text NOT NULL,
	"country" text,
	"confidence" numeric(3,2) DEFAULT 1.0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Phenotype hierarchy table for relationships
CREATE TABLE IF NOT EXISTS "phenotype_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"strength" numeric(3,2) DEFAULT 1.0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add search_vector column to phenotypes if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'phenotypes' AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE "phenotypes" ADD COLUMN "search_vector" tsvector;
    END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'geographic_tags_phenotype_id_phenotypes_id_fk'
    ) THEN
        ALTER TABLE "geographic_tags"
        ADD CONSTRAINT "geographic_tags_phenotype_id_phenotypes_id_fk"
        FOREIGN KEY ("phenotype_id") REFERENCES "public"."phenotypes"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'phenotype_hierarchy_parent_id_phenotypes_id_fk'
    ) THEN
        ALTER TABLE "phenotype_hierarchy"
        ADD CONSTRAINT "phenotype_hierarchy_parent_id_phenotypes_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."phenotypes"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'phenotype_hierarchy_child_id_phenotypes_id_fk'
    ) THEN
        ALTER TABLE "phenotype_hierarchy"
        ADD CONSTRAINT "phenotype_hierarchy_child_id_phenotypes_id_fk"
        FOREIGN KEY ("child_id") REFERENCES "public"."phenotypes"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "geographic_tags_phenotype_id_idx" ON "geographic_tags"("phenotype_id");
CREATE INDEX IF NOT EXISTS "geographic_tags_region_idx" ON "geographic_tags"("region");
CREATE INDEX IF NOT EXISTS "phenotype_hierarchy_parent_id_idx" ON "phenotype_hierarchy"("parent_id");
CREATE INDEX IF NOT EXISTS "phenotype_hierarchy_child_id_idx" ON "phenotype_hierarchy"("child_id");
CREATE INDEX IF NOT EXISTS "phenotypes_search_vector_idx" ON "phenotypes" USING GIN("search_vector");

-- Update search_vector whenever phenotype name or description changes
CREATE OR REPLACE FUNCTION update_phenotype_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS phenotype_search_vector_update ON "phenotypes";
CREATE TRIGGER phenotype_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description
    ON "phenotypes"
    FOR EACH ROW
    EXECUTE FUNCTION update_phenotype_search_vector();

-- Create get_phenotype_tree function for hierarchy traversal
CREATE OR REPLACE FUNCTION get_phenotype_tree(root_name text)
RETURNS TABLE (
    id uuid,
    name text,
    parent_id uuid,
    level integer
) AS $$
WITH RECURSIVE phenotype_tree AS (
    -- Base case: find the root phenotype
    SELECT
        p.id,
        p.name,
        NULL::uuid as parent_id,
        0 as level
    FROM phenotypes p
    WHERE p.name = root_name

    UNION ALL

    -- Recursive case: find children
    SELECT
        p.id,
        p.name,
        ph.parent_id,
        pt.level + 1
    FROM phenotypes p
    JOIN phenotype_hierarchy ph ON p.id = ph.child_id
    JOIN phenotype_tree pt ON ph.parent_id = pt.id
)
SELECT * FROM phenotype_tree;
$$ LANGUAGE sql;

-- Create materialized view for phenotype network analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_phenotype_network" AS
SELECT
    p.id as phenotype_id,
    p.name as phenotype_name,
    p.image_url,
    COALESCE(p.metadata->>'connection_score', '0')::numeric as connection_score,
    COUNT(DISTINCT ph.child_id) as related_count,
    COUNT(DISTINCT gt.region) as similar_count,
    COALESCE((p.metadata->>'is_basic')::boolean, false) as is_basic
FROM phenotypes p
LEFT JOIN phenotype_hierarchy ph ON p.id = ph.parent_id
LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
GROUP BY p.id, p.name, p.image_url, p.metadata
ORDER BY connection_score DESC;

CREATE UNIQUE INDEX IF NOT EXISTS "mv_phenotype_network_phenotype_id_idx"
ON "mv_phenotype_network"(phenotype_id);

-- Create materialized views for regional phenotypes
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_african_phenotypes" AS
SELECT DISTINCT
    p.id as phenotype_id,
    p.name as phenotype_name,
    p.image_url,
    p.description,
    ARRAY_AGG(DISTINCT gt.region) as regions
FROM phenotypes p
JOIN geographic_tags gt ON p.id = gt.phenotype_id
WHERE gt.region = 'Africa'
GROUP BY p.id, p.name, p.image_url, p.description
ORDER BY p.name;

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_european_phenotypes" AS
SELECT DISTINCT
    p.id as phenotype_id,
    p.name as phenotype_name,
    p.image_url,
    p.description,
    ARRAY_AGG(DISTINCT gt.region) as regions
FROM phenotypes p
JOIN geographic_tags gt ON p.id = gt.phenotype_id
WHERE gt.region = 'Europe'
GROUP BY p.id, p.name, p.image_url, p.description
ORDER BY p.name;

CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_asian_phenotypes" AS
SELECT DISTINCT
    p.id as phenotype_id,
    p.name as phenotype_name,
    p.image_url,
    p.description,
    ARRAY_AGG(DISTINCT gt.region) as regions
FROM phenotypes p
JOIN geographic_tags gt ON p.id = gt.phenotype_id
WHERE gt.region = 'Asia'
GROUP BY p.id, p.name, p.image_url, p.description
ORDER BY p.name;

-- Refresh materialized views (run this periodically or after data updates)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_phenotype_network;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_african_phenotypes;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_european_phenotypes;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_asian_phenotypes;

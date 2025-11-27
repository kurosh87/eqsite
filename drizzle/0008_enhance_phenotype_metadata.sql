-- Synchronise phenotype metadata, supporting tables, and indexes.

BEGIN;

-- 1. Ensure "(proper)" base phenotypes inherit metadata from their canonical entries.
WITH source_metadata AS (
    SELECT
        child.id AS phenotype_id,
        parent.metadata
    FROM phenotypes AS child
    JOIN phenotypes AS parent
      ON regexp_replace(child.name, '\\s*\\(proper\\)$', '') = parent.name
    WHERE child.name IN (
        'Dinarid(proper)',
        'Pacifid(proper)',
        'Patagonid(proper)',
        'Sudanid(proper)'
    )
      AND (child.metadata IS NULL OR child.metadata::text = '{}'::text)
      AND parent.metadata IS NOT NULL
)
UPDATE phenotypes AS target
SET metadata = source_metadata.metadata
FROM source_metadata
WHERE target.id = source_metadata.phenotype_id;

-- 2. Provide a minimal fallback metadata block if anything is still empty.
UPDATE phenotypes
SET metadata = jsonb_build_object(
      'category', 'basic',
      'is_basic', true,
      'parent_groups', jsonb_build_array(regexp_replace(name, '\\s*\\(proper\\)$', '')),
      'related_count', 0,
      'similar_count', 0,
      'connection_score', 0,
      'total_connections', 0
    )
WHERE name IN (
        'Dinarid(proper)',
        'Pacifid(proper)',
        'Patagonid(proper)',
        'Sudanid(proper)'
    )
  AND (metadata IS NULL OR metadata::text = '{}'::text);

-- 3. Deduplicate hierarchy relationships before adding a uniqueness constraint.
DELETE FROM phenotype_hierarchy AS a
USING phenotype_hierarchy AS b
WHERE a.ctid < b.ctid
  AND a.parent_id = b.parent_id
  AND a.child_id = b.child_id
  AND COALESCE(a.relationship_type, '') = COALESCE(b.relationship_type, '');

CREATE UNIQUE INDEX IF NOT EXISTS phenotype_hierarchy_parent_child_type_idx
    ON phenotype_hierarchy (parent_id, child_id, COALESCE(relationship_type, ''));

-- 4. Replace legacy search vector index with the canonical definition.
DROP INDEX IF EXISTS idx_phenotypes_search_vector;

-- 5. Maintain bi-directional similarity data sourced from the hierarchy.
DELETE FROM similar_phenotypes AS a
USING similar_phenotypes AS b
WHERE a.ctid < b.ctid
  AND a.phenotype_id = b.phenotype_id
  AND a.similar_phenotype_id = b.similar_phenotype_id;

CREATE UNIQUE INDEX IF NOT EXISTS similar_phenotypes_pair_idx
    ON similar_phenotypes (phenotype_id, similar_phenotype_id);

INSERT INTO similar_phenotypes (id, phenotype_id, similar_phenotype_id, created_at)
SELECT gen_random_uuid(), parent_id, child_id, NOW()
FROM phenotype_hierarchy
WHERE relationship_type = 'similar'
ON CONFLICT (phenotype_id, similar_phenotype_id) DO NOTHING;

INSERT INTO similar_phenotypes (id, phenotype_id, similar_phenotype_id, created_at)
SELECT gen_random_uuid(), child_id, parent_id, NOW()
FROM phenotype_hierarchy
WHERE relationship_type = 'similar'
ON CONFLICT (phenotype_id, similar_phenotype_id) DO NOTHING;

-- 6. Seed phenotype_content with basic summaries when missing.
INSERT INTO phenotype_content (
    id,
    phenotype_id,
    content_type,
    title,
    content,
    metadata,
    citations,
    media_urls,
    "order",
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    p.id,
    'summary',
    p.name,
    COALESCE(p.description, ''),
    jsonb_build_object('source', 'phenotypes.description'),
    '[]'::jsonb,
    '[]'::jsonb,
    0,
    NOW(),
    NOW()
FROM phenotypes AS p
WHERE NOT EXISTS (
    SELECT 1 FROM phenotype_content pc WHERE pc.phenotype_id = p.id
);

-- 7. Add covering indexes to accelerate dashboard queries.
CREATE INDEX IF NOT EXISTS analysis_history_user_created_idx
    ON analysis_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_uploads_user_created_idx
    ON user_uploads (user_id, created_at DESC);

-- 8. Refresh planner statistics for the touched tables.
ANALYZE phenotypes;
ANALYZE phenotype_hierarchy;
ANALYZE similar_phenotypes;
ANALYZE phenotype_content;
ANALYZE analysis_history;
ANALYZE user_uploads;

COMMIT;

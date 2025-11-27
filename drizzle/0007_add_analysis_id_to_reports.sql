-- Migration: Link reports to originating analysis history
-- Purpose: Ensure each report references its source analysis

ALTER TABLE "reports"
ADD COLUMN IF NOT EXISTS "analysis_id" uuid;

-- Backfill existing rows by pairing reports with the closest analysis for the same upload
WITH ranked_matches AS (
  SELECT
    r.id AS report_id,
    ah.id AS analysis_id,
    ROW_NUMBER() OVER (
      PARTITION BY r.id
      ORDER BY ABS(EXTRACT(EPOCH FROM (r.generated_at - ah.created_at))) ASC
    ) AS rn
  FROM reports r
  JOIN analysis_history ah
    ON ah.user_id = r.user_id
   AND ah.upload_id = r.upload_id
)
UPDATE reports r
SET analysis_id = ranked_matches.analysis_id
FROM ranked_matches
WHERE r.id = ranked_matches.report_id
  AND ranked_matches.rn = 1
  AND r.analysis_id IS NULL;

ALTER TABLE "reports"
ALTER COLUMN "analysis_id" SET NOT NULL;

ALTER TABLE "reports"
ADD CONSTRAINT "reports_analysis_id_fk"
FOREIGN KEY ("analysis_id")
REFERENCES "analysis_history"("id")
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "reports_analysis_id_idx"
  ON "reports" ("analysis_id");

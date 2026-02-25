-- DATA MIGRATION: Convert existing HTML content to plain text before dropping columns
-- Use plain_text (already extracted) as the new content
UPDATE notes SET
  content = plain_text,
  title = CASE
    WHEN plain_text = '' THEN 'Untitled'
    WHEN position(E'\n' IN plain_text) > 0
      THEN left(plain_text, position(E'\n' IN plain_text) - 1)
    ELSE left(plain_text, 500)
  END;

-- Drop note_tags join table
DROP TABLE "note_tags";

-- Drop tags table
DROP TABLE "tags";

-- Drop images table
DROP TABLE "images";

-- Drop plain_text column from notes
ALTER TABLE "notes" DROP COLUMN "plain_text";

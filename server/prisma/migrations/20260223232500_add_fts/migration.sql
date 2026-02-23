-- Add tsvector column to notes table
ALTER TABLE notes ADD COLUMN search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX notes_search_vector_idx ON notes USING gin(search_vector);

-- search_vector is updated via application code in notes.service.ts
-- (trigger approach was removed due to Prisma ORM compatibility issues)

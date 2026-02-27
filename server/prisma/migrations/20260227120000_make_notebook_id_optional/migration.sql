-- AlterTable: make notebook_id optional so notes can exist at root level
ALTER TABLE "notes" ALTER COLUMN "notebook_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "scratchpads" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scratchpads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scratchpads_user_id_key" ON "scratchpads"("user_id");

-- AddForeignKey
ALTER TABLE "scratchpads" ADD CONSTRAINT "scratchpads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

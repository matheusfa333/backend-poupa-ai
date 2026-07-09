-- CreateTable
CREATE TABLE "pluggy_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "connectorId" INTEGER,
    "bankName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPDATED',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pluggy_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pluggy_item_itemId_key" ON "pluggy_item"("itemId");

-- CreateIndex
CREATE INDEX "pluggy_item_userId_idx" ON "pluggy_item"("userId");

-- AddForeignKey
ALTER TABLE "pluggy_item" ADD CONSTRAINT "pluggy_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

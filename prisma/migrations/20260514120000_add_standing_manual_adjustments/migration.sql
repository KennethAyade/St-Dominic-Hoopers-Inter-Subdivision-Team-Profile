ALTER TABLE "Standing"
ADD COLUMN "manualWinsDelta" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "manualLossesDelta" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "manualPointsDelta" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "manualScoreDifferenceDelta" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "manualRankOverride" INTEGER;

CREATE INDEX "Standing_categoryId_teamName_idx" ON "Standing"("categoryId", "teamName");

-- AlterTable
ALTER TABLE "hero_images" ADD COLUMN "overlayBackgroundColor" TEXT DEFAULT '#000000';
ALTER TABLE "hero_images" ADD COLUMN "overlayBackgroundOpacity" REAL DEFAULT 0.5;
ALTER TABLE "hero_images" ADD COLUMN "overlayPosition" TEXT DEFAULT 'center';
ALTER TABLE "hero_images" ADD COLUMN "overlaySubtitle" TEXT;
ALTER TABLE "hero_images" ADD COLUMN "overlaySubtitleColor" TEXT DEFAULT '#ffffff';
ALTER TABLE "hero_images" ADD COLUMN "overlayTitle" TEXT;
ALTER TABLE "hero_images" ADD COLUMN "overlayTitleColor" TEXT DEFAULT '#ffffff';

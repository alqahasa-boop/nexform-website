-- AlterTable
ALTER TABLE "advertisement_campaign_placements" ADD COLUMN     "deviceTargeting" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "listingPackageId" TEXT,
ADD COLUMN     "packageExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "styleId" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "ctaLabel" TEXT,
ADD COLUMN     "ctaUrl" TEXT,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "company_listing_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER,
    "price" DECIMAL(12,2),
    "maxFeaturedSlots" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_listing_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_featured_idx" ON "projects"("featured");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_listingPackageId_fkey" FOREIGN KEY ("listingPackageId") REFERENCES "company_listing_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

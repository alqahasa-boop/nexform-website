-- CreateEnum
CREATE TYPE "AiConceptKind" AS ENUM ('INTERIOR', 'EXTERIOR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AiModuleKey" ADD VALUE 'INTERIOR_DESIGNER';
ALTER TYPE "AiModuleKey" ADD VALUE 'EXTERIOR_DESIGNER';
ALTER TYPE "AiModuleKey" ADD VALUE 'COMPANY_MATCHING';

-- CreateTable
CREATE TABLE "ai_generated_concepts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "conversationId" TEXT,
    "kind" "AiConceptKind" NOT NULL,
    "status" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "roomType" TEXT,
    "propertyType" TEXT,
    "dimensions" JSONB,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "styleNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inputData" JSONB NOT NULL,
    "generatedText" TEXT,
    "facadeUploadedFileId" TEXT,
    "inspirationDesignIdeaIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "convertedToDesignRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generated_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_generated_concepts_userId_idx" ON "ai_generated_concepts"("userId");

-- CreateIndex
CREATE INDEX "ai_generated_concepts_guestSessionId_idx" ON "ai_generated_concepts"("guestSessionId");

-- CreateIndex
CREATE INDEX "ai_generated_concepts_kind_idx" ON "ai_generated_concepts"("kind");

-- AddForeignKey
ALTER TABLE "ai_generated_concepts" ADD CONSTRAINT "ai_generated_concepts_facadeUploadedFileId_fkey" FOREIGN KEY ("facadeUploadedFileId") REFERENCES "ai_uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generated_concepts" ADD CONSTRAINT "ai_generated_concepts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

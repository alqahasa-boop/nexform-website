-- CreateEnum
CREATE TYPE "AiModuleKey" AS ENUM ('GENERAL_CHAT', 'CONSTRUCTION_ADVISOR', 'BUILD_JOURNEY_ASSISTANT', 'DOCUMENT_AI', 'IMAGE_AI', 'KNOWLEDGE_SEARCH');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AiFileKind" AS ENUM ('DOCUMENT', 'IMAGE');

-- CreateEnum
CREATE TYPE "AiAnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED', 'NOT_CONFIGURED');

-- CreateEnum
CREATE TYPE "AiProviderKey" AS ENUM ('OPENAI', 'ANTHROPIC');

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "module" "AiModuleKey" NOT NULL,
    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "providerKey" "AiProviderKey",
    "model" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_uploaded_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "conversationId" TEXT,
    "kind" "AiFileKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "extractedText" TEXT,
    "analysisStatus" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisResult" JSONB,
    "analysisError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_user_workspaces" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoriteStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "constructionStage" TEXT,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "ideas" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_user_workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_knowledge_chunks" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "embeddingModel" TEXT,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_search_cache" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "resultsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_search_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "module" "AiModuleKey" NOT NULL,
    "providerKey" "AiProviderKey",
    "model" TEXT,
    "promptPreview" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "latencyMs" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompt_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_module_settings" (
    "id" TEXT NOT NULL,
    "module" "AiModuleKey" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_module_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_guestSessionId_idx" ON "ai_conversations"("guestSessionId");

-- CreateIndex
CREATE INDEX "ai_conversations_module_idx" ON "ai_conversations"("module");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_idx" ON "ai_messages"("conversationId");

-- CreateIndex
CREATE INDEX "ai_uploaded_files_userId_idx" ON "ai_uploaded_files"("userId");

-- CreateIndex
CREATE INDEX "ai_uploaded_files_conversationId_idx" ON "ai_uploaded_files"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_user_workspaces_userId_key" ON "ai_user_workspaces"("userId");

-- CreateIndex
CREATE INDEX "ai_knowledge_chunks_entityType_entityId_idx" ON "ai_knowledge_chunks"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_knowledge_chunks_entityType_entityId_language_chunkIndex_key" ON "ai_knowledge_chunks"("entityType", "entityId", "language", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ai_search_cache_queryHash_key" ON "ai_search_cache"("queryHash");

-- CreateIndex
CREATE INDEX "ai_prompt_logs_module_idx" ON "ai_prompt_logs"("module");

-- CreateIndex
CREATE INDEX "ai_prompt_logs_createdAt_idx" ON "ai_prompt_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_module_settings_module_key" ON "ai_module_settings"("module");

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_uploaded_files" ADD CONSTRAINT "ai_uploaded_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_uploaded_files" ADD CONSTRAINT "ai_uploaded_files_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_user_workspaces" ADD CONSTRAINT "ai_user_workspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompt_logs" ADD CONSTRAINT "ai_prompt_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

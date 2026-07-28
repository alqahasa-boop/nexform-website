-- CreateEnum
CREATE TYPE "SystemRoleKey" AS ENUM ('GUEST', 'CUSTOMER', 'EDITOR', 'DESIGN_MANAGER', 'ADVERTISING_MANAGER', 'ANALYST', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ARTICLE', 'PAGE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('ARTICLE', 'PROJECT', 'DESIGN_IDEA', 'SERVICE', 'COMPANY');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'PDF', 'DOCUMENT', 'VIDEO');

-- CreateEnum
CREATE TYPE "DesignCategory" AS ENUM ('GENERAL', 'FACADE', 'INTERIOR', 'COMMERCIAL_BOOTH');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'DESIGN_REQUEST', 'CONTACT_MESSAGE', 'CONTENT', 'SECURITY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'SESSION_START', 'CONTENT_VIEW', 'DOWNLOAD', 'SEARCH_QUERY', 'COMPANY_PROFILE_VIEW', 'AD_IMPRESSION', 'AD_CLICK', 'WHATSAPP_CLICK', 'CONTACT_CLICK', 'DESIGN_SAVE', 'DESIGN_SHARE', 'DESIGN_REQUEST_CONVERSION', 'CONTACT_SUBMIT');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'PUBLISH', 'ARCHIVE', 'UPLOAD', 'DOWNLOAD', 'APPROVE', 'REJECT', 'ASSIGN', 'PERMISSION_CHANGE', 'SETTINGS_CHANGE');

-- CreateEnum
CREATE TYPE "DesignRequestStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER_INFO', 'ACCEPTED', 'IN_PROGRESS', 'DRAFT_READY', 'REVISION_REQUESTED', 'FINAL_READY', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DesignRequestImageRole" AS ENUM ('ROOM_PHOTO', 'REFERENCE', 'FINAL_DESIGN', 'FINAL_FILE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GOVERNMENT', 'BANK_FINANCE', 'PDF_GUIDE', 'ENGINEERING_MANUAL', 'CHECKLIST', 'FORM', 'REGULATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PricingDisplay" AS ENUM ('HIDDEN', 'FIXED', 'STARTING_AT', 'CONTACT_FOR_QUOTE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "phone" TEXT,
    "image" TEXT,
    "passwordHash" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" "SystemRoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagged_items" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tagged_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "styles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "categoryId" TEXT,
    "coverImageId" TEXT,
    "authorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "updatedById" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_relations" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "relatedContentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "content_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_journey_stages" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "richContent" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_journey_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_journey_stage_files" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "construction_journey_stage_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_journey_stage_companies" (
    "stageId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "construction_journey_stage_companies_pkey" PRIMARY KEY ("stageId","companyId")
);

-- CreateTable
CREATE TABLE "construction_journey_stage_ads" (
    "stageId" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,

    CONSTRAINT "construction_journey_stage_ads_pkey" PRIMARY KEY ("stageId","creativeId")
);

-- CreateTable
CREATE TABLE "construction_journey_stage_faqs" (
    "stageId" TEXT NOT NULL,
    "faqItemId" TEXT NOT NULL,

    CONSTRAINT "construction_journey_stage_faqs_pkey" PRIMARY KEY ("stageId","faqItemId")
);

-- CreateTable
CREATE TABLE "construction_library_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_library_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_library_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "version" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "sourceOrganization" TEXT,
    "sourceUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "fileId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_library_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_library_relations" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "relatedItemId" TEXT NOT NULL,

    CONSTRAINT "construction_library_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_ideas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "designCategory" "DesignCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "roomType" TEXT,
    "areaSqm" DECIMAL(10,2),
    "dimensions" JSONB,
    "floorCount" INTEGER,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "designerId" TEXT,
    "designerName" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "coverImageId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_idea_gallery_items" (
    "id" TEXT NOT NULL,
    "designIdeaId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "design_idea_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_idea_styles" (
    "designIdeaId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,

    CONSTRAINT "design_idea_styles_pkey" PRIMARY KEY ("designIdeaId","styleId")
);

-- CreateTable
CREATE TABLE "design_idea_saves" (
    "id" TEXT NOT NULL,
    "designIdeaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_idea_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "projectType" TEXT,
    "location" TEXT,
    "areaSqm" DECIMAL(10,2),
    "completionDate" TIMESTAMP(3),
    "categoryId" TEXT,
    "coverImageId" TEXT,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_gallery_items" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_team_members" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleLabel" TEXT,

    CONSTRAINT "project_team_members_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "translationGroupId" TEXT NOT NULL,
    "pricingDisplay" "PricingDisplay" NOT NULL DEFAULT 'CONTACT_FOR_QUOTE',
    "price" DECIMAL(12,2),
    "isRequestable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "coverImageId" TEXT,
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_asset_tags" (
    "mediaAssetId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "media_asset_tags_pkey" PRIMARY KEY ("mediaAssetId","tagId")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "replacedById" TEXT,
    "folderId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_usages" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "workingHours" JSONB,
    "socialLinks" JSONB,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "contactClicks" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "logoId" TEXT,
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_categories" (
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "company_categories_pkey" PRIMARY KEY ("companyId","categoryId")
);

-- CreateTable
CREATE TABLE "company_gallery_items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "company_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "recommendedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER,
    "price" DECIMAL(12,2),
    "maxPlacements" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisement_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_placements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageContext" TEXT,
    "recommendedWidth" INTEGER,
    "recommendedHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisement_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "packageId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "billingReferenceId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisement_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_creatives" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageId" TEXT,
    "targetUrl" TEXT,
    "whatsappNumber" TEXT,
    "callToAction" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisement_creatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_campaign_placements" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,

    CONSTRAINT "advertisement_campaign_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "status" "DesignRequestStatus" NOT NULL DEFAULT 'NEW',
    "priority" "RequestPriority" NOT NULL DEFAULT 'NORMAL',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "customerId" TEXT,
    "serviceId" TEXT,
    "propertyType" TEXT,
    "roomType" TEXT,
    "measurements" JSONB,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "notes" TEXT,
    "assignedToId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_request_styles" (
    "designRequestId" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,

    CONSTRAINT "design_request_styles_pkey" PRIMARY KEY ("designRequestId","styleId")
);

-- CreateTable
CREATE TABLE "design_request_images" (
    "id" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "role" "DesignRequestImageRole" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_request_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_request_status_history" (
    "id" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    "fromStatus" "DesignRequestStatus",
    "toStatus" "DesignRequestStatus" NOT NULL,
    "note" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_request_messages" (
    "id" TEXT NOT NULL,
    "designRequestId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_request_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "assignedToId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_message_replies" (
    "id" TEXT NOT NULL,
    "contactMessageId" TEXT NOT NULL,
    "repliedById" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_message_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_notes" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "templateKey" TEXT,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_meta" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "ogImage" TEXT,
    "twitterCard" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "sitemapPriority" DOUBLE PRECISION,
    "sitemapChangeFreq" TEXT,
    "structuredData" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "path" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "searchQuery" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_type_deletedAt_idx" ON "categories"("type", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_type_slug_key" ON "categories"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tagged_items_entityType_entityId_idx" ON "tagged_items"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "tagged_items_tagId_entityType_entityId_key" ON "tagged_items"("tagId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "styles_name_key" ON "styles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "styles_slug_key" ON "styles"("slug");

-- CreateIndex
CREATE INDEX "content_categoryId_idx" ON "content"("categoryId");

-- CreateIndex
CREATE INDEX "content_authorId_idx" ON "content"("authorId");

-- CreateIndex
CREATE INDEX "content_status_language_idx" ON "content"("status", "language");

-- CreateIndex
CREATE INDEX "content_translationGroupId_idx" ON "content"("translationGroupId");

-- CreateIndex
CREATE INDEX "content_contentType_status_visibility_idx" ON "content"("contentType", "status", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "content_contentType_language_slug_key" ON "content"("contentType", "language", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_relations_contentId_relatedContentId_key" ON "content_relations"("contentId", "relatedContentId");

-- CreateIndex
CREATE INDEX "content_revisions_entityType_entityId_idx" ON "content_revisions"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_entityType_entityId_version_key" ON "content_revisions"("entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "construction_journey_stages_order_idx" ON "construction_journey_stages"("order");

-- CreateIndex
CREATE INDEX "construction_journey_stages_language_idx" ON "construction_journey_stages"("language");

-- CreateIndex
CREATE INDEX "construction_journey_stages_parentId_idx" ON "construction_journey_stages"("parentId");

-- CreateIndex
CREATE INDEX "construction_journey_stages_translationGroupId_idx" ON "construction_journey_stages"("translationGroupId");

-- CreateIndex
CREATE INDEX "construction_journey_stage_files_stageId_idx" ON "construction_journey_stage_files"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "construction_journey_stage_files_stageId_mediaAssetId_key" ON "construction_journey_stage_files"("stageId", "mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "construction_library_categories_slug_key" ON "construction_library_categories"("slug");

-- CreateIndex
CREATE INDEX "construction_library_items_categoryId_idx" ON "construction_library_items"("categoryId");

-- CreateIndex
CREATE INDEX "construction_library_items_documentType_idx" ON "construction_library_items"("documentType");

-- CreateIndex
CREATE INDEX "construction_library_items_translationGroupId_idx" ON "construction_library_items"("translationGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "construction_library_relations_itemId_relatedItemId_key" ON "construction_library_relations"("itemId", "relatedItemId");

-- CreateIndex
CREATE INDEX "faq_items_category_idx" ON "faq_items"("category");

-- CreateIndex
CREATE INDEX "faq_items_language_idx" ON "faq_items"("language");

-- CreateIndex
CREATE INDEX "design_ideas_designCategory_idx" ON "design_ideas"("designCategory");

-- CreateIndex
CREATE INDEX "design_ideas_categoryId_idx" ON "design_ideas"("categoryId");

-- CreateIndex
CREATE INDEX "design_ideas_status_language_visibility_idx" ON "design_ideas"("status", "language", "visibility");

-- CreateIndex
CREATE INDEX "design_ideas_translationGroupId_idx" ON "design_ideas"("translationGroupId");

-- CreateIndex
CREATE INDEX "design_ideas_featured_idx" ON "design_ideas"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "design_ideas_language_slug_key" ON "design_ideas"("language", "slug");

-- CreateIndex
CREATE INDEX "design_idea_gallery_items_designIdeaId_idx" ON "design_idea_gallery_items"("designIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "design_idea_gallery_items_designIdeaId_mediaAssetId_key" ON "design_idea_gallery_items"("designIdeaId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "design_idea_saves_userId_idx" ON "design_idea_saves"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "design_idea_saves_designIdeaId_userId_key" ON "design_idea_saves"("designIdeaId", "userId");

-- CreateIndex
CREATE INDEX "projects_categoryId_idx" ON "projects"("categoryId");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- CreateIndex
CREATE INDEX "projects_status_language_visibility_idx" ON "projects"("status", "language", "visibility");

-- CreateIndex
CREATE INDEX "projects_translationGroupId_idx" ON "projects"("translationGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_language_slug_key" ON "projects"("language", "slug");

-- CreateIndex
CREATE INDEX "project_gallery_items_projectId_idx" ON "project_gallery_items"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_gallery_items_projectId_mediaAssetId_key" ON "project_gallery_items"("projectId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");

-- CreateIndex
CREATE INDEX "services_status_language_visibility_idx" ON "services"("status", "language", "visibility");

-- CreateIndex
CREATE INDEX "services_translationGroupId_idx" ON "services"("translationGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "services_language_slug_key" ON "services"("language", "slug");

-- CreateIndex
CREATE INDEX "media_folders_parentId_idx" ON "media_folders"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_name_key" ON "media_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_replacedById_key" ON "media_assets"("replacedById");

-- CreateIndex
CREATE INDEX "media_assets_kind_idx" ON "media_assets"("kind");

-- CreateIndex
CREATE INDEX "media_assets_folderId_idx" ON "media_assets"("folderId");

-- CreateIndex
CREATE INDEX "media_assets_deletedAt_idx" ON "media_assets"("deletedAt");

-- CreateIndex
CREATE INDEX "media_usages_mediaAssetId_idx" ON "media_usages"("mediaAssetId");

-- CreateIndex
CREATE INDEX "media_usages_entityType_entityId_idx" ON "media_usages"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_approvalStatus_idx" ON "companies"("approvalStatus");

-- CreateIndex
CREATE INDEX "companies_verificationStatus_idx" ON "companies"("verificationStatus");

-- CreateIndex
CREATE INDEX "companies_featured_idx" ON "companies"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "company_gallery_items_companyId_mediaAssetId_key" ON "company_gallery_items"("companyId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "company_recommendations_companyId_idx" ON "company_recommendations"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "advertisement_placements_key_key" ON "advertisement_placements"("key");

-- CreateIndex
CREATE INDEX "advertisement_campaigns_companyId_idx" ON "advertisement_campaigns"("companyId");

-- CreateIndex
CREATE INDEX "advertisement_campaigns_status_idx" ON "advertisement_campaigns"("status");

-- CreateIndex
CREATE INDEX "advertisement_campaigns_startDate_endDate_idx" ON "advertisement_campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "advertisement_creatives_campaignId_idx" ON "advertisement_creatives"("campaignId");

-- CreateIndex
CREATE INDEX "advertisement_campaign_placements_placementId_idx" ON "advertisement_campaign_placements"("placementId");

-- CreateIndex
CREATE UNIQUE INDEX "advertisement_campaign_placements_campaignId_placementId_cr_key" ON "advertisement_campaign_placements"("campaignId", "placementId", "creativeId");

-- CreateIndex
CREATE UNIQUE INDEX "design_requests_requestNumber_key" ON "design_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "design_requests_status_idx" ON "design_requests"("status");

-- CreateIndex
CREATE INDEX "design_requests_assignedToId_idx" ON "design_requests"("assignedToId");

-- CreateIndex
CREATE INDEX "design_requests_customerId_idx" ON "design_requests"("customerId");

-- CreateIndex
CREATE INDEX "design_request_images_designRequestId_role_idx" ON "design_request_images"("designRequestId", "role");

-- CreateIndex
CREATE INDEX "design_request_status_history_designRequestId_idx" ON "design_request_status_history"("designRequestId");

-- CreateIndex
CREATE INDEX "design_request_messages_designRequestId_idx" ON "design_request_messages"("designRequestId");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_assignedToId_idx" ON "contact_messages"("assignedToId");

-- CreateIndex
CREATE INDEX "contact_message_replies_contactMessageId_idx" ON "contact_message_replies"("contactMessageId");

-- CreateIndex
CREATE INDEX "internal_notes_entityType_entityId_idx" ON "internal_notes"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_key_key" ON "notification_templates"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_channel_key" ON "notification_preferences"("userId", "notificationType", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- CreateIndex
CREATE UNIQUE INDEX "redirects_fromPath_key" ON "redirects"("fromPath");

-- CreateIndex
CREATE UNIQUE INDEX "seo_meta_entityType_entityId_key" ON "seo_meta"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "translations_entityType_entityId_idx" ON "translations"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "translations_entityType_entityId_locale_field_key" ON "translations"("entityType", "entityId", "locale", "field");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_type_createdAt_idx" ON "analytics_events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_path_idx" ON "analytics_events"("path");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_entityType_entityId_idx" ON "analytics_events"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagged_items" ADD CONSTRAINT "tagged_items_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_relations" ADD CONSTRAINT "content_relations_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_relations" ADD CONSTRAINT "content_relations_relatedContentId_fkey" FOREIGN KEY ("relatedContentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stages" ADD CONSTRAINT "construction_journey_stages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "construction_journey_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_files" ADD CONSTRAINT "construction_journey_stage_files_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "construction_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_files" ADD CONSTRAINT "construction_journey_stage_files_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_companies" ADD CONSTRAINT "construction_journey_stage_companies_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "construction_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_companies" ADD CONSTRAINT "construction_journey_stage_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_ads" ADD CONSTRAINT "construction_journey_stage_ads_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "construction_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_ads" ADD CONSTRAINT "construction_journey_stage_ads_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "advertisement_creatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_faqs" ADD CONSTRAINT "construction_journey_stage_faqs_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "construction_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_journey_stage_faqs" ADD CONSTRAINT "construction_journey_stage_faqs_faqItemId_fkey" FOREIGN KEY ("faqItemId") REFERENCES "faq_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_library_items" ADD CONSTRAINT "construction_library_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "construction_library_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_library_items" ADD CONSTRAINT "construction_library_items_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_library_relations" ADD CONSTRAINT "construction_library_relations_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "construction_library_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_library_relations" ADD CONSTRAINT "construction_library_relations_relatedItemId_fkey" FOREIGN KEY ("relatedItemId") REFERENCES "construction_library_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_ideas" ADD CONSTRAINT "design_ideas_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_ideas" ADD CONSTRAINT "design_ideas_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_ideas" ADD CONSTRAINT "design_ideas_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_gallery_items" ADD CONSTRAINT "design_idea_gallery_items_designIdeaId_fkey" FOREIGN KEY ("designIdeaId") REFERENCES "design_ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_gallery_items" ADD CONSTRAINT "design_idea_gallery_items_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_styles" ADD CONSTRAINT "design_idea_styles_designIdeaId_fkey" FOREIGN KEY ("designIdeaId") REFERENCES "design_ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_styles" ADD CONSTRAINT "design_idea_styles_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_saves" ADD CONSTRAINT "design_idea_saves_designIdeaId_fkey" FOREIGN KEY ("designIdeaId") REFERENCES "design_ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_idea_saves" ADD CONSTRAINT "design_idea_saves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_tags" ADD CONSTRAINT "media_asset_tags_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_asset_tags" ADD CONSTRAINT "media_asset_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "media_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_usages" ADD CONSTRAINT "media_usages_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_categories" ADD CONSTRAINT "company_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_categories" ADD CONSTRAINT "company_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_gallery_items" ADD CONSTRAINT "company_gallery_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_gallery_items" ADD CONSTRAINT "company_gallery_items_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_recommendations" ADD CONSTRAINT "company_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_recommendations" ADD CONSTRAINT "company_recommendations_recommendedById_fkey" FOREIGN KEY ("recommendedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaigns" ADD CONSTRAINT "advertisement_campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaigns" ADD CONSTRAINT "advertisement_campaigns_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "advertisement_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaigns" ADD CONSTRAINT "advertisement_campaigns_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_creatives" ADD CONSTRAINT "advertisement_creatives_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertisement_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_creatives" ADD CONSTRAINT "advertisement_creatives_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaign_placements" ADD CONSTRAINT "advertisement_campaign_placements_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertisement_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaign_placements" ADD CONSTRAINT "advertisement_campaign_placements_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "advertisement_placements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_campaign_placements" ADD CONSTRAINT "advertisement_campaign_placements_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "advertisement_creatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_styles" ADD CONSTRAINT "design_request_styles_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "design_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_styles" ADD CONSTRAINT "design_request_styles_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_images" ADD CONSTRAINT "design_request_images_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "design_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_images" ADD CONSTRAINT "design_request_images_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_status_history" ADD CONSTRAINT "design_request_status_history_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "design_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_status_history" ADD CONSTRAINT "design_request_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_messages" ADD CONSTRAINT "design_request_messages_designRequestId_fkey" FOREIGN KEY ("designRequestId") REFERENCES "design_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_request_messages" ADD CONSTRAINT "design_request_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

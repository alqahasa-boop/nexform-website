# NEXFORM — Phase 2 Entity Relationship Diagram

Generated from `prisma/schema.prisma`. Grouped by domain via comments; Mermaid `erDiagram` has no subgraphs, so grouping is visual/ordering only.

```mermaid
erDiagram
    %% ── AUTH & RBAC ──────────────────────────────────────────────
    User ||--o{ UserRole : "has"
    Role ||--o{ UserRole : "granted to"
    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "granted via"
    User ||--o| CustomerProfile : "extends"
    User ||--o{ Account : "oauth"
    User ||--o{ Session : "sessions"
    User ||--o{ PasswordResetToken : "reset tokens"

    %% ── TAXONOMY & TAGGING ───────────────────────────────────────
    Category ||--o{ Category : "parent/children"
    Category ||--o{ Content : "categorizes"
    Category ||--o{ Project : "categorizes"
    Category ||--o{ DesignIdea : "categorizes"
    Category ||--o{ Service : "categorizes"
    Category ||--o{ CompanyCategory : "categorizes"
    Tag ||--o{ TaggedItem : "tags (polymorphic)"
    Style ||--o{ DesignIdeaStyle : "styles"
    Style ||--o{ DesignRequestStyle : "preferred by"

    %% ── CONTENT MANAGEMENT ───────────────────────────────────────
    User ||--o{ Content : "authors"
    User ||--o{ Content : "reviews"
    User ||--o{ Content : "last updates"
    Content ||--o{ ContentRelation : "related from"
    Content ||--o{ ContentRelation : "related to"
    Content ||--o{ ContentRevision : "revisions (polymorphic)"

    %% ── CONSTRUCTION JOURNEY ─────────────────────────────────────
    ConstructionJourneyStage ||--o{ ConstructionJourneyStage : "parent/children"
    ConstructionJourneyStage ||--o{ ConstructionJourneyStageFile : "attachments"
    MediaAsset ||--o{ ConstructionJourneyStageFile : "file"
    ConstructionJourneyStage ||--o{ ConstructionJourneyStageCompany : "featured companies"
    Company ||--o{ ConstructionJourneyStageCompany : "featured in stages"
    ConstructionJourneyStage ||--o{ ConstructionJourneyStageAdvertisement : "ad slots"
    AdvertisementCreative ||--o{ ConstructionJourneyStageAdvertisement : "placed in stages"
    ConstructionJourneyStage ||--o{ ConstructionJourneyStageFaq : "related faqs"
    FaqItem ||--o{ ConstructionJourneyStageFaq : "answers for stages"

    %% ── CONSTRUCTION LIBRARY ─────────────────────────────────────
    ConstructionLibraryCategory ||--o{ ConstructionLibraryItem : "contains"
    MediaAsset ||--o{ ConstructionLibraryItem : "file"
    ConstructionLibraryItem ||--o{ ConstructionLibraryRelation : "related from"
    ConstructionLibraryItem ||--o{ ConstructionLibraryRelation : "related to"
    ConstructionLibraryItem ||--o{ TaggedItem : "tagged (polymorphic)"

    %% ── DESIGN INSPIRATION ───────────────────────────────────────
    User ||--o{ DesignIdea : "designed by (staff)"
    Category ||--o{ DesignIdea : "categorizes"
    MediaAsset ||--o{ DesignIdea : "cover"
    DesignIdea ||--o{ DesignIdeaGalleryItem : "gallery"
    MediaAsset ||--o{ DesignIdeaGalleryItem : "asset"
    DesignIdea ||--o{ DesignIdeaStyle : "styles"
    DesignIdea ||--o{ DesignIdeaSave : "saved by"
    User ||--o{ DesignIdeaSave : "saves"
    DesignIdea ||--o{ TaggedItem : "tagged (polymorphic)"

    %% ── PROJECTS ─────────────────────────────────────────────────
    User ||--o{ Project : "created by"
    Category ||--o{ Project : "categorizes"
    MediaAsset ||--o{ Project : "cover"
    Project ||--o{ ProjectGalleryItem : "gallery"
    MediaAsset ||--o{ ProjectGalleryItem : "asset"
    Project ||--o{ ProjectTeamMember : "team"
    User ||--o{ ProjectTeamMember : "member of"
    Project ||--o{ TaggedItem : "tagged (polymorphic)"

    %% ── SERVICES ─────────────────────────────────────────────────
    User ||--o{ Service : "created by"
    Category ||--o{ Service : "categorizes"
    MediaAsset ||--o{ Service : "cover"
    Service ||--o{ DesignRequest : "requested via"
    Service ||--o{ TaggedItem : "tagged (polymorphic)"

    %% ── MEDIA LIBRARY ────────────────────────────────────────────
    MediaFolder ||--o{ MediaFolder : "parent/children"
    MediaFolder ||--o{ MediaAsset : "contains"
    MediaAsset ||--o{ MediaAssetTag : "tagged"
    MediaTag ||--o{ MediaAssetTag : "tags"
    User ||--o{ MediaAsset : "uploaded by"
    MediaAsset ||--o{ MediaUsage : "usage log (polymorphic)"
    MediaAsset ||--o| MediaAsset : "replaced by"

    %% ── COMPANIES DIRECTORY ──────────────────────────────────────
    User ||--o{ Company : "created by"
    MediaAsset ||--o{ Company : "logo"
    Company ||--o{ CompanyCategory : "categories"
    Company ||--o{ CompanyGalleryItem : "gallery"
    MediaAsset ||--o{ CompanyGalleryItem : "asset"
    Company ||--o{ CompanyRecommendation : "editorial recs"
    User ||--o{ CompanyRecommendation : "recommended by"

    %% ── ADVERTISING SYSTEM ───────────────────────────────────────
    AdvertisementPackage ||--o{ AdvertisementCampaign : "sold as"
    Company ||--o{ AdvertisementCampaign : "advertiser"
    User ||--o{ AdvertisementCampaign : "approved by"
    AdvertisementCampaign ||--o{ AdvertisementCreative : "creatives"
    MediaAsset ||--o{ AdvertisementCreative : "image"
    AdvertisementCampaign ||--o{ AdvertisementCampaignPlacement : "booked into"
    AdvertisementPlacement ||--o{ AdvertisementCampaignPlacement : "slot"
    AdvertisementCreative ||--o{ AdvertisementCampaignPlacement : "shown as"

    %% ── DESIGN REQUESTS (full workflow) ──────────────────────────
    User ||--o{ DesignRequest : "submitted by (customer)"
    User ||--o{ DesignRequest : "assigned to (staff)"
    Service ||--o{ DesignRequest : "for service"
    DesignRequest ||--o{ DesignRequestStyle : "preferred styles"
    DesignRequest ||--o{ DesignRequestImage : "images"
    MediaAsset ||--o{ DesignRequestImage : "asset"
    DesignRequest ||--o{ DesignRequestStatusHistory : "status history (append-only)"
    User ||--o{ DesignRequestStatusHistory : "changed by"
    DesignRequest ||--o{ DesignRequestMessage : "conversation"
    User ||--o{ DesignRequestMessage : "authored by"

    %% ── CONTACT & NOTIFICATIONS ──────────────────────────────────
    User ||--o{ ContactMessage : "assigned to"
    ContactMessage ||--o{ ContactMessageReply : "replies"
    User ||--o{ ContactMessageReply : "replied by"
    User ||--o{ InternalNote : "authored (polymorphic target)"
    User ||--o{ Notification : "received by"
    User ||--o{ NotificationPreference : "preferences"

    %% ── SETTINGS, SEO, LANGUAGES ─────────────────────────────────
    %% Setting, Redirect, SeoMeta, Language, Translation are standalone /
    %% polymorphic — no direct FK relations to draw.

    %% ── AUDIT & ANALYTICS ─────────────────────────────────────────
    User ||--o{ ActivityLog : "acted"
    %% AnalyticsEvent is standalone (flexible event table, optional userId).

    User {
        string id PK
        string email UK
        string passwordHash
        boolean isActive
        datetime deletedAt
    }
    Role {
        string id PK
        SystemRoleKey key UK
        string name
    }
    UserRole {
        string userId FK
        string roleId FK
    }
    Content {
        string id PK
        ContentType contentType
        string slug
        string language
        string translationGroupId
        ContentStatus status
        string authorId FK
    }
    Project {
        string id PK
        string slug
        string language
        string translationGroupId
        string createdById FK
    }
    DesignIdea {
        string id PK
        string slug
        string language
        DesignCategory designCategory
        int viewCount
        int saveCount
    }
    Service {
        string id PK
        string slug
        PricingDisplay pricingDisplay
    }
    Company {
        string id PK
        string slug UK
        VerificationStatus verificationStatus
        ApprovalStatus approvalStatus
    }
    AdvertisementCampaign {
        string id PK
        string companyId FK
        CampaignStatus status
    }
    DesignRequest {
        string id PK
        string requestNumber UK
        DesignRequestStatus status
        string customerId FK
        string assignedToId FK
    }
    MediaAsset {
        string id PK
        MediaKind kind
        string url
        string uploadedById FK
    }
    AnalyticsEvent {
        string id PK
        AnalyticsEventType type
        string path
        datetime createdAt
    }
    ActivityLog {
        string id PK
        ActivityAction action
        string entityType
        string entityId
    }
```

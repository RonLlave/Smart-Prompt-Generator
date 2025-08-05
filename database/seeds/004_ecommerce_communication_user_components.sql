-- E-commerce, Communication, and User Management Components Seed Data

INSERT INTO component_library (
    component_id, display_name, category_id, description, icon, 
    complexity_score, configuration, features
) VALUES

-- E-COMMERCE COMPONENTS
(
    'ecom-product-card',
    'Product Card',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Product display card with image, price, and actions',
    '🛍️',
    2,
    '{
        "showRating": true,
        "showQuickView": true,
        "showWishlist": true,
        "showCompare": true,
        "imageHoverEffect": "zoom",
        "priceFormat": "currency",
        "showDiscount": true,
        "badgePosition": "top-right",
        "cardLayout": "vertical"
    }'::jsonb,
    '["image-gallery", "quick-actions", "price-display", "ratings", "wishlist", "comparison", "badges"]'::jsonb
),
(
    'ecom-cart',
    'Shopping Cart',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Full-featured shopping cart with mini-cart view',
    '🛒',
    4,
    '{
        "enableMiniCart": true,
        "showSaveForLater": true,
        "enablePromoCodes": true,
        "calculateShipping": true,
        "persistCart": true,
        "cartExpiry": 7,
        "quantityLimits": {"min": 1, "max": 99},
        "showRecommendations": true
    }'::jsonb,
    '["cart-management", "quantity-update", "promo-codes", "save-for-later", "mini-cart", "recommendations"]'::jsonb
),
(
    'ecom-product-gallery',
    'Product Gallery',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Image gallery with zoom and 360-view capabilities',
    '📸',
    3,
    '{
        "enableZoom": true,
        "zoomLevel": 2,
        "enable360View": true,
        "enableVideo": true,
        "thumbnailPosition": "bottom",
        "autoplay": false,
        "enableFullscreen": true,
        "touchSupport": true
    }'::jsonb,
    '["image-zoom", "360-view", "video-support", "thumbnails", "fullscreen", "touch-gestures", "lazy-loading"]'::jsonb
),
(
    'ecom-reviews',
    'Product Reviews',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Rating and review system with moderation',
    '⭐',
    3,
    '{
        "enableRatings": true,
        "ratingScale": 5,
        "enablePhotos": true,
        "enableHelpfulVotes": true,
        "requirePurchase": true,
        "moderationEnabled": true,
        "sortOptions": ["newest", "helpful", "rating"],
        "enableResponses": true
    }'::jsonb,
    '["star-ratings", "photo-reviews", "helpful-votes", "moderation", "verified-purchase", "merchant-responses"]'::jsonb
),
(
    'ecom-filters',
    'Product Filters',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Advanced filtering sidebar with multiple filter types',
    '🔍',
    3,
    '{
        "filterTypes": {
            "price": {"type": "range", "min": 0, "max": 10000},
            "category": {"type": "checkbox", "multiSelect": true},
            "brand": {"type": "checkbox", "searchable": true},
            "rating": {"type": "stars", "minRating": 1},
            "attributes": {"type": "dynamic"}
        },
        "showResultCount": true,
        "enableClearAll": true,
        "collapsible": true
    }'::jsonb,
    '["price-range", "multi-select", "search-filters", "dynamic-attributes", "result-count", "filter-tags"]'::jsonb
),
(
    'ecom-wishlist',
    'Wishlist',
    (SELECT id FROM component_categories WHERE name = 'ecommerce'),
    'Save products for later with sharing options',
    '❤️',
    2,
    '{
        "enableSharing": true,
        "privacyOptions": ["private", "public", "link-only"],
        "enableNotes": true,
        "enablePriceAlerts": true,
        "multipleListsSupport": true,
        "guestWishlist": true
    }'::jsonb,
    '["save-items", "share-lists", "price-tracking", "multiple-lists", "guest-support", "notifications"]'::jsonb
),

-- COMMUNICATION COMPONENTS
(
    'comm-chat',
    'Chat Interface',
    (SELECT id FROM component_categories WHERE name = 'communication'),
    'Real-time messaging with file sharing',
    '💬',
    5,
    '{
        "enableRealTime": true,
        "supportFileSharing": true,
        "maxFileSize": 10485760,
        "enableTypingIndicator": true,
        "enableReadReceipts": true,
        "enableEmoji": true,
        "enableVoiceNotes": true,
        "messageRetention": 90,
        "encryptionEnabled": true
    }'::jsonb,
    '["real-time-messaging", "file-sharing", "typing-indicators", "read-receipts", "emoji-support", "voice-notes", "encryption"]'::jsonb
),
(
    'comm-comments',
    'Comment System',
    (SELECT id FROM component_categories WHERE name = 'communication'),
    'Threaded comments with moderation and voting',
    '💭',
    3,
    '{
        "enableThreading": true,
        "maxNestingLevel": 3,
        "enableVoting": true,
        "enableMentions": true,
        "moderationMode": "post",
        "enableEditing": true,
        "editTimeLimit": 300,
        "enableMarkdown": true,
        "sortOptions": ["newest", "oldest", "popular"]
    }'::jsonb,
    '["nested-comments", "voting-system", "mentions", "moderation", "markdown-support", "edit-history", "spam-filter"]'::jsonb
),
(
    'comm-notifications',
    'Notification Center',
    (SELECT id FROM component_categories WHERE name = 'communication'),
    'In-app notifications with multiple channels',
    '🔔',
    3,
    '{
        "channels": ["in-app", "email", "push", "sms"],
        "groupingEnabled": true,
        "persistNotifications": true,
        "soundEnabled": false,
        "position": "top-right",
        "maxNotifications": 100,
        "autoMarkRead": false,
        "categories": ["system", "social", "commerce", "updates"]
    }'::jsonb,
    '["multi-channel", "notification-grouping", "preferences", "actions", "persistence", "categories", "scheduling"]'::jsonb
),
(
    'comm-inbox',
    'Message Inbox',
    (SELECT id FROM component_categories WHERE name = 'communication'),
    'Email-style messaging system',
    '📧',
    4,
    '{
        "folders": ["inbox", "sent", "drafts", "trash", "spam"],
        "enableSearch": true,
        "enableFilters": true,
        "bulkActions": ["delete", "archive", "mark-read", "move"],
        "threadingEnabled": true,
        "enableAttachments": true,
        "maxAttachmentSize": 25165824,
        "enableLabels": true
    }'::jsonb,
    '["folder-management", "search-messages", "bulk-actions", "threading", "attachments", "labels", "filters"]'::jsonb
),
(
    'comm-video-call',
    'Video Calling',
    (SELECT id FROM component_categories WHERE name = 'communication'),
    'WebRTC-based video conferencing',
    '📹',
    5,
    '{
        "maxParticipants": 4,
        "enableScreenShare": true,
        "enableRecording": false,
        "enableChat": true,
        "enableVirtualBackground": true,
        "qualityOptions": ["auto", "720p", "480p", "360p"],
        "enableNoiseSupression": true
    }'::jsonb,
    '["video-conferencing", "screen-sharing", "in-call-chat", "virtual-backgrounds", "recording", "quality-control"]'::jsonb
),

-- USER MANAGEMENT COMPONENTS
(
    'user-profile',
    'User Profile',
    (SELECT id FROM component_categories WHERE name = 'user-management'),
    'Complete user profile page with customization',
    '👤',
    3,
    '{
        "sections": ["info", "avatar", "bio", "social", "activity", "achievements"],
        "enableAvatarUpload": true,
        "enableCoverPhoto": true,
        "socialLinks": ["twitter", "linkedin", "github", "website"],
        "privacyControls": true,
        "activityFeed": true,
        "customFields": true
    }'::jsonb,
    '["profile-customization", "avatar-upload", "social-links", "activity-feed", "privacy-settings", "custom-fields"]'::jsonb
),
(
    'user-settings',
    'Account Settings',
    (SELECT id FROM component_categories WHERE name = 'user-management'),
    'User preferences and account management',
    '⚙️',
    3,
    '{
        "categories": ["profile", "privacy", "notifications", "security", "billing", "preferences"],
        "enableTwoFactor": true,
        "enablePasswordChange": true,
        "enableEmailChange": true,
        "enableAccountDeletion": true,
        "enableDataExport": true,
        "themeSelection": true
    }'::jsonb,
    '["preference-management", "privacy-controls", "security-settings", "billing-info", "data-portability", "theme-switcher"]'::jsonb
),
(
    'user-list',
    'User Directory',
    (SELECT id FROM component_categories WHERE name = 'user-management'),
    'Searchable user listing with filters',
    '👥',
    3,
    '{
        "enableSearch": true,
        "searchFields": ["name", "email", "role", "department"],
        "filters": ["status", "role", "department", "location"],
        "viewModes": ["grid", "list", "compact"],
        "enableBulkActions": true,
        "showOnlineStatus": true,
        "enableExport": true
    }'::jsonb,
    '["advanced-search", "multiple-filters", "bulk-operations", "export-users", "online-status", "view-modes"]'::jsonb
),
(
    'user-teams',
    'Team Management',
    (SELECT id FROM component_categories WHERE name = 'user-management'),
    'Team creation and member management',
    '👫',
    4,
    '{
        "enableTeamCreation": true,
        "maxTeamSize": 50,
        "roleHierarchy": ["owner", "admin", "member", "guest"],
        "enableInvites": true,
        "inviteExpiry": 7,
        "teamSettings": true,
        "enableTeamChat": true,
        "teamAnalytics": true
    }'::jsonb,
    '["team-creation", "member-invites", "role-management", "team-settings", "team-communication", "analytics"]'::jsonb
),
(
    'user-permissions',
    'Permission Management',
    (SELECT id FROM component_categories WHERE name = 'user-management'),
    'Granular permission control system',
    '🔐',
    4,
    '{
        "permissionTypes": ["read", "write", "delete", "admin"],
        "resourceTypes": ["page", "feature", "data", "api"],
        "enableRoles": true,
        "enableGroups": true,
        "inheritanceModel": "hierarchical",
        "auditLogging": true,
        "bulkAssignment": true
    }'::jsonb,
    '["permission-matrix", "role-based", "resource-control", "inheritance", "audit-trail", "bulk-management"]'::jsonb
)
ON CONFLICT (component_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    complexity_score = EXCLUDED.complexity_score,
    configuration = EXCLUDED.configuration,
    features = EXCLUDED.features,
    updated_at = CURRENT_TIMESTAMP;
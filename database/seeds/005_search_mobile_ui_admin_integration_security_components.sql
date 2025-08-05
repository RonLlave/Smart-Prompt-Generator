-- Search, Mobile, UI, Admin, Integration, and Security Components Seed Data

INSERT INTO component_library (
    component_id, display_name, category_id, description, icon, 
    complexity_score, configuration, features
) VALUES

-- SEARCH COMPONENTS
(
    'search-global',
    'Global Search',
    (SELECT id FROM component_categories WHERE name = 'search'),
    'Site-wide search with autocomplete and suggestions',
    '🔍',
    3,
    '{
        "enableAutocomplete": true,
        "enableSuggestions": true,
        "enableRecent": true,
        "enableVoiceSearch": true,
        "searchDelay": 300,
        "minCharacters": 2,
        "maxSuggestions": 10,
        "searchScopes": ["all", "products", "users", "docs"],
        "fuzzySearch": true
    }'::jsonb,
    '["autocomplete", "search-suggestions", "recent-searches", "voice-search", "fuzzy-matching", "search-analytics"]'::jsonb
),
(
    'search-advanced',
    'Advanced Search',
    (SELECT id FROM component_categories WHERE name = 'search'),
    'Complex search interface with filters',
    '🔎',
    4,
    '{
        "enableBooleanSearch": true,
        "dateRangeSearch": true,
        "categoryFilters": true,
        "saveSearches": true,
        "searchHistory": true,
        "exportResults": true,
        "operators": ["AND", "OR", "NOT", "NEAR"],
        "wildcardSupport": true
    }'::jsonb,
    '["boolean-operators", "date-range", "saved-searches", "search-history", "export-results", "wildcards"]'::jsonb
),
(
    'search-filters',
    'Filter Panel',
    (SELECT id FROM component_categories WHERE name = 'search'),
    'Faceted search filters with real-time updates',
    '🎛️',
    3,
    '{
        "filterTypes": {
            "checkbox": true,
            "range": true,
            "tags": true,
            "date": true,
            "color": true,
            "size": true
        },
        "showCounts": true,
        "collapsible": true,
        "clearAllOption": true,
        "filterPersistence": true
    }'::jsonb,
    '["faceted-search", "real-time-filtering", "filter-counts", "multi-select", "range-sliders", "filter-tags"]'::jsonb
),

-- MOBILE COMPONENTS
(
    'mobile-bottomnav',
    'Bottom Navigation',
    (SELECT id FROM component_categories WHERE name = 'mobile'),
    'Mobile bottom tab bar navigation',
    '📱',
    2,
    '{
        "maxTabs": 5,
        "showLabels": true,
        "activeIndicator": "background",
        "hapticFeedback": true,
        "swipeGestures": false,
        "badgeSupport": true,
        "adaptiveIcons": true
    }'::jsonb,
    '["tab-navigation", "badges", "haptic-feedback", "adaptive-icons", "gesture-support"]'::jsonb
),
(
    'mobile-drawer',
    'Drawer Menu',
    (SELECT id FROM component_categories WHERE name = 'mobile'),
    'Slide-out navigation drawer',
    '📤',
    2,
    '{
        "position": "left",
        "swipeToOpen": true,
        "overlay": true,
        "width": "80%",
        "pushContent": false,
        "closeOnOutsideClick": true,
        "headerImage": true
    }'::jsonb,
    '["slide-menu", "swipe-gestures", "overlay", "push-content", "custom-header"]'::jsonb
),
(
    'mobile-action-sheet',
    'Action Sheet',
    (SELECT id FROM component_categories WHERE name = 'mobile'),
    'iOS/Android style action menu',
    '📋',
    2,
    '{
        "style": "auto",
        "showCancel": true,
        "destructiveButton": true,
        "icons": true,
        "customColors": true,
        "backdropDismiss": true
    }'::jsonb,
    '["native-style", "destructive-actions", "icons", "backdrop-dismiss", "animations"]'::jsonb
),
(
    'mobile-pull-refresh',
    'Pull to Refresh',
    (SELECT id FROM component_categories WHERE name = 'mobile'),
    'Swipe down refresh pattern',
    '🔄',
    2,
    '{
        "threshold": 60,
        "refreshTimeout": 2000,
        "customIndicator": false,
        "hapticFeedback": true,
        "refreshOnMount": false
    }'::jsonb,
    '["pull-gesture", "loading-indicator", "haptic-feedback", "custom-animation"]'::jsonb
),

-- UI ELEMENTS
(
    'ui-modal',
    'Modal Dialog',
    (SELECT id FROM component_categories WHERE name = 'ui-elements'),
    'Popup modal window with various sizes',
    '🪟',
    2,
    '{
        "sizes": ["sm", "md", "lg", "xl", "fullscreen"],
        "closable": true,
        "backdrop": true,
        "keyboard": true,
        "animation": "fade",
        "draggable": false,
        "resizable": false,
        "stackable": true
    }'::jsonb,
    '["multiple-sizes", "backdrop", "keyboard-control", "animations", "nested-modals", "focus-trap"]'::jsonb
),
(
    'ui-toast',
    'Toast Notifications',
    (SELECT id FROM component_categories WHERE name = 'ui-elements'),
    'Temporary notification messages',
    '🍞',
    2,
    '{
        "position": "top-right",
        "duration": 3000,
        "types": ["success", "error", "warning", "info"],
        "closable": true,
        "pauseOnHover": true,
        "queue": true,
        "maxToasts": 5,
        "animations": true
    }'::jsonb,
    '["auto-dismiss", "toast-types", "positioning", "toast-queue", "pause-on-hover", "custom-styling"]'::jsonb
),
(
    'ui-carousel',
    'Image Carousel',
    (SELECT id FROM component_categories WHERE name = 'ui-elements'),
    'Image and content slider',
    '🎠',
    3,
    '{
        "autoplay": true,
        "interval": 5000,
        "showDots": true,
        "showArrows": true,
        "showThumbnails": false,
        "infinite": true,
        "touchSwipe": true,
        "keyboardNav": true,
        "lazyLoad": true
    }'::jsonb,
    '["autoplay", "navigation-dots", "arrows", "thumbnails", "touch-support", "keyboard-nav", "lazy-loading"]'::jsonb
),
(
    'ui-accordion',
    'Accordion/Collapse',
    (SELECT id FROM component_categories WHERE name = 'ui-elements'),
    'Expandable content sections',
    '🪗',
    2,
    '{
        "allowMultiple": false,
        "defaultOpen": null,
        "animation": true,
        "icons": true,
        "bordered": true,
        "hoverable": false
    }'::jsonb,
    '["expand-collapse", "single-multiple", "animations", "custom-icons", "keyboard-accessible"]'::jsonb
),
(
    'ui-stepper',
    'Progress Stepper',
    (SELECT id FROM component_categories WHERE name = 'ui-elements'),
    'Step progress indicator',
    '👣',
    2,
    '{
        "orientation": "horizontal",
        "showNumbers": true,
        "clickable": true,
        "showErrors": true,
        "animation": true,
        "connector": true,
        "alternativeLabel": false
    }'::jsonb,
    '["step-navigation", "progress-tracking", "error-states", "clickable-steps", "custom-icons"]'::jsonb
),

-- ADMIN COMPONENTS
(
    'admin-dashboard',
    'Admin Dashboard',
    (SELECT id FROM component_categories WHERE name = 'admin'),
    'Complete admin panel layout',
    '🎛️',
    5,
    '{
        "layout": "sidebar",
        "sections": ["overview", "users", "content", "settings", "analytics"],
        "customizable": true,
        "darkMode": true,
        "compactMode": false,
        "multiLanguage": true,
        "quickActions": true
    }'::jsonb,
    '["dashboard-layout", "widget-system", "customization", "dark-mode", "multi-language", "quick-actions"]'::jsonb
),
(
    'admin-crud',
    'CRUD Interface',
    (SELECT id FROM component_categories WHERE name = 'admin'),
    'Create, Read, Update, Delete interface',
    '📝',
    4,
    '{
        "inlineEdit": true,
        "bulkOperations": true,
        "importExport": true,
        "revisionHistory": true,
        "softDelete": true,
        "validation": true,
        "autoSave": false
    }'::jsonb,
    '["inline-editing", "bulk-operations", "import-export", "revision-history", "soft-delete", "validation"]'::jsonb
),
(
    'admin-logs',
    'Activity Logs',
    (SELECT id FROM component_categories WHERE name = 'admin'),
    'System activity and audit logging',
    '📜',
    3,
    '{
        "logTypes": ["user", "system", "error", "security"],
        "retention": 90,
        "searchable": true,
        "exportable": true,
        "realTime": true,
        "alerting": true,
        "detailView": true
    }'::jsonb,
    '["activity-tracking", "search-logs", "export-logs", "real-time-updates", "alerting", "log-details"]'::jsonb
),
(
    'admin-settings',
    'System Settings',
    (SELECT id FROM component_categories WHERE name = 'admin'),
    'Application configuration interface',
    '⚙️',
    4,
    '{
        "categories": ["general", "email", "api", "security", "appearance", "advanced"],
        "validation": true,
        "preview": true,
        "backup": true,
        "restore": true,
        "environment": ["development", "staging", "production"],
        "configHistory": true
    }'::jsonb,
    '["settings-management", "validation", "preview-changes", "backup-restore", "environment-config", "history"]'::jsonb
),

-- INTEGRATION COMPONENTS
(
    'int-payment',
    'Payment Gateway',
    (SELECT id FROM component_categories WHERE name = 'integrations'),
    'Payment processing integration',
    '💳',
    5,
    '{
        "providers": {
            "stripe": {"enabled": true, "features": ["cards", "wallets", "subscriptions"]},
            "paypal": {"enabled": true, "features": ["express", "subscriptions"]},
            "square": {"enabled": false, "features": ["cards", "terminals"]}
        },
        "pciCompliant": true,
        "tokenization": true,
        "3dSecure": true,
        "saveCards": true
    }'::jsonb,
    '["multiple-gateways", "pci-compliance", "tokenization", "3d-secure", "subscription-billing", "saved-cards"]'::jsonb
),
(
    'int-analytics',
    'Analytics Dashboard',
    (SELECT id FROM component_categories WHERE name = 'integrations'),
    'Analytics service integration',
    '📊',
    3,
    '{
        "providers": {
            "google": {"enabled": true, "trackingId": null},
            "mixpanel": {"enabled": false, "token": null},
            "segment": {"enabled": false, "writeKey": null}
        },
        "customEvents": true,
        "userTracking": true,
        "conversionTracking": true,
        "heatmaps": false
    }'::jsonb,
    '["multi-provider", "event-tracking", "user-analytics", "conversion-tracking", "custom-events", "reporting"]'::jsonb
),
(
    'int-email',
    'Email Service',
    (SELECT id FROM component_categories WHERE name = 'integrations'),
    'Email sending and automation',
    '📧',
    3,
    '{
        "providers": {
            "sendgrid": {"enabled": true},
            "mailgun": {"enabled": false},
            "ses": {"enabled": false}
        },
        "templates": true,
        "tracking": true,
        "automation": true,
        "bulkSending": true,
        "scheduling": true
    }'::jsonb,
    '["email-templates", "open-tracking", "automation", "bulk-email", "scheduling", "bounce-handling"]'::jsonb
),
(
    'int-storage',
    'File Storage',
    (SELECT id FROM component_categories WHERE name = 'integrations'),
    'Cloud storage integration',
    '☁️',
    3,
    '{
        "providers": {
            "s3": {"enabled": true, "bucket": null},
            "cloudinary": {"enabled": false},
            "supabase": {"enabled": true}
        },
        "maxFileSize": 104857600,
        "allowedTypes": ["image", "video", "document"],
        "cdnEnabled": true,
        "imageOptimization": true
    }'::jsonb,
    '["multi-provider", "file-upload", "cdn-delivery", "image-optimization", "access-control", "metadata"]'::jsonb
),

-- SECURITY COMPONENTS
(
    'sec-captcha',
    'CAPTCHA',
    (SELECT id FROM component_categories WHERE name = 'security'),
    'Bot protection with CAPTCHA',
    '🤖',
    2,
    '{
        "provider": "recaptcha",
        "version": "v3",
        "threshold": 0.5,
        "invisible": true,
        "fallback": "checkbox",
        "customChallenge": false
    }'::jsonb,
    '["bot-protection", "invisible-captcha", "score-based", "fallback-challenge", "analytics"]'::jsonb
),
(
    'sec-consent',
    'Cookie Consent',
    (SELECT id FROM component_categories WHERE name = 'security'),
    'GDPR compliant cookie banner',
    '🍪',
    2,
    '{
        "position": "bottom",
        "theme": "light",
        "categories": ["necessary", "analytics", "marketing", "preferences"],
        "defaultState": "opt-out",
        "showDetails": true,
        "cookiePolicy": true,
        "autoBlock": true
    }'::jsonb,
    '["gdpr-compliance", "category-management", "auto-blocking", "consent-log", "policy-link"]'::jsonb
),
(
    'sec-audit',
    'Security Audit Log',
    (SELECT id FROM component_categories WHERE name = 'security'),
    'Security event tracking and monitoring',
    '🔍',
    4,
    '{
        "events": ["login", "logout", "permission-change", "data-access", "config-change"],
        "retention": 365,
        "encryption": true,
        "tamperProof": true,
        "alerting": true,
        "compliance": ["gdpr", "hipaa", "sox"]
    }'::jsonb,
    '["event-logging", "tamper-proof", "encryption", "compliance-ready", "alerting", "forensics"]'::jsonb
),
(
    'sec-encryption',
    'Data Encryption',
    (SELECT id FROM component_categories WHERE name = 'security'),
    'End-to-end encryption interface',
    '🔐',
    5,
    '{
        "algorithms": ["AES-256", "RSA-2048"],
        "keyManagement": true,
        "fieldLevel": true,
        "fileEncryption": true,
        "transitEncryption": true,
        "keyRotation": true
    }'::jsonb,
    '["field-encryption", "file-encryption", "key-management", "key-rotation", "compliance", "audit-trail"]'::jsonb
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
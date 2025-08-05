-- Feature Templates (Starter Kits) Seed Data

INSERT INTO feature_templates (
    template_id, name, description, category, components, 
    complexity_score, use_case, configuration
) VALUES
(
    'saas-starter',
    'SaaS Starter Pack',
    'Complete SaaS application foundation with authentication, dashboard, and admin features',
    'starter-kits',
    '[
        "auth-email-login",
        "auth-oauth",
        "auth-2fa",
        "nav-navbar",
        "nav-sidebar",
        "dash-stats",
        "dash-charts",
        "user-profile",
        "user-settings",
        "admin-dashboard",
        "int-payment",
        "int-analytics",
        "comm-notifications"
    ]'::jsonb,
    4,
    'Perfect for launching a new SaaS product with user authentication, subscription management, analytics dashboard, and admin features',
    '{
        "theme": "modern",
        "primaryColor": "#3B82F6",
        "features": {
            "multiTenancy": true,
            "subscriptionBilling": true,
            "teamManagement": true,
            "apiAccess": true
        }
    }'::jsonb
),
(
    'ecommerce-essential',
    'E-commerce Essentials',
    'Core e-commerce functionality bundle for online stores',
    'starter-kits',
    '[
        "ecom-product-card",
        "ecom-cart",
        "ecom-product-gallery",
        "ecom-reviews",
        "ecom-filters",
        "ecom-wishlist",
        "form-checkout",
        "search-global",
        "search-filters",
        "data-table",
        "auth-email-login",
        "auth-oauth",
        "int-payment",
        "int-email"
    ]'::jsonb,
    4,
    'Everything needed to start selling products online including product catalog, shopping cart, checkout, and payment processing',
    '{
        "currency": "USD",
        "features": {
            "inventory": true,
            "shipping": true,
            "tax": true,
            "coupons": true,
            "multiCurrency": false
        }
    }'::jsonb
),
(
    'social-platform',
    'Social Platform Kit',
    'Social networking features bundle for community platforms',
    'starter-kits',
    '[
        "user-profile",
        "user-list",
        "comm-chat",
        "comm-comments",
        "comm-notifications",
        "dash-activity",
        "search-global",
        "auth-email-login",
        "auth-oauth",
        "mobile-bottomnav",
        "mobile-pull-refresh",
        "ui-toast"
    ]'::jsonb,
    5,
    'Build a social platform with user profiles, real-time chat, activity feeds, and social interactions',
    '{
        "features": {
            "realTimeUpdates": true,
            "privateMessaging": true,
            "publicProfiles": true,
            "contentModeration": true,
            "gamification": true
        }
    }'::jsonb
),
(
    'business-dashboard',
    'Business Dashboard',
    'Analytics and reporting dashboard for business intelligence',
    'starter-kits',
    '[
        "dash-stats",
        "dash-charts",
        "dash-map",
        "dash-calendar",
        "data-table",
        "data-kanban",
        "search-advanced",
        "admin-logs",
        "int-analytics",
        "nav-navbar",
        "nav-sidebar"
    ]'::jsonb,
    4,
    'Comprehensive business intelligence dashboard with analytics, reporting, and data visualization',
    '{
        "features": {
            "realTimeData": true,
            "customReports": true,
            "dataExport": true,
            "scheduling": true,
            "alerts": true
        }
    }'::jsonb
),
(
    'content-management',
    'Content Management System',
    'Complete CMS with content creation and publishing tools',
    'starter-kits',
    '[
        "form-builder",
        "data-table",
        "admin-crud",
        "ui-modal",
        "search-global",
        "user-permissions",
        "auth-rbac",
        "int-storage",
        "nav-sidebar",
        "admin-dashboard"
    ]'::jsonb,
    5,
    'Full-featured content management system with WYSIWYG editing, media library, and publishing workflow',
    '{
        "features": {
            "wysiwygEditor": true,
            "mediaLibrary": true,
            "versionControl": true,
            "workflow": true,
            "seo": true,
            "multiLanguage": true
        }
    }'::jsonb
),
(
    'marketplace',
    'Marketplace Platform',
    'Multi-vendor marketplace with seller management',
    'starter-kits',
    '[
        "ecom-product-card",
        "ecom-cart",
        "ecom-filters",
        "user-profile",
        "user-teams",
        "comm-inbox",
        "comm-reviews",
        "int-payment",
        "admin-dashboard",
        "data-table",
        "dash-stats",
        "form-multi-step"
    ]'::jsonb,
    5,
    'Multi-vendor marketplace platform with seller dashboards, product management, and commission handling',
    '{
        "features": {
            "multiVendor": true,
            "commissionSystem": true,
            "sellerDashboard": true,
            "disputeResolution": true,
            "escrowPayments": true
        }
    }'::jsonb
),
(
    'learning-platform',
    'E-Learning Platform',
    'Online learning management system',
    'starter-kits',
    '[
        "user-profile",
        "data-cards",
        "comm-video-call",
        "comm-comments",
        "form-survey",
        "dash-progress",
        "dash-calendar",
        "int-payment",
        "int-storage",
        "mobile-drawer",
        "search-global"
    ]'::jsonb,
    5,
    'Complete e-learning platform with course management, video lessons, quizzes, and progress tracking',
    '{
        "features": {
            "courseBuilder": true,
            "videoStreaming": true,
            "quizzes": true,
            "certificates": true,
            "progressTracking": true,
            "liveClasses": true
        }
    }'::jsonb
),
(
    'healthcare-portal',
    'Healthcare Portal',
    'Patient management and telemedicine platform',
    'starter-kits',
    '[
        "auth-2fa",
        "user-profile",
        "comm-video-call",
        "comm-inbox",
        "dash-calendar",
        "form-multi-step",
        "data-table",
        "sec-encryption",
        "sec-audit",
        "mobile-drawer"
    ]'::jsonb,
    5,
    'HIPAA-compliant healthcare portal with patient records, appointment scheduling, and telemedicine',
    '{
        "features": {
            "hipaaCompliant": true,
            "telemedicine": true,
            "appointmentScheduling": true,
            "patientRecords": true,
            "prescriptions": true,
            "billing": true
        },
        "compliance": ["HIPAA", "GDPR"]
    }'::jsonb
),
(
    'project-management',
    'Project Management Tool',
    'Collaborative project management platform',
    'starter-kits',
    '[
        "data-kanban",
        "data-timeline",
        "dash-calendar",
        "user-teams",
        "comm-chat",
        "comm-comments",
        "comm-notifications",
        "int-storage",
        "search-advanced",
        "mobile-bottomnav"
    ]'::jsonb,
    4,
    'Project management tool with task boards, team collaboration, and time tracking',
    '{
        "features": {
            "taskManagement": true,
            "teamCollaboration": true,
            "timeTracking": true,
            "ganttCharts": true,
            "resourcePlanning": true,
            "reporting": true
        }
    }'::jsonb
),
(
    'mobile-first-app',
    'Mobile-First Application',
    'Progressive web app optimized for mobile devices',
    'starter-kits',
    '[
        "mobile-bottomnav",
        "mobile-drawer",
        "mobile-action-sheet",
        "mobile-pull-refresh",
        "auth-passwordless",
        "comm-notifications",
        "ui-toast",
        "search-global",
        "data-cards",
        "user-profile"
    ]'::jsonb,
    3,
    'Mobile-first progressive web application with native-like features and offline support',
    '{
        "features": {
            "pwa": true,
            "offlineSupport": true,
            "pushNotifications": true,
            "appShell": true,
            "gestureSupport": true
        }
    }'::jsonb
)
ON CONFLICT (template_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    components = EXCLUDED.components,
    complexity_score = EXCLUDED.complexity_score,
    use_case = EXCLUDED.use_case,
    configuration = EXCLUDED.configuration,
    updated_at = CURRENT_TIMESTAMP;
-- Navigation, Data Display, Forms, and Dashboard Components Seed Data

INSERT INTO component_library (
    component_id, display_name, category_id, description, icon, 
    complexity_score, configuration, features
) VALUES

-- NAVIGATION COMPONENTS
(
    'nav-navbar',
    'Navigation Bar',
    (SELECT id FROM component_categories WHERE name = 'navigation'),
    'Responsive top navigation with dropdown menus',
    '🧭',
    3,
    '{
        "position": "fixed-top",
        "theme": "light",
        "breakpoint": "768px",
        "menuItems": [],
        "showSearch": true,
        "showNotifications": true,
        "showUserMenu": true,
        "megaMenuSupport": true,
        "stickyOnScroll": true
    }'::jsonb,
    '["responsive-menu", "dropdown-support", "search-integration", "mobile-hamburger", "mega-menu", "sticky-nav"]'::jsonb
),
(
    'nav-sidebar',
    'Sidebar Navigation',
    (SELECT id FROM component_categories WHERE name = 'navigation'),
    'Collapsible side navigation with nested menus',
    '📑',
    3,
    '{
        "defaultState": "expanded",
        "width": "250px",
        "collapsedWidth": "60px",
        "showTooltips": true,
        "allowNesting": true,
        "position": "fixed",
        "theme": "dark",
        "iconPosition": "left"
    }'::jsonb,
    '["collapsible", "nested-menus", "tooltips", "icons", "active-state", "keyboard-navigation"]'::jsonb
),
(
    'nav-breadcrumb',
    'Breadcrumb Navigation',
    (SELECT id FROM component_categories WHERE name = 'navigation'),
    'Hierarchical navigation path indicator',
    '🍞',
    1,
    '{
        "separator": "/",
        "maxItems": 5,
        "showHome": true,
        "truncateLongNames": true,
        "showCurrentPage": true
    }'::jsonb,
    '["auto-generation", "truncation", "custom-separators", "navigation-history"]'::jsonb
),
(
    'nav-footer',
    'Footer',
    (SELECT id FROM component_categories WHERE name = 'navigation'),
    'Site footer with links, social media, and newsletter',
    '🦶',
    2,
    '{
        "sections": ["links", "social", "newsletter", "copyright"],
        "columns": 4,
        "theme": "dark",
        "socialIcons": ["facebook", "twitter", "linkedin", "instagram"],
        "newsletterIntegration": true
    }'::jsonb,
    '["responsive-layout", "social-links", "newsletter-signup", "sitemap", "legal-links"]'::jsonb
),
(
    'nav-tabs',
    'Tab Navigation',
    (SELECT id FROM component_categories WHERE name = 'navigation'),
    'Tabbed content interface with various styles',
    '📑',
    2,
    '{
        "variant": "default",
        "position": "top",
        "allowClosable": false,
        "enableSwipe": true,
        "lazyLoad": true,
        "maxTabs": 10
    }'::jsonb,
    '["tab-switching", "lazy-loading", "swipe-support", "closable-tabs", "overflow-handling"]'::jsonb
),

-- DATA DISPLAY COMPONENTS
(
    'data-table',
    'Data Table',
    (SELECT id FROM component_categories WHERE name = 'data-display'),
    'Advanced data grid with sorting, filtering, and pagination',
    '📊',
    4,
    '{
        "pagination": true,
        "itemsPerPage": 25,
        "sortable": true,
        "filterable": true,
        "searchable": true,
        "exportFormats": ["csv", "excel", "pdf"],
        "columnResize": true,
        "rowSelection": true,
        "virtualScroll": false,
        "stickyHeader": true
    }'::jsonb,
    '["sorting", "filtering", "pagination", "search", "export", "column-resize", "row-selection", "bulk-actions"]'::jsonb
),
(
    'data-cards',
    'Card Grid',
    (SELECT id FROM component_categories WHERE name = 'data-display'),
    'Responsive card layout with multiple display options',
    '🃏',
    2,
    '{
        "layout": "grid",
        "columns": {"desktop": 3, "tablet": 2, "mobile": 1},
        "gap": "20px",
        "animation": "fade-in",
        "lazyLoad": true,
        "showActions": true
    }'::jsonb,
    '["responsive-grid", "masonry-layout", "lazy-loading", "animations", "card-actions"]'::jsonb
),
(
    'data-list',
    'List View',
    (SELECT id FROM component_categories WHERE name = 'data-display'),
    'Vertical list with interactive features',
    '📋',
    3,
    '{
        "variant": "default",
        "showAvatar": true,
        "showActions": true,
        "enableDragReorder": true,
        "infiniteScroll": true,
        "multiSelect": true,
        "groupBy": null
    }'::jsonb,
    '["infinite-scroll", "drag-reorder", "multi-select", "grouping", "search-filter", "bulk-actions"]'::jsonb
),
(
    'data-timeline',
    'Timeline',
    (SELECT id FROM component_categories WHERE name = 'data-display'),
    'Chronological event display with various layouts',
    '⏱️',
    3,
    '{
        "layout": "vertical",
        "showDates": true,
        "enableAnimation": true,
        "groupByDate": true,
        "showConnectors": true,
        "alternating": false
    }'::jsonb,
    '["vertical-timeline", "horizontal-timeline", "animations", "date-grouping", "custom-markers"]'::jsonb
),
(
    'data-kanban',
    'Kanban Board',
    (SELECT id FROM component_categories WHERE name = 'data-display'),
    'Drag-and-drop task board with customizable columns',
    '📋',
    5,
    '{
        "columns": ["todo", "in-progress", "review", "done"],
        "enableDragDrop": true,
        "showWipLimits": true,
        "cardTemplate": "default",
        "showAddCard": true,
        "swimlanes": false,
        "columnCollapse": true
    }'::jsonb,
    '["drag-drop", "swimlanes", "wip-limits", "card-customization", "filters", "column-management"]'::jsonb
),

-- FORM COMPONENTS
(
    'form-contact',
    'Contact Form',
    (SELECT id FROM component_categories WHERE name = 'forms'),
    'Standard contact form with validation and captcha',
    '📧',
    2,
    '{
        "fields": ["name", "email", "subject", "message"],
        "requiredFields": ["name", "email", "message"],
        "enableCaptcha": true,
        "enableFileUpload": true,
        "maxFileSize": 5242880,
        "successMessage": "Thank you for contacting us!",
        "emailNotification": true
    }'::jsonb,
    '["validation", "captcha", "file-upload", "email-notification", "auto-response", "spam-protection"]'::jsonb
),
(
    'form-multi-step',
    'Multi-Step Form',
    (SELECT id FROM component_categories WHERE name = 'forms'),
    'Wizard-style form with progress tracking',
    '🪜',
    4,
    '{
        "showProgressBar": true,
        "progressType": "steps",
        "allowNavigation": true,
        "saveProgress": true,
        "validationTrigger": "onNext",
        "showStepNumbers": true,
        "animationType": "slide"
    }'::jsonb,
    '["step-navigation", "progress-tracking", "validation", "save-draft", "conditional-steps", "review-step"]'::jsonb
),
(
    'form-builder',
    'Dynamic Form Builder',
    (SELECT id FROM component_categories WHERE name = 'forms'),
    'Drag-and-drop form creator with conditional logic',
    '🏗️',
    5,
    '{
        "fieldTypes": ["text", "number", "email", "select", "checkbox", "radio", "date", "file", "textarea", "rating"],
        "enableConditionalLogic": true,
        "enableValidation": true,
        "enablePreview": true,
        "customCSS": true,
        "webhookIntegration": true
    }'::jsonb,
    '["drag-drop-fields", "conditional-logic", "validation-rules", "preview-mode", "json-export", "custom-styling"]'::jsonb
),
(
    'form-survey',
    'Survey Form',
    (SELECT id FROM component_categories WHERE name = 'forms'),
    'Questionnaire with various question types',
    '📊',
    3,
    '{
        "questionTypes": ["multiple-choice", "rating", "scale", "text", "matrix"],
        "enableConditionalLogic": true,
        "showProgress": true,
        "enableScoring": true,
        "anonymousResponses": true,
        "resultsAnalytics": true
    }'::jsonb,
    '["conditional-logic", "scoring", "analytics", "branching", "response-validation", "export-results"]'::jsonb
),
(
    'form-checkout',
    'Checkout Form',
    (SELECT id FROM component_categories WHERE name = 'forms'),
    'E-commerce checkout with payment integration',
    '💳',
    5,
    '{
        "steps": ["shipping", "payment", "review", "confirmation"],
        "paymentMethods": ["card", "paypal", "apple-pay", "google-pay"],
        "enableGuestCheckout": true,
        "savePaymentMethod": true,
        "addressValidation": true,
        "taxCalculation": true
    }'::jsonb,
    '["payment-integration", "address-validation", "tax-calculation", "order-summary", "guest-checkout", "saved-cards"]'::jsonb
),

-- DASHBOARD COMPONENTS
(
    'dash-stats',
    'Statistics Cards',
    (SELECT id FROM component_categories WHERE name = 'dashboard'),
    'KPI metric cards with trends and animations',
    '📈',
    2,
    '{
        "variants": ["simple", "trend", "comparison", "progress"],
        "showTrend": true,
        "trendPeriod": "7d",
        "animateNumbers": true,
        "refreshInterval": 30000,
        "clickable": true,
        "colorScheme": "auto"
    }'::jsonb,
    '["real-time-updates", "trend-indicators", "number-animation", "responsive-grid", "drill-down", "sparklines"]'::jsonb
),
(
    'dash-charts',
    'Charts & Graphs',
    (SELECT id FROM component_categories WHERE name = 'dashboard'),
    'Interactive data visualization components',
    '📊',
    3,
    '{
        "chartTypes": ["line", "bar", "pie", "donut", "area", "scatter", "radar", "heatmap"],
        "library": "recharts",
        "enableZoom": true,
        "enableTooltips": true,
        "enableLegend": true,
        "enableExport": true,
        "responsive": true,
        "animations": true
    }'::jsonb,
    '["multiple-chart-types", "interactivity", "real-time-data", "export-options", "custom-themes", "annotations"]'::jsonb
),
(
    'dash-activity',
    'Activity Feed',
    (SELECT id FROM component_categories WHERE name = 'dashboard'),
    'Real-time activity stream with filters',
    '🎯',
    3,
    '{
        "realTime": true,
        "groupByTime": true,
        "filters": ["type", "user", "date"],
        "maxItems": 50,
        "showAvatars": true,
        "enableActions": true,
        "autoRefresh": true
    }'::jsonb,
    '["real-time-updates", "filters", "notifications", "actions", "infinite-scroll", "grouping"]'::jsonb
),
(
    'dash-calendar',
    'Calendar Widget',
    (SELECT id FROM component_categories WHERE name = 'dashboard'),
    'Event calendar with multiple view options',
    '📅',
    4,
    '{
        "views": ["month", "week", "day", "agenda", "year"],
        "defaultView": "month",
        "enableDragDrop": true,
        "showWeekNumbers": true,
        "firstDayOfWeek": 1,
        "eventColors": true,
        "recurringEvents": true
    }'::jsonb,
    '["multiple-views", "drag-drop-events", "recurring-events", "event-reminders", "calendar-sync", "timezone-support"]'::jsonb
),
(
    'dash-map',
    'Map Integration',
    (SELECT id FROM component_categories WHERE name = 'dashboard'),
    'Interactive maps with markers and overlays',
    '🗺️',
    4,
    '{
        "provider": "mapbox",
        "defaultZoom": 10,
        "enableClustering": true,
        "showSearch": true,
        "enableDrawing": false,
        "heatmapSupport": true,
        "customMarkers": true,
        "offlineSupport": false
    }'::jsonb,
    '["marker-clustering", "heatmaps", "geolocation", "custom-overlays", "route-planning", "geocoding"]'::jsonb
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
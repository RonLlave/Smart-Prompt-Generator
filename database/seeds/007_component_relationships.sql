-- Component Relationships Seed Data
-- Defines dependencies, recommendations, and incompatibilities between components

-- Insert component dependencies (requires relationships)
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
    c1.id,
    c2.id,
    'requires'
FROM component_library c1
CROSS JOIN component_library c2
WHERE 
    -- Two-factor auth requires basic login
    (c1.component_id = 'auth-2fa' AND c2.component_id = 'auth-email-login')
    -- Password reset requires email login
    OR (c1.component_id = 'auth-password-reset' AND c2.component_id = 'auth-email-login')
    -- Session management requires authentication
    OR (c1.component_id = 'auth-session-manager' AND c2.component_id = 'auth-email-login')
    -- Checkout requires shopping cart
    OR (c1.component_id = 'form-checkout' AND c2.component_id = 'ecom-cart')
    -- Product gallery requires product cards
    OR (c1.component_id = 'ecom-product-gallery' AND c2.component_id = 'ecom-product-card')
    -- Reviews require products
    OR (c1.component_id = 'ecom-reviews' AND c2.component_id = 'ecom-product-card')
    -- Wishlist requires products
    OR (c1.component_id = 'ecom-wishlist' AND c2.component_id = 'ecom-product-card')
    -- Admin CRUD requires data table
    OR (c1.component_id = 'admin-crud' AND c2.component_id = 'data-table')
    -- Team management requires user profiles
    OR (c1.component_id = 'user-teams' AND c2.component_id = 'user-profile')
    -- User permissions require RBAC
    OR (c1.component_id = 'user-permissions' AND c2.component_id = 'auth-rbac')
    -- Advanced search requires global search
    OR (c1.component_id = 'search-advanced' AND c2.component_id = 'search-global')
    -- Video call requires chat interface
    OR (c1.component_id = 'comm-video-call' AND c2.component_id = 'comm-chat')
ON CONFLICT (component_id, related_component_id, relationship_type) DO NOTHING;

-- Insert component recommendations
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
    c1.id,
    c2.id,
    'recommends'
FROM component_library c1
CROSS JOIN component_library c2
WHERE 
    -- Email login recommends social login
    (c1.component_id = 'auth-email-login' AND c2.component_id = 'auth-oauth')
    -- Email login recommends 2FA
    OR (c1.component_id = 'auth-email-login' AND c2.component_id = 'auth-2fa')
    -- Email login recommends password reset
    OR (c1.component_id = 'auth-email-login' AND c2.component_id = 'auth-password-reset')
    -- Data table recommends filters
    OR (c1.component_id = 'data-table' AND c2.component_id = 'search-filters')
    -- Data table recommends advanced search
    OR (c1.component_id = 'data-table' AND c2.component_id = 'search-advanced')
    -- Navbar recommends sidebar for complex navigation
    OR (c1.component_id = 'nav-navbar' AND c2.component_id = 'nav-sidebar')
    -- Navbar recommends breadcrumb
    OR (c1.component_id = 'nav-navbar' AND c2.component_id = 'nav-breadcrumb')
    -- Shopping cart recommends product filters
    OR (c1.component_id = 'ecom-cart' AND c2.component_id = 'ecom-filters')
    -- Product cards recommend wishlist
    OR (c1.component_id = 'ecom-product-card' AND c2.component_id = 'ecom-wishlist')
    -- Charts recommend stats cards
    OR (c1.component_id = 'dash-charts' AND c2.component_id = 'dash-stats')
    -- User profile recommends settings
    OR (c1.component_id = 'user-profile' AND c2.component_id = 'user-settings')
    -- Chat recommends notifications
    OR (c1.component_id = 'comm-chat' AND c2.component_id = 'comm-notifications')
    -- Comments recommend notifications
    OR (c1.component_id = 'comm-comments' AND c2.component_id = 'comm-notifications')
    -- Admin dashboard recommends activity logs
    OR (c1.component_id = 'admin-dashboard' AND c2.component_id = 'admin-logs')
    -- Payment integration recommends security audit
    OR (c1.component_id = 'int-payment' AND c2.component_id = 'sec-audit')
    -- File storage recommends image carousel
    OR (c1.component_id = 'int-storage' AND c2.component_id = 'ui-carousel')
    -- Form builder recommends multi-step form
    OR (c1.component_id = 'form-builder' AND c2.component_id = 'form-multi-step')
    -- Mobile drawer recommends bottom nav
    OR (c1.component_id = 'mobile-drawer' AND c2.component_id = 'mobile-bottomnav')
    -- Security audit recommends encryption
    OR (c1.component_id = 'sec-audit' AND c2.component_id = 'sec-encryption')
ON CONFLICT (component_id, related_component_id, relationship_type) DO NOTHING;

-- Insert component incompatibilities
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
    c1.id,
    c2.id,
    'incompatible'
FROM component_library c1
CROSS JOIN component_library c2
WHERE 
    -- Magic link login incompatible with password-based auth
    (c1.component_id = 'auth-passwordless' AND c2.component_id = 'auth-password-reset')
    -- Bottom navigation incompatible with sidebar on mobile
    OR (c1.component_id = 'mobile-bottomnav' AND c2.component_id = 'nav-sidebar')
    -- Different payment providers might conflict
    OR (c1.component_id = 'int-payment' AND c2.component_id = 'form-checkout' AND c1.id != c2.id)
ON CONFLICT (component_id, related_component_id, relationship_type) DO NOTHING;

-- Create bidirectional relationships for recommendations
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
    related_component_id,
    component_id,
    'recommends'
FROM component_relationships
WHERE relationship_type = 'recommends'
ON CONFLICT (component_id, related_component_id, relationship_type) DO NOTHING;
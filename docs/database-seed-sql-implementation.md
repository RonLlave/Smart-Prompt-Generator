# Database Seed SQL Implementation

## Instructions for Database Assistant

Use these SQL scripts to populate the Visual Prompt Builder database with default project features. Execute in order.

## 1. Create Component Library Tables

```sql
-- Component categories table
CREATE TABLE IF NOT EXISTS component_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component library table
CREATE TABLE IF NOT EXISTS component_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES component_categories(id),
  description TEXT,
  icon VARCHAR(50),
  complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 5),
  is_premium BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  browser_support JSONB DEFAULT '{"chrome": true, "firefox": true, "safari": true, "edge": true}',
  mobile_ready BOOLEAN DEFAULT true,
  accessibility_compliant BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature templates (bundles of components)
CREATE TABLE IF NOT EXISTS feature_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  components JSONB NOT NULL DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  complexity_score INTEGER DEFAULT 1,
  use_case TEXT,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component relationships
CREATE TABLE IF NOT EXISTS component_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES component_library(id),
  related_component_id UUID REFERENCES component_library(id),
  relationship_type VARCHAR(50) NOT NULL, -- 'requires', 'recommends', 'incompatible'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(component_id, related_component_id, relationship_type)
);

-- Indexes
CREATE INDEX idx_component_library_category ON component_library(category_id);
CREATE INDEX idx_component_library_active ON component_library(is_active);
CREATE INDEX idx_component_library_component_id ON component_library(component_id);
CREATE INDEX idx_feature_templates_active ON feature_templates(is_active);
```

## 2. Insert Component Categories

```sql
INSERT INTO component_categories (name, display_name, description, icon, display_order) VALUES
('authentication', 'Authentication & Authorization', 'User authentication and access control components', '🔐', 1),
('navigation', 'Navigation & Layout', 'Navigation bars, menus, and layout components', '🧭', 2),
('data-display', 'Data Display', 'Tables, lists, and data visualization components', '📊', 3),
('forms', 'Forms & Input', 'Form components and input fields', '📝', 4),
('dashboard', 'Dashboard & Analytics', 'Dashboard widgets and analytics components', '🎛️', 5),
('ecommerce', 'E-commerce', 'Shopping cart, products, and payment components', '🛍️', 6),
('communication', 'Communication', 'Chat, comments, and notification components', '💬', 7),
('user-management', 'User Management', 'User profiles, settings, and team components', '👤', 8),
('search', 'Search & Discovery', 'Search interfaces and filtering components', '🔍', 9),
('mobile', 'Mobile-First', 'Mobile-optimized components', '📱', 10),
('ui-elements', 'UI Elements', 'Common UI components and widgets', '🎨', 11),
('admin', 'Admin & Management', 'Administrative interfaces and tools', '🔧', 12),
('integrations', 'Integrations', 'Third-party service integrations', '🔌', 13),
('security', 'Security & Compliance', 'Security and compliance components', '🛡️', 14);
```

## 3. Insert Component Library Data

```sql
-- Authentication Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'auth-email-login',
  'Email/Password Login',
  (SELECT id FROM component_categories WHERE name = 'authentication'),
  'Standard login form with email and password fields',
  '📧',
  2,
  '{
    "fields": ["email", "password"],
    "showRememberMe": true,
    "showForgotPassword": true,
    "enablePasswordVisibility": true,
    "validationRules": {
      "email": "required|email",
      "password": "required|min:8"
    }
  }'::jsonb,
  '["form-validation", "password-toggle", "remember-me", "error-handling"]'::jsonb
),
(
  'auth-social-login',
  'Social Login Buttons',
  (SELECT id FROM component_categories WHERE name = 'authentication'),
  'OAuth login with multiple providers',
  '🔗',
  3,
  '{
    "providers": ["google", "github", "facebook", "twitter"],
    "buttonStyle": "default",
    "showProviderIcon": true,
    "autoLinkAccounts": false
  }'::jsonb,
  '["oauth-integration", "provider-selection", "account-linking"]'::jsonb
),
(
  'auth-two-factor',
  'Two-Factor Authentication',
  (SELECT id FROM component_categories WHERE name = 'authentication'),
  'SMS and authenticator app 2FA',
  '🔐',
  4,
  '{
    "methods": ["sms", "authenticator", "email"],
    "codeLength": 6,
    "codeExpiry": 300,
    "maxAttempts": 3
  }'::jsonb,
  '["sms-verification", "totp", "backup-codes", "qr-generation"]'::jsonb
);

-- Navigation Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'nav-responsive-navbar',
  'Responsive Navigation Bar',
  (SELECT id FROM component_categories WHERE name = 'navigation'),
  'Adaptive navigation bar with mobile menu',
  '🧭',
  3,
  '{
    "position": "fixed-top",
    "theme": "light",
    "breakpoint": "768px",
    "menuItems": [],
    "showSearch": true,
    "showNotifications": true
  }'::jsonb,
  '["responsive-menu", "dropdown-support", "search-integration", "mobile-hamburger"]'::jsonb
),
(
  'nav-sidebar',
  'Collapsible Sidebar',
  (SELECT id FROM component_categories WHERE name = 'navigation'),
  'Vertical navigation sidebar with nested menus',
  '📑',
  3,
  '{
    "defaultState": "expanded",
    "width": "250px",
    "collapsedWidth": "60px",
    "showTooltips": true,
    "allowNesting": true
  }'::jsonb,
  '["collapsible", "nested-menus", "tooltips", "icons", "active-state"]'::jsonb
);

-- Data Display Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'data-advanced-table',
  'Advanced Data Table',
  (SELECT id FROM component_categories WHERE name = 'data-display'),
  'Feature-rich data table with sorting, filtering, and pagination',
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
    "rowSelection": true
  }'::jsonb,
  '["sorting", "filtering", "pagination", "search", "export", "column-resize", "row-selection"]'::jsonb
),
(
  'data-kanban-board',
  'Kanban Board',
  (SELECT id FROM component_categories WHERE name = 'data-display'),
  'Drag-and-drop task management board',
  '📋',
  5,
  '{
    "columns": ["todo", "in-progress", "review", "done"],
    "enableDragDrop": true,
    "showWipLimits": true,
    "cardTemplate": "default",
    "showAddCard": true
  }'::jsonb,
  '["drag-drop", "swimlanes", "wip-limits", "card-customization", "filters"]'::jsonb
);

-- Form Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'form-multi-step',
  'Multi-Step Form Wizard',
  (SELECT id FROM component_categories WHERE name = 'forms'),
  'Step-by-step form with progress indicator',
  '📝',
  4,
  '{
    "showProgressBar": true,
    "allowNavigation": true,
    "saveProgress": true,
    "validationTrigger": "onNext",
    "showStepNumbers": true
  }'::jsonb,
  '["step-navigation", "progress-tracking", "validation", "save-draft", "conditional-steps"]'::jsonb
),
(
  'form-dynamic-builder',
  'Dynamic Form Builder',
  (SELECT id FROM component_categories WHERE name = 'forms'),
  'Drag-and-drop form creation tool',
  '🏗️',
  5,
  '{
    "fieldTypes": ["text", "number", "email", "select", "checkbox", "radio", "date", "file", "textarea"],
    "enableConditionalLogic": true,
    "enableValidation": true,
    "enablePreview": true
  }'::jsonb,
  '["drag-drop-fields", "conditional-logic", "validation-rules", "preview-mode", "json-export"]'::jsonb
);

-- Dashboard Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'dash-metric-cards',
  'KPI Metric Cards',
  (SELECT id FROM component_categories WHERE name = 'dashboard'),
  'Statistical cards with trends and comparisons',
  '📈',
  2,
  '{
    "showTrend": true,
    "showComparison": true,
    "animateNumbers": true,
    "refreshInterval": 30000,
    "cardVariants": ["simple", "detailed", "mini"]
  }'::jsonb,
  '["real-time-updates", "trend-indicators", "animations", "responsive-grid"]'::jsonb
),
(
  'dash-charts',
  'Interactive Charts',
  (SELECT id FROM component_categories WHERE name = 'dashboard'),
  'Various chart types with interactivity',
  '📊',
  3,
  '{
    "chartTypes": ["line", "bar", "pie", "area", "scatter", "radar"],
    "enableZoom": true,
    "enableTooltips": true,
    "enableLegend": true,
    "responsive": true
  }'::jsonb,
  '["multiple-chart-types", "interactivity", "real-time-data", "export-options"]'::jsonb
);

-- E-commerce Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'ecom-product-card',
  'Product Display Card',
  (SELECT id FROM component_categories WHERE name = 'ecommerce'),
  'Product card with image, price, and actions',
  '🛍️',
  2,
  '{
    "showRating": true,
    "showQuickView": true,
    "showWishlist": true,
    "showCompare": true,
    "imageHoverEffect": "zoom",
    "priceFormat": "currency"
  }'::jsonb,
  '["image-gallery", "quick-actions", "price-display", "ratings", "responsive"]'::jsonb
),
(
  'ecom-shopping-cart',
  'Shopping Cart',
  (SELECT id FROM component_categories WHERE name = 'ecommerce'),
  'Full-featured shopping cart with mini-cart',
  '🛒',
  4,
  '{
    "enableMiniCart": true,
    "showSaveForLater": true,
    "enablePromoCodes": true,
    "calculateShipping": true,
    "persistCart": true
  }'::jsonb,
  '["cart-management", "quantity-update", "promo-codes", "save-for-later", "mini-cart"]'::jsonb
);

-- Communication Components
INSERT INTO component_library (
  component_id, display_name, category_id, description, icon, 
  complexity_score, configuration, features
) VALUES
(
  'comm-chat-interface',
  'Real-time Chat',
  (SELECT id FROM component_categories WHERE name = 'communication'),
  'Complete chat interface with real-time messaging',
  '💬',
  5,
  '{
    "enableRealTime": true,
    "supportFileSharing": true,
    "enableTypingIndicator": true,
    "enableReadReceipts": true,
    "maxFileSize": 10485760,
    "supportedFileTypes": ["image", "document", "video"]
  }'::jsonb,
  '["real-time-messaging", "file-sharing", "typing-indicators", "read-receipts", "emoji-support"]'::jsonb
),
(
  'comm-notification-center',
  'Notification System',
  (SELECT id FROM component_categories WHERE name = 'communication'),
  'In-app notification management',
  '🔔',
  3,
  '{
    "notificationTypes": ["info", "success", "warning", "error"],
    "position": "top-right",
    "enableGrouping": true,
    "persistNotifications": true,
    "soundEnabled": false
  }'::jsonb,
  '["toast-notifications", "notification-center", "grouping", "actions", "persistence"]'::jsonb
);
```

## 4. Insert Feature Templates

```sql
INSERT INTO feature_templates (
  template_id, name, description, category, components, complexity_score, use_case
) VALUES
(
  'saas-starter',
  'SaaS Starter Pack',
  'Complete SaaS application foundation',
  'starter-kits',
  '[
    "auth-email-login",
    "auth-social-login",
    "nav-responsive-navbar",
    "nav-sidebar",
    "dash-metric-cards",
    "dash-charts",
    "user-profile",
    "user-settings",
    "admin-dashboard"
  ]'::jsonb,
  4,
  'Perfect for launching a new SaaS product with user authentication, dashboard, and admin features'
),
(
  'ecommerce-essential',
  'E-commerce Essentials',
  'Core e-commerce functionality bundle',
  'starter-kits',
  '[
    "ecom-product-card",
    "ecom-shopping-cart",
    "ecom-product-gallery",
    "ecom-checkout",
    "search-filters",
    "data-advanced-table",
    "auth-email-login"
  ]'::jsonb,
  4,
  'Everything needed to start selling products online'
),
(
  'social-platform',
  'Social Platform Kit',
  'Social networking features bundle',
  'starter-kits',
  '[
    "user-profile",
    "comm-chat-interface",
    "comm-comments",
    "comm-notification-center",
    "data-activity-feed",
    "search-global"
  ]'::jsonb,
  5,
  'Build a social platform with user interactions and real-time features'
);
```

## 5. Insert Component Relationships

```sql
-- Define component dependencies and relationships
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
  c1.id,
  c2.id,
  'requires'
FROM component_library c1
CROSS JOIN component_library c2
WHERE 
  (c1.component_id = 'auth-two-factor' AND c2.component_id = 'auth-email-login')
  OR (c1.component_id = 'ecom-checkout' AND c2.component_id = 'ecom-shopping-cart')
  OR (c1.component_id = 'admin-crud' AND c2.component_id = 'data-advanced-table');

-- Define recommended combinations
INSERT INTO component_relationships (component_id, related_component_id, relationship_type)
SELECT 
  c1.id,
  c2.id,
  'recommends'
FROM component_library c1
CROSS JOIN component_library c2
WHERE 
  (c1.component_id = 'auth-email-login' AND c2.component_id = 'auth-social-login')
  OR (c1.component_id = 'data-advanced-table' AND c2.component_id = 'search-filters')
  OR (c1.component_id = 'nav-sidebar' AND c2.component_id = 'nav-responsive-navbar');
```

## 6. Create Helper Functions

```sql
-- Function to get all components for a category
CREATE OR REPLACE FUNCTION get_components_by_category(category_name VARCHAR)
RETURNS TABLE (
  component_id VARCHAR,
  display_name VARCHAR,
  description TEXT,
  complexity_score INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.component_id,
    cl.display_name,
    cl.description,
    cl.complexity_score,
    cl.features
  FROM component_library cl
  JOIN component_categories cc ON cl.category_id = cc.id
  WHERE cc.name = category_name
  AND cl.is_active = true
  ORDER BY cl.display_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get component with all relationships
CREATE OR REPLACE FUNCTION get_component_details(comp_id VARCHAR)
RETURNS TABLE (
  component JSONB,
  requires JSONB,
  recommends JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH component_data AS (
    SELECT row_to_json(cl.*) as component_json
    FROM component_library cl
    WHERE cl.component_id = comp_id
  ),
  required_components AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'component_id', cl2.component_id,
        'display_name', cl2.display_name
      )
    ) as requires_json
    FROM component_library cl1
    JOIN component_relationships cr ON cl1.id = cr.component_id
    JOIN component_library cl2 ON cr.related_component_id = cl2.id
    WHERE cl1.component_id = comp_id
    AND cr.relationship_type = 'requires'
  ),
  recommended_components AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'component_id', cl2.component_id,
        'display_name', cl2.display_name
      )
    ) as recommends_json
    FROM component_library cl1
    JOIN component_relationships cr ON cl1.id = cr.component_id
    JOIN component_library cl2 ON cr.related_component_id = cl2.id
    WHERE cl1.component_id = comp_id
    AND cr.relationship_type = 'recommends'
  )
  SELECT 
    cd.component_json,
    COALESCE(req.requires_json, '[]'::jsonb),
    COALESCE(rec.recommends_json, '[]'::jsonb)
  FROM component_data cd
  CROSS JOIN LATERAL (SELECT * FROM required_components) req
  CROSS JOIN LATERAL (SELECT * FROM recommended_components) rec;
END;
$$ LANGUAGE plpgsql;
```

## Implementation Notes for Database Assistant

1. **Execute in transaction blocks** to ensure data integrity
2. **Create backups** before running seed scripts
3. **Verify foreign key constraints** are properly set
4. **Index all searchable fields** for performance
5. **Test component relationships** after insertion
6. **Set up triggers** for updated_at timestamps
7. **Consider partitioning** for large component libraries
8. **Implement versioning** for component updates

This seed data provides a comprehensive foundation for the Visual Prompt Builder's component library.
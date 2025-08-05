-- Seed data for component categories
-- These categories organize the component library

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
('security', 'Security & Compliance', 'Security and compliance components', '🛡️', 14)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    updated_at = CURRENT_TIMESTAMP;
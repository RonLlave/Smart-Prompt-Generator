-- Component Library Tables for Visual Prompt Builder
-- This migration creates the foundation for the component library system

-- Component categories table
CREATE TABLE IF NOT EXISTS component_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Component library table
CREATE TABLE IF NOT EXISTS component_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES component_categories(id) ON DELETE SET NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 5),
    use_case TEXT,
    preview_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Component relationships
CREATE TABLE IF NOT EXISTS component_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES component_library(id) ON DELETE CASCADE,
    related_component_id UUID REFERENCES component_library(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('requires', 'recommends', 'incompatible')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(component_id, related_component_id, relationship_type),
    CHECK (component_id != related_component_id)
);

-- Indexes for performance
CREATE INDEX idx_component_library_category ON component_library(category_id);
CREATE INDEX idx_component_library_active ON component_library(is_active);
CREATE INDEX idx_component_library_component_id ON component_library(component_id);
CREATE INDEX idx_component_library_complexity ON component_library(complexity_score);
CREATE INDEX idx_feature_templates_active ON feature_templates(is_active);
CREATE INDEX idx_feature_templates_template_id ON feature_templates(template_id);
CREATE INDEX idx_component_relationships_component ON component_relationships(component_id);
CREATE INDEX idx_component_relationships_related ON component_relationships(related_component_id);

-- Apply updated_at triggers
CREATE TRIGGER update_component_categories_updated_at BEFORE UPDATE ON component_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_component_library_updated_at BEFORE UPDATE ON component_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feature_templates_updated_at BEFORE UPDATE ON feature_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies (components are read-only for regular users, writable only by admins)
ALTER TABLE component_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_relationships ENABLE ROW LEVEL SECURITY;

-- Everyone can read component data
CREATE POLICY component_categories_read_all ON component_categories
    FOR SELECT USING (true);

CREATE POLICY component_library_read_all ON component_library
    FOR SELECT USING (is_active = true);

CREATE POLICY feature_templates_read_all ON feature_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY component_relationships_read_all ON component_relationships
    FOR SELECT USING (true);

-- Only admins can modify component data
CREATE POLICY component_categories_admin_write ON component_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

CREATE POLICY component_library_admin_write ON component_library
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

CREATE POLICY feature_templates_admin_write ON feature_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

CREATE POLICY component_relationships_admin_write ON component_relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

-- Grant permissions
GRANT SELECT ON component_categories TO authenticated;
GRANT SELECT ON component_library TO authenticated;
GRANT SELECT ON feature_templates TO authenticated;
GRANT SELECT ON component_relationships TO authenticated;

-- Admin permissions would be granted separately
-- GRANT ALL ON component_categories TO admin_role;
-- GRANT ALL ON component_library TO admin_role;
-- GRANT ALL ON feature_templates TO admin_role;
-- GRANT ALL ON component_relationships TO admin_role;
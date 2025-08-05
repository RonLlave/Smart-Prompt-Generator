-- Helper Functions for Component Library Queries

-- Function to get all components for a category
CREATE OR REPLACE FUNCTION get_components_by_category(category_name VARCHAR)
RETURNS TABLE (
    component_id VARCHAR,
    display_name VARCHAR,
    description TEXT,
    complexity_score INTEGER,
    features JSONB,
    icon VARCHAR,
    is_premium BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.component_id,
        cl.display_name,
        cl.description,
        cl.complexity_score,
        cl.features,
        cl.icon,
        cl.is_premium
    FROM component_library cl
    JOIN component_categories cc ON cl.category_id = cc.id
    WHERE cc.name = category_name
    AND cl.is_active = true
    ORDER BY cl.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get component with all relationships
CREATE OR REPLACE FUNCTION get_component_details(comp_id VARCHAR)
RETURNS TABLE (
    component JSONB,
    requires JSONB,
    recommends JSONB,
    incompatible JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH component_data AS (
        SELECT jsonb_build_object(
            'id', cl.id,
            'component_id', cl.component_id,
            'display_name', cl.display_name,
            'description', cl.description,
            'category', cc.name,
            'icon', cl.icon,
            'complexity_score', cl.complexity_score,
            'is_premium', cl.is_premium,
            'configuration', cl.configuration,
            'features', cl.features,
            'browser_support', cl.browser_support,
            'mobile_ready', cl.mobile_ready,
            'accessibility_compliant', cl.accessibility_compliant
        ) as component_json
        FROM component_library cl
        JOIN component_categories cc ON cl.category_id = cc.id
        WHERE cl.component_id = comp_id
    ),
    required_components AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'component_id', cl2.component_id,
                'display_name', cl2.display_name,
                'icon', cl2.icon
            ) ORDER BY cl2.display_name
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
                'display_name', cl2.display_name,
                'icon', cl2.icon
            ) ORDER BY cl2.display_name
        ) as recommends_json
        FROM component_library cl1
        JOIN component_relationships cr ON cl1.id = cr.component_id
        JOIN component_library cl2 ON cr.related_component_id = cl2.id
        WHERE cl1.component_id = comp_id
        AND cr.relationship_type = 'recommends'
    ),
    incompatible_components AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'component_id', cl2.component_id,
                'display_name', cl2.display_name,
                'icon', cl2.icon
            ) ORDER BY cl2.display_name
        ) as incompatible_json
        FROM component_library cl1
        JOIN component_relationships cr ON cl1.id = cr.component_id
        JOIN component_library cl2 ON cr.related_component_id = cl2.id
        WHERE cl1.component_id = comp_id
        AND cr.relationship_type = 'incompatible'
    )
    SELECT 
        cd.component_json,
        COALESCE(req.requires_json, '[]'::jsonb),
        COALESCE(rec.recommends_json, '[]'::jsonb),
        COALESCE(inc.incompatible_json, '[]'::jsonb)
    FROM component_data cd
    CROSS JOIN LATERAL (SELECT * FROM required_components) req
    CROSS JOIN LATERAL (SELECT * FROM recommended_components) rec
    CROSS JOIN LATERAL (SELECT * FROM incompatible_components) inc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search components by features or keywords
CREATE OR REPLACE FUNCTION search_components(search_term TEXT)
RETURNS TABLE (
    component_id VARCHAR,
    display_name VARCHAR,
    category_name VARCHAR,
    description TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.component_id,
        cl.display_name,
        cc.name as category_name,
        cl.description,
        ts_rank(
            to_tsvector('english', 
                cl.display_name || ' ' || 
                cl.description || ' ' || 
                cl.features::text
            ),
            plainto_tsquery('english', search_term)
        ) as relevance
    FROM component_library cl
    JOIN component_categories cc ON cl.category_id = cc.id
    WHERE cl.is_active = true
    AND (
        cl.display_name ILIKE '%' || search_term || '%'
        OR cl.description ILIKE '%' || search_term || '%'
        OR cl.features::text ILIKE '%' || search_term || '%'
    )
    ORDER BY relevance DESC, cl.display_name
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feature template with expanded component details
CREATE OR REPLACE FUNCTION get_feature_template_details(template_id_param VARCHAR)
RETURNS TABLE (
    template JSONB,
    components JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH template_data AS (
        SELECT 
            jsonb_build_object(
                'template_id', ft.template_id,
                'name', ft.name,
                'description', ft.description,
                'use_case', ft.use_case,
                'complexity_score', ft.complexity_score,
                'configuration', ft.configuration
            ) as template_json,
            ft.components as component_ids
        FROM feature_templates ft
        WHERE ft.template_id = template_id_param
        AND ft.is_active = true
    ),
    expanded_components AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'component_id', cl.component_id,
                'display_name', cl.display_name,
                'category', cc.name,
                'icon', cl.icon,
                'complexity_score', cl.complexity_score,
                'description', cl.description
            ) ORDER BY array_position(
                (SELECT component_ids FROM template_data)::text[], 
                cl.component_id
            )
        ) as components_json
        FROM component_library cl
        JOIN component_categories cc ON cl.category_id = cc.id
        WHERE cl.component_id = ANY(
            SELECT jsonb_array_elements_text(component_ids) 
            FROM template_data
        )
    )
    SELECT 
        td.template_json,
        ec.components_json
    FROM template_data td
    CROSS JOIN expanded_components ec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate component compatibility
CREATE OR REPLACE FUNCTION check_component_compatibility(component_ids VARCHAR[])
RETURNS TABLE (
    is_compatible BOOLEAN,
    conflicts JSONB,
    missing_dependencies JSONB
) AS $$
DECLARE
    conflicts_found JSONB;
    missing_deps JSONB;
BEGIN
    -- Check for incompatible components
    WITH incompatibilities AS (
        SELECT 
            jsonb_build_object(
                'component1', cl1.component_id,
                'component2', cl2.component_id,
                'message', cl1.display_name || ' is incompatible with ' || cl2.display_name
            ) as conflict
        FROM component_library cl1
        JOIN component_relationships cr ON cl1.id = cr.component_id
        JOIN component_library cl2 ON cr.related_component_id = cl2.id
        WHERE cl1.component_id = ANY(component_ids)
        AND cl2.component_id = ANY(component_ids)
        AND cr.relationship_type = 'incompatible'
    )
    SELECT COALESCE(jsonb_agg(conflict), '[]'::jsonb) INTO conflicts_found
    FROM incompatibilities;
    
    -- Check for missing dependencies
    WITH required_deps AS (
        SELECT DISTINCT cl2.component_id, cl2.display_name
        FROM component_library cl1
        JOIN component_relationships cr ON cl1.id = cr.component_id
        JOIN component_library cl2 ON cr.related_component_id = cl2.id
        WHERE cl1.component_id = ANY(component_ids)
        AND cr.relationship_type = 'requires'
        AND cl2.component_id != ALL(component_ids)
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'component_id', component_id,
                'display_name', display_name
            )
        ), 
        '[]'::jsonb
    ) INTO missing_deps
    FROM required_deps;
    
    RETURN QUERY
    SELECT 
        jsonb_array_length(conflicts_found) = 0 AND jsonb_array_length(missing_deps) = 0,
        conflicts_found,
        missing_deps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get component statistics
CREATE OR REPLACE FUNCTION get_component_statistics()
RETURNS TABLE (
    total_components BIGINT,
    total_categories BIGINT,
    total_templates BIGINT,
    complexity_distribution JSONB,
    category_counts JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT cl.id) as total_components,
            COUNT(DISTINCT cc.id) as total_categories,
            COUNT(DISTINCT ft.id) as total_templates
        FROM component_library cl
        CROSS JOIN component_categories cc
        CROSS JOIN feature_templates ft
        WHERE cl.is_active = true
        AND ft.is_active = true
    ),
    complexity_dist AS (
        SELECT jsonb_object_agg(
            complexity_score::text, 
            count
        ) as distribution
        FROM (
            SELECT complexity_score, COUNT(*) as count
            FROM component_library
            WHERE is_active = true
            GROUP BY complexity_score
        ) cd
    ),
    category_dist AS (
        SELECT jsonb_object_agg(
            cc.name,
            count
        ) as category_counts
        FROM (
            SELECT category_id, COUNT(*) as count
            FROM component_library
            WHERE is_active = true
            GROUP BY category_id
        ) counts
        JOIN component_categories cc ON counts.category_id = cc.id
    )
    SELECT 
        s.total_components,
        s.total_categories,
        s.total_templates,
        cd.distribution,
        cat.category_counts
    FROM stats s
    CROSS JOIN complexity_dist cd
    CROSS JOIN category_dist cat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_components_by_category(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_component_details(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION search_components(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_template_details(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION check_component_compatibility(VARCHAR[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_component_statistics() TO authenticated;
# Database Assistant - Seed Data Implementation Instructions

## Overview

You have been provided with comprehensive seed data specifications for the Visual Prompt Builder's component library. Your task is to implement these in the Supabase database.

## Files Provided

1. **`database-seed-features-prompt.md`** - Conceptual overview of all components and features to be seeded
2. **`database-seed-sql-implementation.md`** - SQL implementation with table structures and insert statements

## Implementation Steps

### 1. Database Preparation
- [ ] Review existing database schema
- [ ] Create backup of current database state
- [ ] Ensure UUID extension is enabled
- [ ] Verify Supabase connection

### 2. Table Creation
- [ ] Create `component_categories` table
- [ ] Create `component_library` table  
- [ ] Create `feature_templates` table
- [ ] Create `component_relationships` table
- [ ] Create all necessary indexes

### 3. Seed Data Insertion
- [ ] Insert all component categories (14 categories)
- [ ] Insert authentication components
- [ ] Insert navigation components
- [ ] Insert data display components
- [ ] Insert form components
- [ ] Insert dashboard components
- [ ] Insert e-commerce components
- [ ] Insert communication components
- [ ] Insert remaining component categories
- [ ] Insert feature templates (starter kits)
- [ ] Insert component relationships

### 4. Functions & Helpers
- [ ] Create `get_components_by_category` function
- [ ] Create `get_component_details` function
- [ ] Create any additional helper functions
- [ ] Set up update triggers for timestamps

### 5. Security & Optimization
- [ ] Apply Row Level Security policies
- [ ] Ensure proper indexing for performance
- [ ] Set up appropriate access controls
- [ ] Optimize for query performance

### 6. Testing & Validation
- [ ] Test component retrieval queries
- [ ] Verify relationships are properly linked
- [ ] Check that all categories have components
- [ ] Validate JSON configurations
- [ ] Test helper functions

## Key Considerations

### Data Integrity
- All components must have valid category references
- Component IDs must be unique and descriptive
- JSON fields should be properly formatted
- Relationships should be bidirectional where appropriate

### Performance
- Index frequently queried fields
- Consider materialized views for complex queries
- Optimize JSON queries with proper operators
- Plan for scalability with more components

### Security
- Apply RLS policies to prevent unauthorized access
- Validate all JSON inputs
- Ensure component configurations are safe
- Protect premium components appropriately

## Expected Outcomes

After implementation, the database should contain:
- **14 component categories** covering all aspects of web development
- **50+ individual components** ready for drag-and-drop use
- **3+ feature templates** for quick project starts
- **Relationship mappings** between related components
- **Helper functions** for efficient data retrieval

## Reporting

Please update your status in `/agent-sessions/assistants-current-status/ai-database.md` with:
- Progress on each implementation step
- Any challenges or modifications needed
- Performance metrics after seeding
- Suggestions for improvements

This seed data will form the foundation of the Visual Prompt Builder's component library, enabling users to quickly build web applications by dragging and dropping pre-configured components.
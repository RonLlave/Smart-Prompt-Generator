# Component Library Seed Data

## Overview

This directory contains seed data for the Visual Prompt Builder's component library system. The seed data provides a comprehensive collection of pre-built components that users can drag and drop to build their applications.

## Seed Files

### 1. `001_component_categories.sql`
Creates 14 component categories that organize the library:
- Authentication & Authorization
- Navigation & Layout
- Data Display
- Forms & Input
- Dashboard & Analytics
- E-commerce
- Communication
- User Management
- Search & Discovery
- Mobile-First
- UI Elements
- Admin & Management
- Integrations
- Security & Compliance

### 2. `002_authentication_components.sql`
Seeds 8 authentication components including:
- Email/Password Login
- User Registration
- Social Login (OAuth)
- Two-Factor Authentication
- Magic Link Login
- Role-Based Access Control
- Password Reset
- Session Management

### 3. `003_navigation_data_forms_dashboard_components.sql`
Seeds 20 components across navigation, data display, forms, and dashboard categories:
- Navigation: Navbar, Sidebar, Breadcrumb, Footer, Tabs
- Data Display: Table, Cards, List, Timeline, Kanban
- Forms: Contact, Multi-Step, Builder, Survey, Checkout
- Dashboard: Stats, Charts, Activity Feed, Calendar, Maps

### 4. `004_ecommerce_communication_user_components.sql`
Seeds 17 components for e-commerce, communication, and user management:
- E-commerce: Product Card, Cart, Gallery, Reviews, Filters, Wishlist
- Communication: Chat, Comments, Notifications, Inbox, Video Call
- User Management: Profile, Settings, Directory, Teams, Permissions

### 5. `005_search_mobile_ui_admin_integration_security_components.sql`
Seeds 22 components for remaining categories:
- Search: Global Search, Advanced Search, Filter Panel
- Mobile: Bottom Nav, Drawer, Action Sheet, Pull Refresh
- UI: Modal, Toast, Carousel, Accordion, Stepper
- Admin: Dashboard, CRUD, Logs, Settings
- Integrations: Payment, Analytics, Email, Storage
- Security: CAPTCHA, Cookie Consent, Audit Log, Encryption

### 6. `006_feature_templates.sql`
Seeds 10 pre-configured feature templates (starter kits):
- SaaS Starter Pack
- E-commerce Essentials
- Social Platform Kit
- Business Dashboard
- Content Management System
- Marketplace Platform
- E-Learning Platform
- Healthcare Portal
- Project Management Tool
- Mobile-First Application

### 7. `007_component_relationships.sql`
Defines relationships between components:
- **Dependencies**: Components that require others to function
- **Recommendations**: Components that work well together
- **Incompatibilities**: Components that conflict with each other

## Total Components Seeded

- **Categories**: 14
- **Components**: 82
- **Feature Templates**: 10
- **Relationships**: ~50

## How to Use

### Running All Seeds
```bash
# Run all seed files in order
for file in database/seeds/*.sql; do
  psql -U postgres -d your_database -f "$file"
done
```

### Running Individual Seeds
```bash
# Run a specific seed file
psql -U postgres -d your_database -f database/seeds/001_component_categories.sql
```

### Resetting Seed Data
```sql
-- Clear all component data (use with caution)
TRUNCATE TABLE component_relationships CASCADE;
TRUNCATE TABLE feature_templates CASCADE;
TRUNCATE TABLE component_library CASCADE;
TRUNCATE TABLE component_categories CASCADE;
```

## Helper Functions

The migration `008_component_helper_functions.sql` provides useful functions:

### Get Components by Category
```sql
SELECT * FROM get_components_by_category('authentication');
```

### Get Component Details with Relationships
```sql
SELECT * FROM get_component_details('auth-email-login');
```

### Search Components
```sql
SELECT * FROM search_components('chat');
```

### Get Feature Template Details
```sql
SELECT * FROM get_feature_template_details('saas-starter');
```

### Check Component Compatibility
```sql
SELECT * FROM check_component_compatibility(
  ARRAY['auth-email-login', 'auth-passwordless']
);
```

### Get Component Statistics
```sql
SELECT * FROM get_component_statistics();
```

## Component Configuration

Each component includes:
- **Basic Info**: ID, name, description, icon
- **Complexity Score**: 1-5 rating of implementation difficulty
- **Configuration**: Default settings and options
- **Features**: List of included features
- **Browser Support**: Compatibility information
- **Mobile Ready**: Mobile optimization status
- **Accessibility**: WCAG compliance status

## Feature Templates

Templates bundle multiple components for common use cases:
- Each template includes 10-15 related components
- Provides default configuration for the use case
- Includes complexity scoring
- Describes the target use case

## Customization

To add custom components:

1. Insert into `component_library` table
2. Define relationships in `component_relationships`
3. Add to feature templates if applicable
4. Test with helper functions

## Maintenance

- Components can be deactivated by setting `is_active = false`
- Version field allows tracking component updates
- All tables include `created_at` and `updated_at` timestamps
- RLS policies ensure read-only access for regular users

## Security

- Only administrators can modify component data
- All components are read-accessible to authenticated users
- Sensitive configuration data should be stored encrypted